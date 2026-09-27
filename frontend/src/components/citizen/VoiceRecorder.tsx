import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Mic,
  Square,
  RefreshCw,
  Volume2,
  Radio,
  AlertCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useTranslation, SUPPORTED_LANGUAGES, LanguageOption } from '../../i18n';

export type VoiceRecordingState = 'IDLE' | 'RECORDING' | 'PROCESSING' | 'SUCCESS' | 'ERROR';

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [voiceSamples, setVoiceSamples] = useState<any[]>([]);

  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef<boolean>(false);
  const isStoppingRef = useRef<boolean>(false);
  const finalTranscriptRef = useRef<string>('');
  const liveTranscriptRef = useRef<string>('');
  const stopTimeoutRef = useRef<any>(null);

  // Check Web Speech API browser support
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
    if (voiceState === 'RECORDING') {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [voiceState]);

  // Fetch preset demonstration voice samples from backend for testing
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
      isRecordingRef.current = false;
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

  // Finalize successful transcript
  const finalizeSuccess = useCallback((transcript: string) => {
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
    isRecordingRef.current = false;
    isStoppingRef.current = false;

    const clean = transcript.trim();
    if (clean) {
      setVoiceState('SUCCESS');
      setLastTranscribedText(clean);
      setErrorMessage(null);
      onTranscriptionComplete(clean, activeLangOption.name);
    } else {
      setVoiceState('ERROR');
      setErrorMessage('No speech was detected. Please try again.');
    }
  }, [activeLangOption.name, onTranscriptionComplete]);

  // Start Voice Recording
  const handleStartRecording = async () => {
    setErrorMessage(null);
    setLiveTranscript('');
    finalTranscriptRef.current = '';
    liveTranscriptRef.current = '';
    isStoppingRef.current = false;

    // 1. Browser compatibility check
    if (!SpeechRecognitionClass) {
      setVoiceState('ERROR');
      setErrorMessage(
        'Voice input is not supported in this browser. Please use a supported browser (such as Google Chrome or Microsoft Edge) or enter your feedback manually.'
      );
      return;
    }

    // 2. Hardware / Device availability check
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasAudioInput = devices.some((d) => d.kind === 'audioinput');
        if (devices.length > 0 && !hasAudioInput) {
          setVoiceState('ERROR');
          setErrorMessage('No microphone was detected. Please connect a microphone and try again.');
          return;
        }
      } catch (err) {
        console.warn('[VoiceRecorder] enumerateDevices warning:', err);
      }
    }

    // 3. Permission pre-check if Permissions API is available
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (permissionStatus.state === 'denied') {
          setVoiceState('ERROR');
          setErrorMessage(
            'Microphone access was blocked. Please allow microphone access in your browser settings.'
          );
          return;
        }
      } catch (err) {
        // Permissions query for microphone is not supported in all browsers; continue to SpeechRecognition
      }
    }

    // 4. Initialize SpeechRecognition instance
    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }

      const recognition = new SpeechRecognitionClass();
      recognition.lang = activeLangOption.speechLang || 'en-IN';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isRecordingRef.current = true;
        setVoiceState('RECORDING');
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const text = result[0]?.transcript || '';
          if (result.isFinal) {
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
        console.error('[SpeechRecognition] Technical error event:', event.error, event);
        const captured = (finalTranscriptRef.current || liveTranscriptRef.current).trim();

        // If user already clicked stop or speech was captured, preserve it rather than throwing error
        if (isStoppingRef.current && captured) {
          finalizeSuccess(captured);
          return;
        }

        isRecordingRef.current = false;
        setVoiceState('ERROR');

        switch (event.error) {
          case 'not-allowed':
          case 'permission-denied':
            setErrorMessage('Microphone permission was denied. Please allow microphone access in your browser settings.');
            break;
          case 'audio-capture':
            setErrorMessage('No microphone was detected. Please check your microphone connection and system audio settings.');
            break;
          case 'no-speech':
            if (captured) {
              finalizeSuccess(captured);
            } else {
              setErrorMessage('No speech was detected. Please try again.');
            }
            break;
          case 'network':
            if (captured) {
              finalizeSuccess(captured);
            } else {
              setErrorMessage('Speech recognition requires a network connection. Please check your internet connection or Google Speech service accessibility.');
            }
            break;
          case 'service-not-allowed':
            setErrorMessage('Speech recognition service is currently unavailable or disabled in this browser.');
            break;
          case 'language-not-supported':
            setErrorMessage(`Speech recognition is not supported for ${activeLangOption.name} in this browser. Please type your feedback manually or select another language.`);
            break;
          case 'aborted':
            if (captured) {
              finalizeSuccess(captured);
            } else if (!isStoppingRef.current) {
              setVoiceState('IDLE');
              setErrorMessage(null);
            }
            break;
          default:
            if (captured) {
              finalizeSuccess(captured);
            } else {
              setErrorMessage(`Speech recognition encountered an issue (${event.error}). Please try again or enter your feedback manually.`);
            }
            break;
        }
      };

      recognition.onend = () => {
        if (isStoppingRef.current) {
          const captured = (finalTranscriptRef.current || liveTranscriptRef.current).trim();
          if (captured) {
            finalizeSuccess(captured);
          } else {
            setVoiceState('ERROR');
            setErrorMessage('No speech was detected. Please try again.');
          }
        } else if (isRecordingRef.current) {
          // Chrome may pause stream after long silence; restart if user is still in recording state
          try {
            recognition.start();
          } catch (err) {
            console.warn('[SpeechRecognition] restart onend caught:', err);
          }
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      console.error('[SpeechRecognition] Failed to start:', err);
      setVoiceState('ERROR');
      if (err.name === 'NotAllowedError') {
        setErrorMessage('Microphone permission was denied. Please allow microphone access in your browser settings.');
      } else {
        setErrorMessage('Could not initialize microphone. Please check your browser permissions or enter your feedback manually.');
      }
    }
  };

  // Stop Voice Recording
  const handleStopRecording = () => {
    if (!isRecordingRef.current && !recognitionRef.current) {
      return;
    }

    isRecordingRef.current = false;
    isStoppingRef.current = true;
    setVoiceState('PROCESSING');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('[SpeechRecognition] stop warning:', err);
      }
    }

    // Safety timeout in case onend takes longer than 1200ms
    stopTimeoutRef.current = setTimeout(() => {
      const captured = (finalTranscriptRef.current || liveTranscriptRef.current).trim();
      if (captured) {
        finalizeSuccess(captured);
      } else if (voiceState === 'PROCESSING') {
        setVoiceState('ERROR');
        setErrorMessage('No speech was detected. Please try again.');
      }
    }, 1200);
  };

  // Select regional voice prompt sample
  const handlePresetSelect = async (sampleId: string) => {
    setVoiceState('PROCESSING');
    setErrorMessage(null);
    try {
      const res = await apiService.transcribeVoice({ sample_id: sampleId });
      finalizeSuccess(res.transcribed_text);
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
          <Radio className={`w-4 h-4 ${voiceState === 'RECORDING' ? 'text-rose-600 animate-pulse' : 'text-blue-600'}`} />
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
        {voiceState === 'RECORDING' ? (
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
        <div className="text-center px-4 max-w-md space-y-1">
          {voiceState === 'RECORDING' ? (
            <div>
              <div className="text-rose-600 font-mono text-sm font-bold flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                <span>🔴 Listening... ({recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}s)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Speak clearly in <span className="font-semibold text-slate-800">{activeLangOption.nativeName} ({activeLangOption.name})</span>
              </p>
              {liveTranscript && (
                <div className="mt-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 p-2.5 rounded italic text-left max-h-24 overflow-y-auto font-sans">
                  "{liveTranscript}"
                </div>
              )}
            </div>
          ) : voiceState === 'PROCESSING' ? (
            <div className="text-blue-600 font-mono text-xs font-semibold flex items-center justify-center gap-2 py-1">
              <span>⏳ Processing voice... Transcribing in {activeLangOption.name}</span>
            </div>
          ) : voiceState === 'SUCCESS' ? (
            <div className="text-emerald-700 text-xs font-semibold">
              ✅ Transcript added to feedback field
            </div>
          ) : (
            <div className="text-xs text-slate-600 font-medium">
              Click the microphone to start speaking in <span className="font-bold text-slate-900">{activeLangOption.name}</span>.
            </div>
          )}
        </div>

        {/* Controls: Start / Stop Button */}
        <div className="flex items-center gap-3">
          {voiceState === 'RECORDING' ? (
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
              <span>Transcribing...</span>
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
            ⚠️ Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge, or use the pre-configured regional voice signals below.
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
