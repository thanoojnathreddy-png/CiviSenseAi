import React, { useState, useEffect } from 'react';
import { Mic, Square, RefreshCw, Volume2, Radio, Check, Edit2 } from 'lucide-react';
import { apiService } from '../../services/api';

interface VoiceRecorderProps {
  language: string;
  onTranscriptionComplete: (text: string, detectedLang: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  language,
  onTranscriptionComplete
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceSamples, setVoiceSamples] = useState<any[]>([]);
  const [reviewedText, setReviewedText] = useState<string | null>(null);
  const [detectedLang, setDetectedLang] = useState<string>(language);

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

  useEffect(() => {
    apiService.getVoiceSamples().then((samples) => {
      setVoiceSamples(samples);
    }).catch(console.error);
  }, []);

  const handleStartRecording = () => {
    setReviewedText(null);
    setIsRecording(true);
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    setIsProcessing(true);
    try {
      const res = await apiService.transcribeVoice({ language_hint: language });
      setReviewedText(res.transcribed_text);
      setDetectedLang(res.detected_language);
    } catch (err) {
      console.error('Transcription error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePresetSelect = async (sampleId: string) => {
    setIsProcessing(true);
    try {
      const res = await apiService.transcribeVoice({ sample_id: sampleId });
      setReviewedText(res.transcribed_text);
      setDetectedLang(res.detected_language);
    } catch (err) {
      console.error('Preset transcription error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptTranscribed = () => {
    if (reviewedText) {
      onTranscriptionComplete(reviewedText, detectedLang);
    }
  };

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
          <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
          <span>Multilingual Voice Input</span>
        </div>
        <span className="text-xs text-slate-500 font-mono">Recognizing: {language}</span>
      </div>

      {/* Recording Interaction Box */}
      <div className="flex flex-col items-center justify-center py-6 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-4">
        {isRecording ? (
          <div className="flex items-center gap-1.5 h-12 px-6">
            {[35, 70, 95, 60, 85, 40, 100, 75, 50, 80, 65, 90, 55, 70, 40].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-rose-500 rounded-full wave-bar transition-all"
                style={{
                  height: `${h}%`,
                  animationDelay: `${(i * 0.08)}s`
                }}
              />
            ))}
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
            <Mic className="w-7 h-7" />
          </div>
        )}

        <div className="text-center px-4">
          {isRecording ? (
            <div className="text-rose-600 font-mono text-sm font-bold flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              Recording your voice... 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
            </div>
          ) : isProcessing ? (
            <div className="text-blue-600 font-mono text-xs font-semibold flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Transcribing audio in {language}...
            </div>
          ) : (
            <div className="text-xs text-slate-600 font-medium max-w-sm">
              Press the button below and speak clearly in your native language about the infrastructure issue in your area.
            </div>
          )}
        </div>

        {/* Start / Stop Button */}
        <div className="flex items-center gap-3">
          {isRecording ? (
            <button
              type="button"
              onClick={handleStopRecording}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              Stop Recording & Review
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartRecording}
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              Start Voice Recording
            </button>
          )}
        </div>
      </div>

      {/* Recognized Speech Review Banner */}
      {reviewedText && (
        <div className="bg-white rounded-lg border border-blue-200 p-4 space-y-3 shadow-xs animate-fadeIn">
          <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-800">Transcribed Voice Request</span>
            <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Language: {detectedLang}
            </span>
          </div>

          <p className="text-xs text-slate-800 italic bg-slate-50 p-3 rounded border border-slate-200 leading-relaxed font-sans">
            "{reviewedText}"
          </p>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleStartRecording}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-slate-600 hover:text-slate-900 text-xs font-medium cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              Re-record
            </button>
            <button
              type="button"
              onClick={handleAcceptTranscribed}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Use This Voice Input
            </button>
          </div>
        </div>
      )}

      {/* Common Regional Voice Prompts */}
      <div className="pt-2 border-t border-slate-200">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
          Or Select a Sample Voice Recording in Regional Language:
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
