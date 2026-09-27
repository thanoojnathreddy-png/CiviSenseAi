import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Mic, Square, RefreshCw, Volume2, Radio, AlertCircle, Sparkles, Edit2 } from 'lucide-react';
import { apiService } from '../../services/api';
import { useTranslation, SUPPORTED_LANGUAGES, LanguageOption } from '../../i18n';

interface VoiceRecorderProps {
  language: string;
  onTranscriptionComplete: (text: string, detectedLang: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  language,
  onTranscriptionComplete
}) => {
  const { currentLanguage, supportedLanguages } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceSamples, setVoiceSamples] = useState<any[]>([]);
  const [reviewedText, setReviewedText] = useState<string | null>(null);
  const [detectedLang, setDetectedLang] = useState<string>(language);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef<boolean>(false);
  const isStoppingRef = useRef<boolean>(false);
  const finalTranscriptRef = useRef<string>('');
  const liveTranscriptRef = useRef<string>('');
  const stopTimeoutRef = useRef<any>(null);

  // Resolve speech recognition language option strictly according to selected input language
  const activeLangOption: LanguageOption = useMemo(() => {
    const clean = language.trim().toLowerCase();
    const matched =
      supportedLanguages.find((l) => l.name.toLowerCase() === clean) ||
      supportedLanguages.find((l) => l.code.toLowerCase() === clean) ||
      currentLanguage ||
      SUPPORTED_LANGUAGES[0];
    return matched;
  }, [language, supportedLanguages, currentLanguage]);

  // Recording duration timer
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Load preset demonstration voice prompts from backend
  useEffect(() => {
    apiService.getVoiceSamples().then((samples) => {
      setVoiceSamples(samples);
    }).catch(console.error);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      isStoppingRef.current = false;
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  // Finalize transcript and pass up to parent form
  const finalizeTranscription = (transcript: string) => {
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
    setIsProcessing(false);
    isStoppingRef.current = false;
    isRecordingRef.current = false;
    setIsRecording(false);

    const clean = transcript.trim();
    if (clean) {
      setReviewedText(clean);
      setDetectedLang(activeLangOption.name);
      setErrorMessage(null);
      // Directly populate into the citizen input box
      onTranscriptionComplete(clean, activeLangOption.name);
    } else {
      setErrorMessage('No speech was detected. Please speak closer to your microphone and try again, or enter your concern manually.');
    }
  };

  const handleStartRecording = () => {
    setErrorMessage(null);
    setReviewedText(null);
    setLiveTranscript('');
    finalTranscriptRef.current = '';
    liveTranscriptRef.current = '';
    isStoppingRef.current = false;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        'Native voice speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or enter your feedback manually.'
      );
      return;
    }

    try {
      // Abort any existing recognition instance
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = activeLangOption.speechLang || 'en-IN';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        isRecordingRef.current = true;
        setIsProcessing(false);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          const text = res[0].transcript;
          if (res.isFinal) {
            finalTranscriptRef.current += text + ' ';
          } else {
            interim += text;
          }
        }
        const combined = (finalTranscriptRef.current + ' ' + interim).trim();
        liveTranscriptRef.current = combined;
        setLiveTranscript(combined);
      };

      recognition.onerror = (event: any) => {
        console.warn('[SpeechRecognition] error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage('Microphone permission is required. Please allow microphone access in your browser to record your voice.');
          isRecordingRef.current = false;
          setIsRecording(false);
          setIsProcessing(false);
        } else if (event.error === 'language-not-supported') {
          setErrorMessage(`Speech recognition is not supported for ${activeLangOption.name} in this browser. Please type your feedback manually or select another language.`);
          isRecordingRef.current = false;
          setIsRecording(false);
          setIsProcessing(false);
        } else if (event.error === 'network') {
          setErrorMessage('Voice transcription is temporarily unavailable. Please try again or enter your feedback manually.');
          isRecordingRef.current = false;
          setIsRecording(false);
          setIsProcessing(false);
        } else if (event.error === 'no-speech') {
          // If we are actively stopping, no-speech is handled on onend
          if (!isStoppingRef.current) {
            // Keep listening if user momentarily paused
          }
        } else {
          setErrorMessage(`Voice recognition encountered an error (${event.error}). Please try again or enter your feedback manually.`);
          isRecordingRef.current = false;
          setIsRecording(false);
          setIsProcessing(false);
        }
      };

      recognition.onend = () => {
        if (isStoppingRef.current) {
          finalizeTranscription(finalTranscriptRef.current || liveTranscriptRef.current);
        } else if (isRecordingRef.current) {
          // Browser ended recognition prematurely while user still wants to record; restart
          try {
            recognition.start();
          } catch (e) {
            console.warn('[SpeechRecognition] restart onend caught:', e);
          }
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      console.error('[SpeechRecognition] Failed to initialize:', err);
      setErrorMessage('Could not initialize microphone. Please check your browser permissions or enter your feedback manually.');
      setIsRecording(false);
      isRecordingRef.current = false;
      setIsProcessing(false);
    }
  };

  const handleStopRecording = () => {
    if (!isRecordingRef.current && !recognitionRef.current) {
      return;
    }

    isRecordingRef.current = false;
    isStoppingRef.current = true;
    setIsRecording(false);
    setIsProcessing(true);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('[SpeechRecognition] stop error:', err);
      }
    }

    // Safety timeout in case recognition.onend does not fire within 1500ms
    stopTimeoutRef.current = setTimeout(() => {
      finalizeTranscription(finalTranscriptRef.current || liveTranscriptRef.current);
    }, 1500);
  };

  const handlePresetSelect = async (sampleId: string) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const res = await apiService.transcribeVoice({ sample_id: sampleId });
      setReviewedText(res.transcribed_text);
      setDetectedLang(res.detected_language);
      onTranscriptionComplete(res.transcribed_text, res.detected_language);
    } catch (err) {
      console.error('Preset transcription error:', err);
      setErrorMessage('Failed to load sample voice prompt. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isBrowserSupported = typeof window !== 'undefined' &&
    Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
      {/* Header with Active Recognition Language */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
          <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
          <span>Voice Intake</span>
        </div>
        <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-mono font-medium flex items-center gap-1.5">
          <span>{activeLangOption.flag}</span>
          <span>{activeLangOption.name} ({activeLangOption.speechLang})</span>
        </span>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Recording Interaction Box */}
      <div className="flex flex-col items-center justify-center py-6 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-4">
        {isRecording ? (
          <div className="flex items-center gap-1.5 h-12 px-6">
            {[35, 70, 95, 60, 85, 40, 100, 75, 50, 80, 65, 90, 55, 70, 40].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-rose-500 rounded-full transition-all animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDuration: `${0.6 + (i % 5) * 0.15}s`
                }}
              />
            ))}
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
            <Mic className="w-7 h-7" />
          </div>
        )}

        <div className="text-center px-4 max-w-md">
          {isRecording ? (
            <div className="space-y-1">
              <div className="text-rose-600 font-mono text-sm font-bold flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                <span>🎙 Recording... ({recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}s)</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Speak clearly in <span className="font-semibold text-slate-800">{activeLangOption.nativeName} ({activeLangOption.name})</span>
              </p>
              {liveTranscript && (
                <div className="mt-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 p-2.5 rounded italic text-left max-h-24 overflow-y-auto font-sans">
                  "{liveTranscript}"
                </div>
              )}
            </div>
          ) : isProcessing ? (
            <div className="text-blue-600 font-mono text-xs font-semibold flex items-center justify-center gap-2 py-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Processing voice... Transcribing in {activeLangOption.name}</span>
            </div>
          ) : (
            <div className="text-xs text-slate-600 font-medium">
              Click the microphone button to start speaking in <span className="font-bold text-slate-900">{activeLangOption.name}</span>. Browser will ask for microphone permission.
            </div>
          )}
        </div>

        {/* Start / Stop Button */}
        <div className="flex items-center gap-3">
          {isRecording ? (
            <button
              type="button"
              onClick={handleStopRecording}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>Stop Recording</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartRecording}
              disabled={isProcessing || !isBrowserSupported}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Start Recording</span>
            </button>
          )}
        </div>

        {!isBrowserSupported && (
          <p className="text-[11px] text-amber-700 font-medium px-4 text-center">
            ⚠️ Voice recognition requires Google Chrome or Microsoft Edge. You can also use the preset regional signals below.
          </p>
        )}
      </div>

      {/* Transcribed Speech Confirmation Banner */}
      {reviewedText && (
        <div className="bg-emerald-50/60 rounded-lg border border-emerald-200 p-4 space-y-2.5 shadow-xs animate-fadeIn">
          <div className="flex items-center justify-between text-xs border-b border-emerald-200/60 pb-2">
            <span className="font-bold text-emerald-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Transcript Transferred to Input Box</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300">
              {detectedLang}
            </span>
          </div>

          <p className="text-xs text-slate-800 italic bg-white p-3 rounded border border-emerald-200 leading-relaxed font-sans">
            "{reviewedText}"
          </p>

          <div className="flex items-center justify-between text-[11px] text-emerald-800 pt-1">
            <span>✅ Ready! You can review or edit the text directly in the box below before submitting.</span>
            <button
              type="button"
              onClick={handleStartRecording}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>Re-record</span>
            </button>
          </div>
        </div>
      )}

      {/* Common Regional Voice Prompts for Interactive Testing */}
      <div className="pt-2 border-t border-slate-200">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
          Or Try A Pre-Configured Regional Voice Signal:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {voiceSamples.map((sample) => (
            <button
              key={sample.sample_id}
              type="button"
              onClick={() => handlePresetSelect(sample.sample_id)}
              className="flex items-start gap-2 p-2 rounded-md bg-white hover:bg-blue-50/60 active:scale-98 border border-slate-200 hover:border-blue-300 text-left transition-all text-xs cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 truncate">{sample.title}</div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {sample.language} • {sample.district}, {sample.state}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
