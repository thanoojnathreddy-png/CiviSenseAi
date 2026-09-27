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

// Universal in-browser 16kHz 16-bit Mono WAV recorder
class AudioStreamRecorder {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private inputNode: MediaStreamAudioSourceNode | null = null;
  private audioBuffers: Float32Array[] = [];
  private inputSampleRate: number = 44100;

  async start(): Promise<void> {
    this.audioBuffers = [];
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioContextClass();
    this.inputSampleRate = this.audioContext.sampleRate;
    this.inputNode = this.audioContext.createMediaStreamSource(this.mediaStream);

    // Buffer size 4096 gives reliable, smooth chunks across all desktop and mobile browsers
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
    this.processor.onaudioprocess = (e) => {
      const channelData = e.inputBuffer.getChannelData(0);
      this.audioBuffers.push(new Float32Array(channelData));
    };

    this.inputNode.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
  }

  stop(): Blob | null {
    if (this.processor) {
      try { this.processor.disconnect(); } catch (e) {}
      this.processor = null;
    }
    if (this.inputNode) {
      try { this.inputNode.disconnect(); } catch (e) {}
      this.inputNode = null;
    }
    if (this.audioContext) {
      try { this.audioContext.close(); } catch (e) {}
      this.audioContext = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => {
        try { track.stop(); } catch (e) {}
      });
      this.mediaStream = null;
    }

    if (this.audioBuffers.length === 0) return null;

