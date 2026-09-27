import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Mic,
  Square,
  RefreshCw,
  Volume2,
  Radio,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useTranslation, SUPPORTED_LANGUAGES, LanguageOption } from '../../i18n';

export type VoiceRecordingState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SUCCESS' | 'ERROR';

interface VoiceRecorderProps {
  language: string;
  onTranscriptionComplete: (text: string, detectedLang: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  language,
  onTranscriptionComplete
}) => {
  const { currentLanguage, supportedLanguages } = useTranslation();

  const [voiceState, setVoiceState] = useState<VoiceRecordingState>('IDLE');
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [lastTranscribedText, setLastTranscribedText] = useState<string | null>(null);
  const [hasDetectedSpeech, setHasDetectedSpeech] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [voiceSamples, setVoiceSamples] = useState<any[]>([]);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const isStoppingRef = useRef<boolean>(false);
  const finalTranscriptRef = useRef<string>('');
  const liveTranscriptRef = useRef<string>('');
  const hasReceivedSpeechRef = useRef<boolean>(false);
  const stopTimeoutRef = useRef<any>(null);

  // Check Web Speech API browser availability
  const SpeechRecognitionClass = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
  }, []);

  const isBrowserSupported = Boolean(SpeechRecognitionClass);

  // Resolve speech recognition language option strictly from the selected language
  const activeLangOption: LanguageOption = useMemo(() => {
    const clean = (language || '').trim().toLowerCase();
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
    if (voiceState === 'LISTENING') {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [voiceState]);

  // Fetch preset demonstration voice samples from backend for quick regional testing
  useEffect(() => {
    apiService.getVoiceSamples().then((samples) => {
      setVoiceSamples(samples);
    }).catch((err) => {
      console.warn('[VoiceRecorder] Could not load sample voice prompts:', err);
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      isStoppingRef.current = false;
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Finalize successful transcript into the citizen feedback input
  const finalizeRecognition = useCallback(() => {
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }

    isListeningRef.current = false;
    isStoppingRef.current = false;

    const transcript = (finalTranscriptRef.current || liveTranscriptRef.current).trim();

    if (transcript.length > 0) {
      console.log('VOICE TRANSCRIPTION COMPLETE:', transcript);
      setVoiceState('SUCCESS');
      setLastTranscribedText(transcript);
      setErrorMessage(null);
      onTranscriptionComplete(transcript, activeLangOption.name);
    } else {
      console.log('VOICE ENDED WITH NO SPEECH DETECTED');
      setVoiceState('ERROR');
      setErrorMessage('No speech was detected in your recording. Please try speaking closer to your microphone, or enter your concern manually.');
    }
  }, [activeLangOption.name, onTranscriptionComplete]);

  // Start Voice Recognition
  const handleStartRecording = async () => {
    setErrorMessage(null);
    setLiveTranscript('');
    finalTranscriptRef.current = '';
    liveTranscriptRef.current = '';
    hasReceivedSpeechRef.current = false;
    setHasDetectedSpeech(false);
    isStoppingRef.current = false;

    // 1. Browser compatibility check
    if (!SpeechRecognitionClass) {
      setVoiceState('ERROR');
      setErrorMessage(
        'Voice input is not supported in this browser. Please use Chrome/Edge or enter your concern manually.'
      );
      return;
    }

    // 2. Microphone device and permission test via getUserMedia()
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setVoiceState('ERROR');
      setErrorMessage('Microphone access is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    try {
      // Test microphone access and verify permissions
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Correctly release microphone stream immediately so SpeechRecognition has exclusive access!
      stream.getTracks().forEach((track) => track.stop());
    } catch (err: any) {
      console.error('[Microphone] Permission/access error:', err);
      setVoiceState('ERROR');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone access is blocked. Please allow microphone access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No microphone was detected. Please connect a microphone and try again.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setErrorMessage('Microphone is already in use by another application.');
      } else {
        setErrorMessage('Could not access microphone. Please check your browser audio permissions.');
      }
      return;
    }

    // 3. Initialize fresh SpeechRecognition instance with the currently active language
    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }

      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = activeLangOption.speechLang || 'en-IN';
      recognition.maxAlternatives = 1;

      console.log('VOICE STARTED');
      console.log('LANGUAGE:', recognition.lang);

      recognition.onstart = () => {
        isListeningRef.current = true;
        setVoiceState('LISTENING');
        setErrorMessage(null);
        console.log('RECOGNITION ACTIVE: true');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          const text = res[0]?.transcript || '';
          if (res.isFinal) {
            final += text + ' ';
          } else {
            interim += text;
          }
        }

        const currentTotal = (final + interim).trim();
        if (currentTotal.length > 0) {
          hasReceivedSpeechRef.current = true;
          setHasDetectedSpeech(true);
          finalTranscriptRef.current = final.trim();
          liveTranscriptRef.current = currentTotal;
          setLiveTranscript(currentTotal);
          console.log('RESULT RECEIVED:', currentTotal);
        }
      };

      recognition.onerror = (event: any) => {
        console.log('VOICE ERROR:', event.error, event);

        // Chrome emits 'no-speech' on momentary pauses while speaking.
        // Do NOT abort or display error while user is actively in LISTENING state!
        if (event.error === 'no-speech') {
          console.log('[SpeechRecognition] Momentary pause in speech detected; continuing to listen.');
          return;
        }

        if (event.error === 'aborted') {
          return;
        }

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          isListeningRef.current = false;
          setVoiceState('ERROR');
          setErrorMessage('Microphone access is blocked. Please allow microphone access in your browser settings.');
          return;
        }

        if (event.error === 'audio-capture') {
          isListeningRef.current = false;
          setVoiceState('ERROR');
          setErrorMessage('No microphone was detected. Please connect a microphone and try again.');
          return;
        }

        if (event.error === 'language-not-supported') {
          isListeningRef.current = false;
          setVoiceState('ERROR');
          setErrorMessage(`Speech recognition is not supported for ${activeLangOption.name} (${activeLangOption.speechLang}) in this browser.`);
          return;
        }

        if (event.error === 'network') {
          console.warn('[SpeechRecognition] Network event received; keeping captured speech if any.');
          if (hasReceivedSpeechRef.current) {
            return;
          }
        }
      };

      recognition.onend = () => {
        console.log('VOICE ENDED, isListening:', isListeningRef.current, 'isStopping:', isStoppingRef.current);

        // If the user has not clicked Stop, Chrome ended continuous recognition on silence; seamlessly auto-resume
        if (isListeningRef.current && !isStoppingRef.current) {
          try {
            recognition.start();
            console.log('[SpeechRecognition] Auto-resumed continuous listening session');
          } catch (e) {
            console.warn('[SpeechRecognition] Auto-resume caught:', e);
          }
        } else if (isStoppingRef.current) {
          finalizeRecognition();
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      console.error('[SpeechRecognition] Failed to initialize:', err);
      setVoiceState('ERROR');
      setErrorMessage('Could not initialize speech recognition. Please try again or enter your feedback manually.');
    }
  };

  // Stop Voice Recognition
  const handleStopRecording = () => {
    if (!isListeningRef.current && !recognitionRef.current) {
      return;
    }

    isListeningRef.current = false;
    isStoppingRef.current = true;
    setVoiceState('PROCESSING');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('[SpeechRecognition] stop warning:', err);
      }
    }

    // Safety timeout in case onend does not fire promptly
    stopTimeoutRef.current = setTimeout(() => {
      finalizeRecognition();
    }, 700);
  };

  // Select regional voice prompt sample
  const handlePresetSelect = async (sampleId: string) => {
    setVoiceState('PROCESSING');
    setErrorMessage(null);
    try {
      const res = await apiService.transcribeVoice({ sample_id: sampleId });
      finalTranscriptRef.current = res.transcribed_text;
      liveTranscriptRef.current = res.transcribed_text;
      finalizeRecognition();
    } catch (err) {
      console.error('[VoiceRecorder] Preset transcription error:', err);
      setVoiceState('ERROR');
      setErrorMessage('Failed to load sample voice prompt. Please try again.');
    }
  };

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
      {/* Header with Active Recognition Language */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
          <Radio className={`w-4 h-4 ${voiceState === 'LISTENING' ? 'text-rose-600 animate-pulse' : 'text-blue-600'}`} />
          <span>Voice Intake</span>
        </div>
        <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-mono font-medium flex items-center gap-1.5">
          <span>{activeLangOption.flag}</span>
          <span>{activeLangOption.name} ({activeLangOption.speechLang})</span>
        </span>
      </div>

      {/* Error Alert Banner */}
      {voiceState === 'ERROR' && errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Recording Interaction Box */}
      <div className="flex flex-col items-center justify-center py-6 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-4">
        {/* Visual Icon / Waveform */}
        {voiceState === 'LISTENING' ? (
          <div className="flex items-center gap-1.5 h-12 px-6">
            {[35, 75, 95, 60, 90, 45, 100, 80, 50, 85, 65, 90, 55, 70, 40].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-rose-600 rounded-full transition-all animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDuration: `${0.5 + (i % 5) * 0.15}s`
                }}
              />
            ))}
          </div>
        ) : voiceState === 'PROCESSING' ? (
          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
            <RefreshCw className="w-7 h-7 animate-spin text-blue-600" />
          </div>
        ) : voiceState === 'SUCCESS' ? (
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
            <Mic className="w-7 h-7" />
          </div>
        )}

        {/* Status Labels */}
        <div className="text-center px-4 max-w-md space-y-1.5">
          {voiceState === 'LISTENING' ? (
            <div>
              <div className="text-rose-600 font-mono text-sm font-bold flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                <span>🔴 Listening... Speak now ({recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}s)</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                🎙 Listening in <span className="font-bold text-slate-900">{activeLangOption.nativeName} ({activeLangOption.name})</span>
              </p>

              {hasDetectedSpeech && (
                <div className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>✓ Speech detected</span>
                </div>
              )}

              {liveTranscript && (
                <div className="mt-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 p-3 rounded-lg italic text-left max-h-28 overflow-y-auto font-sans shadow-2xs">
                  "{liveTranscript}"
                </div>
              )}
            </div>
          ) : voiceState === 'PROCESSING' ? (
            <div className="text-blue-600 font-mono text-xs font-semibold flex items-center justify-center gap-2 py-1">
              <span>⏳ Processing voice... Finalizing transcript in {activeLangOption.name}</span>
            </div>
          ) : voiceState === 'SUCCESS' ? (
            <div className="text-emerald-700 text-xs font-semibold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>✓ Speech detected & added to feedback input</span>
            </div>
          ) : (
            <div className="text-xs text-slate-600 font-medium">
              Click the microphone to speak in <span className="font-bold text-slate-900">{activeLangOption.name}</span>.
            </div>
          )}
        </div>

        {/* Controls: Start / Stop / Retry Buttons */}
        <div className="flex items-center gap-3">
          {voiceState === 'LISTENING' ? (
            <button
              type="button"
              onClick={handleStopRecording}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>⏹ Stop Recording</span>
            </button>
          ) : voiceState === 'PROCESSING' ? (
            <button
              type="button"
              disabled
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-400 text-white text-xs font-bold shadow-sm cursor-not-allowed opacity-75"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Processing...</span>
            </button>
          ) : voiceState === 'SUCCESS' ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartRecording}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-98"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>🎙 Speak More</span>
              </button>
            </div>
          ) : voiceState === 'ERROR' ? (
            <button
              type="button"
              onClick={handleStartRecording}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-98"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>🎙 Try Again</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartRecording}
              disabled={!isBrowserSupported}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>🎙 Click to speak</span>
            </button>
          )}
        </div>

        {!isBrowserSupported && (
          <p className="text-[11px] text-amber-700 font-medium px-4 text-center">
            ⚠️ Voice input is not supported in this browser. Please use Chrome/Edge or enter your concern manually.
          </p>
        )}
      </div>

      {/* Transcribed Speech Confirmation Banner */}
      {lastTranscribedText && voiceState === 'SUCCESS' && (
        <div className="bg-emerald-50/60 rounded-lg border border-emerald-200 p-4 space-y-2.5 shadow-xs animate-fadeIn">
          <div className="flex items-center justify-between text-xs border-b border-emerald-200/60 pb-2">
            <span className="font-bold text-emerald-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Transcript added to feedback field</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300">
              {activeLangOption.name}
            </span>
          </div>

          <p className="text-xs text-slate-800 italic bg-white p-3 rounded border border-emerald-200 leading-relaxed font-sans">
            "{lastTranscribedText}"
          </p>

          <p className="text-[11px] text-emerald-800 pt-0.5">
            ✅ You can review and freely edit your text in the concern box below before submitting.
          </p>
        </div>
      )}

      {/* Pre-Configured Regional Voice Signals */}
      {voiceSamples.length > 0 && (
        <div className="pt-2 border-t border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            Or Test With A Pre-Configured Regional Voice Signal:
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
      )}
    </div>
  );
};
