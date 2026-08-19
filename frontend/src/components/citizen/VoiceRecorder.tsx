import React, { useState, useEffect } from 'react';
import { Mic, Square, RefreshCw, Volume2, Radio } from 'lucide-react';
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
    setIsRecording(true);
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    setIsProcessing(true);
    try {
      const res = await apiService.transcribeVoice({ language_hint: language });
      onTranscriptionComplete(res.transcribed_text, res.detected_language);
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
      onTranscriptionComplete(res.transcribed_text, res.detected_language);
    } catch (err) {
      console.error('Preset transcription error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
          <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
          <span>Multilingual Voice Input</span>
        </div>
        <span className="text-xs text-slate-500 font-mono">Speech Recognition Engine</span>
      </div>

      {/* Main Recording Center */}
      <div className="flex flex-col items-center justify-center py-6 bg-white rounded-lg border border-slate-200 shadow-xs space-y-3">
        {isRecording ? (
          <div className="flex items-center gap-1.5 h-10 px-4">
            {[40, 75, 100, 60, 85, 30, 95, 70, 45, 80, 60, 90, 50, 75].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-rose-500 rounded-full wave-bar"
                style={{
                  height: `${h}%`,
                  animationDelay: `${(i * 0.1)}s`
                }}
              />
            ))}
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-inner">
            <Mic className="w-7 h-7" />
          </div>
        )}

        <div className="text-center">
          {isRecording ? (
            <div className="text-rose-600 font-mono text-sm font-bold flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
              Recording... 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
            </div>
          ) : isProcessing ? (
            <div className="text-blue-600 font-mono text-xs font-semibold flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Transcribing audio in {language}...
            </div>
          ) : (
            <div className="text-xs text-slate-500 font-medium">
              Click the microphone button to record your request in your language
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isRecording ? (
            <button
              type="button"
              onClick={handleStopRecording}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              Stop & Process Voice
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartRecording}
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              Record Voice Input
            </button>
          )}
        </div>
      </div>

      {/* Common Regional Voice Examples */}
      <div className="pt-2 border-t border-slate-200">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
          Or Select a Common Regional Voice Recording:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {voiceSamples.map((sample) => (
            <button
              key={sample.sample_id}
              type="button"
              onClick={() => handlePresetSelect(sample.sample_id)}
              className="flex items-start gap-2 p-2 rounded-md bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 text-left transition-all text-xs cursor-pointer"
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
