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
  RotateCcw,
  Zap,
  Sliders
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
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [voiceSamples, setVoiceSamples] = useState<any[]>([]);
  const [audioLevels, setAudioLevels] = useState<number[]>([
    25, 40, 60, 35, 75, 50, 65, 85, 60, 40, 70, 50, 30, 55, 35
  ]);

  // Audio Recording Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Live Speech Recognition Preview Refs
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const liveTranscriptRef = useRef<string>('');

  // Check Web Speech API browser availability for live preview
  const SpeechRecognitionClass = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
  }, []);

  // Check MediaRecorder browser availability for real audio capture
  const isMediaRecorderSupported = useMemo(() => {
    return typeof window !== 'undefined' && typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);
  }, []);

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

  // Fetch preset demonstration voice samples from backend
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
      stopAllMedia();
    };
  }, []);

  const stopAllMedia = () => {
    isListeningRef.current = false;

    // Stop audio visualizer
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    analyserRef.current = null;

    // Stop media stream tracks
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    mediaRecorderRef.current = null;

    // Stop SpeechRecognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
  };

  // Start live audio frequency visualizer via Web Audio API
  const startAudioVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevels = () => {
        if (!isListeningRef.current) return;
        analyser.getByteFrequencyData(dataArray);

        const newLevels: number[] = [];
        const step = Math.max(1, Math.floor(dataArray.length / 15));
        for (let i = 0; i < 15; i++) {
          const val = dataArray[i * step] || 0;
          // Scale from 0-255 to 20-100%
          const pct = Math.max(20, Math.min(100, Math.round((val / 255) * 80 + 20)));
          newLevels.push(pct);
        }
        setAudioLevels(newLevels);
        animFrameRef.current = requestAnimationFrame(updateLevels);
      };

      animFrameRef.current = requestAnimationFrame(updateLevels);
    } catch (e) {
      console.warn('[AudioVisualizer] Failed to initialize visualizer:', e);
    }
  };

  // Start optional parallel SpeechRecognition for live interim caption preview
  const startLiveSpeechPreview = useCallback(() => {
    if (!SpeechRecognitionClass) return;

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = activeLangOption.speechLang || 'en-IN';
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          const text = res[0]?.transcript || '';
          if (res.isFinal) {
            final += text + ' ';
          } else {
            interim += text;
          }
        }
        const total = (final + ' ' + interim).trim();
        if (total.length > 0) {
          liveTranscriptRef.current = total;
          setLiveTranscript(total);
        }
      };

      // Suppress SpeechRecognition network/no-speech errors so MediaRecorder keeps recording cleanly!
      recognition.onerror = (event: any) => {
        console.log('[LiveSpeechPreview] SpeechRecognition event note:', event.error);
      };

      recognition.onend = () => {
        // Only restart if still actively listening
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.log('[LiveSpeechPreview] Live speech preview init note:', err);
    }
  }, [SpeechRecognitionClass, activeLangOption.speechLang]);

  // Start Voice Recording Session (MediaRecorder + Gemini AI STT)
  const handleStartRecording = async () => {
    setErrorMessage(null);
    setLiveTranscript('');
    liveTranscriptRef.current = '';
    audioChunksRef.current = [];

    // Pre-check browser microphone API support
    if (!isMediaRecorderSupported && !SpeechRecognitionClass) {
      setVoiceState('ERROR');
      setErrorMessage('Microphone recording is not supported in this browser. Please use Chrome, Edge, or Firefox, or select a regional sample below.');
      return;
    }

    try {
      // 1. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      audioStreamRef.current = stream;
      isListeningRef.current = true;
      setVoiceState('LISTENING');

      // 2. Start audio frequency visualizer
      startAudioVisualizer(stream);

      // 3. Negotiate best supported audio recording MIME format
      let selectedMime = 'audio/webm;codecs=opus';
      if (typeof MediaRecorder !== 'undefined') {
        if (!MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          if (MediaRecorder.isTypeSupported('audio/webm')) {
            selectedMime = 'audio/webm';
          } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            selectedMime = 'audio/mp4';
          } else if (MediaRecorder.isTypeSupported('audio/wav')) {
            selectedMime = 'audio/wav';
          } else {
            selectedMime = '';
          }
        }
      }

      const mediaRecorder = selectedMime
        ? new MediaRecorder(stream, { mimeType: selectedMime })
        : new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handler when recording completes and audio blob is compiled
      mediaRecorder.onstop = async () => {
        console.log('[VoiceRecorder] Audio recording stopped. Processing with Gemini AI...');
        const audioBlob = new Blob(audioChunksRef.current, {
          type: selectedMime || 'audio/webm'
        });

        if (audioBlob.size < 400) {
          // Empty or extremely short click
          if (liveTranscriptRef.current && liveTranscriptRef.current.trim().length > 0) {
            handleCompleteSuccess(liveTranscriptRef.current.trim(), activeLangOption.name);
          } else {
            setVoiceState('ERROR');
            setErrorMessage('No voice audio was detected. Please hold the microphone button, speak clearly, and click Stop.');
          }
          return;
        }

        try {
          // Upload audio blob to backend -> Google Gemini AI STT
          const res = await apiService.uploadVoiceAudio(audioBlob, activeLangOption.name);
          const transcript = (res.text || res.transcribed_text || '').trim();

          if (transcript.length > 0) {
            handleCompleteSuccess(transcript, res.detected_language || activeLangOption.name);
          } else {
            setVoiceState('ERROR');
            setErrorMessage('No intelligible speech was detected in your recording. Please hold the microphone closer, speak clearly, or select a regional voice sample below.');
          }
        } catch (apiErr: any) {
          console.error('[VoiceRecorder] Backend transcription error:', apiErr);
          setVoiceState('ERROR');
          setErrorMessage(apiErr?.message || 'Voice transcription failed on server. Please try again.');
        }
      };

      mediaRecorder.start(250); // Emit chunk every 250ms
      mediaRecorderRef.current = mediaRecorder;

      // 4. Start live caption preview in parallel
      startLiveSpeechPreview();

    } catch (err: any) {
      console.error('[VoiceRecorder] Microphone access error:', err);
      setVoiceState('ERROR');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone access is blocked. Please allow microphone permissions in your browser address bar.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No microphone device was found. Please plug in a microphone or headset.');
      } else {
        setErrorMessage('Could not initialize microphone recording. Please check your browser audio settings.');
      }
    }
  };

  // Stop Recording Session
  const handleStopRecording = () => {
    if (voiceState !== 'LISTENING') return;

    setVoiceState('PROCESSING');
    isListeningRef.current = false;

    // Stop visualizer animation
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (e) {}
      audioContextRef.current = null;
    }

    // Stop media stream tracks
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Stop SpeechRecognition
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    // Stop MediaRecorder (triggers onstop)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.warn('[VoiceRecorder] Error stopping MediaRecorder:', err);
      }
    }
  };

  // Helper when transcription succeeds
  const handleCompleteSuccess = (transcript: string, detectedLang: string) => {
    console.log('[VoiceRecorder] Transcription successful:', transcript, 'Language:', detectedLang);
    setVoiceState('SUCCESS');
    setLastTranscribedText(transcript);
    setDetectedLanguage(detectedLang);
    setErrorMessage(null);
    onTranscriptionComplete(transcript, detectedLang);
  };

  // Select regional voice prompt sample
  const handlePresetSelect = async (sampleId: string) => {
    setVoiceState('PROCESSING');
    setErrorMessage(null);
    try {
      const res = await apiService.transcribeVoice({ sample_id: sampleId });
      handleCompleteSuccess(res.transcribed_text, res.detected_language || activeLangOption.name);
    } catch (err) {
      console.error('[VoiceRecorder] Preset transcription error:', err);
      setVoiceState('ERROR');
      setErrorMessage('Failed to load sample voice prompt. Please try again.');
    }
  };

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
      {/* Header with Active Recognition Language and Gemini Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
          <Radio className={`w-4 h-4 ${voiceState === 'LISTENING' ? 'text-rose-600 animate-pulse' : 'text-blue-600'}`} />
          <span>Multilingual Voice Intake</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
            <Zap className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" />
            <span>Gemini AI Speech-to-Text</span>
          </span>
        </div>
        <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 shadow-2xs">
          <span>{activeLangOption.flag}</span>
          <span>{activeLangOption.name}</span>
          <span className="text-[10px] text-blue-500 font-mono">({activeLangOption.nativeName})</span>
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
        {/* Dynamic Waveform Visualizer */}
        {voiceState === 'LISTENING' ? (
          <div className="flex items-center gap-1.5 h-14 px-6 bg-rose-50/50 rounded-xl border border-rose-100/80">
            {audioLevels.map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-gradient-to-t from-rose-600 to-rose-400 rounded-full transition-all duration-75 shadow-xs"
                style={{
                  height: `${h}%`
                }}
              />
            ))}
          </div>
        ) : voiceState === 'PROCESSING' ? (
          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs animate-pulse">
            <RefreshCw className="w-7 h-7 animate-spin text-blue-600" />
          </div>
        ) : voiceState === 'SUCCESS' ? (
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs hover:scale-105 transition-transform">
            <Mic className="w-7 h-7" />
          </div>
        )}

        {/* Status Labels */}
        <div className="text-center px-4 max-w-md space-y-1.5">
          {voiceState === 'LISTENING' ? (
            <div>
              <div className="text-rose-600 font-mono text-sm font-bold flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                <span>🔴 Recording Voice... ({recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}s)</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                🎙 Speak naturally in <span className="font-bold text-slate-900">{activeLangOption.nativeName} ({activeLangOption.name})</span>
              </p>

              {liveTranscript && (
                <div className="mt-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 p-3 rounded-lg italic text-left max-h-24 overflow-y-auto font-sans shadow-2xs">
                  "{liveTranscript}"
                </div>
              )}
            </div>
          ) : voiceState === 'PROCESSING' ? (
            <div className="space-y-1 py-1">
              <div className="text-blue-600 font-semibold text-xs flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
                <span>Transcribing with Google Gemini AI ({activeLangOption.name})...</span>
              </div>
              <p className="text-[11px] text-slate-500">Processing audio waveform and extracting verbatim multilingual text</p>
            </div>
          ) : voiceState === 'SUCCESS' ? (
            <div className="text-emerald-700 text-xs font-semibold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>✓ Speech recognized with Gemini AI & added to concern field</span>
            </div>
          ) : (
            <div className="text-xs text-slate-600 font-medium">
              Click the microphone button to record your voice in <span className="font-bold text-slate-900">{activeLangOption.name}</span>.
            </div>
          )}
        </div>

        {/* Action Controls: Start / Stop / Retry */}
        <div className="flex items-center gap-3">
          {voiceState === 'LISTENING' ? (
            <button
              type="button"
              onClick={handleStopRecording}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>⏹ Stop Recording & Transcribe</span>
            </button>
          ) : voiceState === 'PROCESSING' ? (
            <button
              type="button"
              disabled
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-400 text-white text-xs font-bold shadow-sm cursor-not-allowed opacity-80"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Transcribing with Gemini AI...</span>
            </button>
          ) : voiceState === 'SUCCESS' ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartRecording}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-98"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>🎙 Record More Audio</span>
              </button>
            </div>
          ) : voiceState === 'ERROR' ? (
            <button
              type="button"
              onClick={handleStartRecording}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-98"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>🎙 Try Recording Again</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartRecording}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>🎙 Click to Speak</span>
            </button>
          )}
        </div>
      </div>

      {/* Transcribed Speech Confirmation Banner */}
      {lastTranscribedText && voiceState === 'SUCCESS' && (
        <div className="bg-emerald-50/70 rounded-lg border border-emerald-200 p-4 space-y-2.5 shadow-xs animate-fadeIn">
          <div className="flex items-center justify-between text-xs border-b border-emerald-200/60 pb-2">
            <span className="font-bold text-emerald-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Gemini AI Transcript added to feedback field</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
              {detectedLanguage || activeLangOption.name}
            </span>
          </div>

          <p className="text-xs text-slate-800 italic bg-white p-3 rounded border border-emerald-200 leading-relaxed font-sans shadow-2xs">
            "{lastTranscribedText}"
          </p>

          <p className="text-[11px] text-emerald-800 pt-0.5 flex items-center gap-1">
            <span>✅</span>
            <span>The text has been automatically copied into the concern description below. You can review or edit it freely before submitting.</span>
          </p>
        </div>
      )}

      {/* Pre-Configured Regional Voice Signals for quick testing */}
      {voiceSamples.length > 0 && (
        <div className="pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Or Test With A Pre-Configured Regional Voice Signal:
            </span>
            <span className="text-[10px] text-slate-400 font-mono">1-click test</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {voiceSamples.map((sample) => (
              <button
                key={sample.sample_id}
                type="button"
                onClick={() => handlePresetSelect(sample.sample_id)}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-white hover:bg-blue-50/70 active:scale-98 border border-slate-200 hover:border-blue-300 text-left transition-all text-xs cursor-pointer shadow-2xs"
              >
                <Volume2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 truncate">{sample.title}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
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