    // Concatenate all PCM chunks
    const totalLength = this.audioBuffers.reduce((acc, b) => acc + b.length, 0);
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const b of this.audioBuffers) {
      merged.set(b, offset);
      offset += b.length;
    }

    // Downsample to 16000 Hz for speech recognition models
    const targetSampleRate = 16000;
    const downsampled = this.downsample(merged, this.inputSampleRate, targetSampleRate);

    // Encode to standard 16-bit PCM WAV
    return this.encodeWAV(downsampled, targetSampleRate);
  }

  private downsample(buffer: Float32Array, fromRate: number, toRate: number): Float32Array {
    if (fromRate === toRate) return buffer;
    const ratio = fromRate / toRate;
    const newLength = Math.round(buffer.length / ratio);
    const result = new Float32Array(newLength);
    for (let i = 0; i < newLength; i++) {
      result[i] = buffer[Math.round(i * ratio)] || 0;
    }
    return result;
  }

  private encodeWAV(samples: Float32Array, sampleRate: number): Blob {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    // RIFF chunk descriptor
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, 'WAVE');
    // "fmt " sub-chunk
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true);  // AudioFormat (1 = PCM)
    view.setUint16(22, 1, true);  // NumChannels (1 = Mono)
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
    view.setUint16(32, 2, true);  // BlockAlign (NumChannels * BitsPerSample/8)
    view.setUint16(34, 16, true); // BitsPerSample (16 bits)
    // "data" sub-chunk
    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);

    // Write PCM 16-bit samples
    let index = 44;
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(index, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      index += 2;
    }

    return new Blob([view], { type: 'audio/wav' });
  }
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
  const audioRecorderRef = useRef<AudioStreamRecorder | null>(null);
  const isRecordingRef = useRef<boolean>(false);
  const isStoppingRef = useRef<boolean>(false);
  const finalTranscriptRef = useRef<string>('');
  const liveTranscriptRef = useRef<string>('');
  const browserSpeechFailedRef = useRef<boolean>(false);

  // Check Web Speech API browser support
  const SpeechRecognitionClass = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
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
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      if (audioRecorderRef.current) {
        try { audioRecorderRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  // Finalize successful transcript
  const finalizeSuccess = useCallback((transcript: string) => {
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
      setErrorMessage('No speech was detected. Please try speaking closer to your microphone and try again.');
    }
  }, [activeLangOption.name, onTranscriptionComplete]);

  // Start Voice Recording
  const handleStartRecording = async () => {
    setErrorMessage(null);
    setLiveTranscript('');
    finalTranscriptRef.current = '';
    liveTranscriptRef.current = '';
    isStoppingRef.current = false;
    browserSpeechFailedRef.current = false;

    // 1. Microphone device and permission check
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setVoiceState('ERROR');
      setErrorMessage('Microphone access is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    // 2. Start Hardware Audio Stream Recorder (Captures 16kHz WAV)
    try {
      const recorder = new AudioStreamRecorder();
      await recorder.start();
      audioRecorderRef.current = recorder;
    } catch (err: any) {
      console.error('[VoiceRecorder] getUserMedia error:', err);
      setVoiceState('ERROR');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone access was blocked. Please allow microphone access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No microphone was detected. Please connect a microphone and try again.');
      } else {
        setErrorMessage('Could not initialize microphone. Please check your browser audio permissions.');
      }
      return;
    }

    // Hardware recording successfully started
    isRecordingRef.current = true;
    setVoiceState('RECORDING');
    setErrorMessage(null);

    // 3. Simultaneously try browser Web Speech API for real-time live preview
    if (SpeechRecognitionClass) {
      try {
        if (recognitionRef.current) {
          try { recognitionRef.current.abort(); } catch (e) {}
        }

        const recognition = new SpeechRecognitionClass();
        recognition.lang = activeLangOption.speechLang || 'en-IN';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

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
          console.info('[SpeechRecognition] Browser speech engine message:', event.error);
          if (event.error === 'network' || event.error === 'service-not-allowed') {
            // Browser's Google Speech service is blocked or inaccessible.
            // Do NOT fail the recording! Audio is actively being recorded in WAV and will be transcribed via backend.
            browserSpeechFailedRef.current = true;
          }
        };

        recognition.onend = () => {
          // If browser speech ended while recording is still active, restart if not failed
          if (isRecordingRef.current && !browserSpeechFailedRef.current) {
            try { recognition.start(); } catch (e) {}
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('[SpeechRecognition] Browser speech recognition init ignored:', err);
        browserSpeechFailedRef.current = true;
      }
    } else {
      browserSpeechFailedRef.current = true;
    }
  };

  // Stop Voice Recording & Process Transcription
  const handleStopRecording = async () => {
    if (!isRecordingRef.current) return;

    isRecordingRef.current = false;
    isStoppingRef.current = true;
    setVoiceState('PROCESSING');

    // 1. Stop SpeechRecognition if running
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    // 2. Stop AudioStreamRecorder and retrieve 16kHz WAV Blob
    let audioBlob: Blob | null = null;
    if (audioRecorderRef.current) {
      try {
        audioBlob = audioRecorderRef.current.stop();
      } catch (e) {
        console.warn('[VoiceRecorder] Audio recorder stop warning:', e);
      }
      audioRecorderRef.current = null;
    }

    // 3. If browser speech recognition already captured words, use it immediately
    const capturedBrowserText = (finalTranscriptRef.current || liveTranscriptRef.current).trim();
    if (capturedBrowserText.length > 0) {
      finalizeSuccess(capturedBrowserText);
      return;
    }

    // 4. Otherwise, transcribe the recorded WAV audio via backend speech-to-text
    if (audioBlob && audioBlob.size > 1000) {
      try {
        const res = await apiService.uploadVoiceAudio(audioBlob, activeLangOption.name);
        if (res && res.transcribed_text && res.transcribed_text.trim()) {
          finalizeSuccess(res.transcribed_text);
          return;
        }
      } catch (err: any) {
        console.error('[VoiceRecorder] Backend audio transcription error:', err);
      }
    }

    // 5. Fallback: if no speech could be recognized
    setVoiceState('ERROR');
    setErrorMessage('No speech was detected in your recording. Please try speaking closer to your microphone, or enter your concern manually.');
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
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>🎙 Click to speak</span>
            </button>
          )}
        </div>
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
