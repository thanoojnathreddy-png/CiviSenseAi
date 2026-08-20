import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { VoiceRecorder } from './VoiceRecorder';
import { LiveAIExtractor } from './LiveAIExtractor';
import { apiService } from '../../services/api';
import { AIStructuredExtraction } from '../../types';
import {
  Send,
  CheckCircle2,
  MapPin,
  Globe,
  Sparkles,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Edit3,
  Check,
  Clock,
  HelpCircle,
  FileText,
  AlertCircle
} from 'lucide-react';

export const CitizenPortal: React.FC = () => {
  const { setMainTab, setAuthoritySubTab, refreshData, setLiveNotification } = useApp();

  const [language, setLanguage] = useState<string>('Telugu');
  const [district, setDistrict] = useState<string>('Warangal');
  const [locality, setLocality] = useState<string>('Chennaraopet Mandal');
  const [inputText, setInputText] = useState<string>('మా గ్రామంలో రోడ్డు సరిగా లేదు. వర్షాకాలంలో పిల్లలు బడికి వెళ్లడానికి చాలా ఇబ్బంది పడుతున్నారు. అంబులెన్స్ కూడా రాలేకపోతోంది.');
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('voice');
  const [isVoiceSubmitted, setIsVoiceSubmitted] = useState<boolean>(true);

  // Progressive Stages: 'form' -> 'processing' -> 'confirm_interpretation' -> 'submitted'
  const [portalStage, setPortalStage] = useState<'form' | 'processing' | 'confirm_interpretation' | 'submitted'>('form');
  const [processingStep, setProcessingStep] = useState<number>(0);

  const [aiExtraction, setAiExtraction] = useState<AIStructuredExtraction | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);

  // Sample prompts
  const samplePrompts: Record<string, Array<{ label: string; text: string }>> = {
    Telugu: [
      {
        label: 'రోడ్డు సమస్య (Rural Road)',
        text: 'మా గ్రామంలో రోడ్డు సరిగా లేదు. వర్షాకాలంలో పిల్లలు బడికి వెళ్లడానికి చాలా ఇబ్బంది పడుతున్నారు. అంబులెన్స్ కూడా రాలేకపోతోంది.'
      },
      {
        label: 'కలుషిత నీరు (Drinking Water Contamination)',
        text: 'మా ఆదివాసీ గూడెంలో బోరుబావుల్లో నీరు కలుషితమైంది. చాలా మంది పిల్లలు కామెర్లు మరియు డయేరియాతో బాధపడుతున్నారు.'
      },
      {
        label: 'ఆసుపత్రి అంబులెన్స్ (Hospital Emergency)',
        text: 'మా మండల ఆసుపత్రిలో అంబులెన్స్ సదుపాయం లేదు. రాత్రి వేళల్లో ప్రమాదాలు జరిగితే క్షతగాత్రులను తీసుకెళ్లడానికి ఇబ్బందిగా ఉంది.'
      }
    ],
    Hindi: [
      {
        label: 'पीने का पानी (Water Supply)',
        text: 'हमारे इलाके में पिछले 3 हफ्तों से पीने का साफ पानी नहीं आ रहा है, अस्पताल में मरीज बढ़ रहे हैं।'
      },
      {
        label: 'स्वास्थ्य केंद्र (PHC Staff Shortage)',
        text: 'हमारे प्राथमिक स्वास्थ्य उपकेंद्र में कोई डॉक्टर या नर्स उपलब्ध नहीं है, आपातकालीन स्थिति में 40 किलोमीटर दूर जाना पड़ता है।'
      },
      {
        label: 'स्कूल बिजली (School Electrification)',
        text: 'हमारे ब्लॉक के प्राथमिक विद्यालय में बरसात के समय जलभराव हो जाता है और बिजली का कनेक्शन नहीं है।'
      }
    ],
    English: [
      {
        label: 'Hospital Power Failure',
        text: 'The Community Health Centre in Kalyanadurg suffers 6-hour daily power cuts with no generator backup. Oxygen concentrators stop working.'
      },
      {
        label: 'Agricultural Road Erosion',
        text: 'The connecting road link to the main market yard is severely damaged. Farmers cannot transport produce safely.'
      }
    ],
    Portuguese: [
      {
        label: 'Queda de Ponte Rural',
        text: 'A ponte de madeira que liga nossa comunidade rural à cidade principal está desabando. O ônibus escolar não consegue passar.'
      }
    ]
  };

  useEffect(() => {
    if (!inputText.trim()) {
      setAiExtraction(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsAnalyzing(true);
      try {
        const res = await apiService.analyzeText({
          text: inputText,
          language: language,
          district: district
        });
        setAiExtraction(res.extraction);
      } catch (err) {
        console.error('Error during AI analysis:', err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [inputText, language, district]);

  const handleVoiceTranscribed = (transcribedText: string, detectedLang: string) => {
    setInputText(transcribedText);
    setIsVoiceSubmitted(true);
    if (detectedLang) {
      setLanguage(detectedLang);
    }
  };

  // Trigger Progressive Processing Sequence
  const handleInitiateSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setPortalStage('processing');
    setProcessingStep(1);

    // Step 1 -> Step 2
    setTimeout(() => {
      setProcessingStep(2);
    }, 280);

    // Step 2 -> Step 3
    setTimeout(() => {
      setProcessingStep(3);
    }, 560);

    // Step 3 -> Step 4
    setTimeout(() => {
      setProcessingStep(4);
    }, 840);

    // Step 4 -> Show Interpretation Confirmation
    setTimeout(() => {
      setPortalStage('confirm_interpretation');
    }, 1150);
  };

  // Final Confirmation & Submission to Backend
  const handleFinalConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      const stateMap: Record<string, string> = {
        Warangal: 'Telangana',
        Adilabad: 'Telangana',
        Anantapur: 'Andhra Pradesh',
        Kurnool: 'Andhra Pradesh',
        Yavatmal: 'Maharashtra',
        'Varanasi Rural': 'Uttar Pradesh',
        Jequitinhonha: 'Minas Gerais',
        Vhembe: 'Limpopo'
      };

      const countryMap: Record<string, string> = {
        Jequitinhonha: 'Brazil',
        Vhembe: 'South Africa'
      };

      const res = await apiService.submitRequest({
        text: inputText,
        language: language,
        country: countryMap[district] || 'India',
        state: stateMap[district] || 'Telangana',
        district: district,
        locality: locality,
        is_voice: isVoiceSubmitted
      });

      setSubmissionResult(res);
      setPortalStage('submitted');
      setLiveNotification({
        message: `✅ Community need #${res.request.request_id} recorded in ${district}.`,
        type: 'success'
      });
      await refreshData();
    } catch (err) {
      console.error('Submission error:', err);
      alert('Failed to submit citizen request. Please try again.');
      setPortalStage('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmissionResult(null);
    setInputText('');
    setAiExtraction(null);
    setPortalStage('form');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold uppercase tracking-wider font-mono">
                Digital Public Good Intake
              </span>
              <span className="text-xs text-slate-500">Citizen Development Feedback</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              What does your community need?
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Voice or write your neighborhood or village infrastructure challenge in your native language. 
              Your request is analyzed, grouped with local community signals, and provided directly to public planning authorities.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs text-slate-600 self-start md:self-auto">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <div className="font-semibold text-slate-800">Public Service Channel</div>
              <div className="text-[11px] text-slate-500">Aggregated for community planning</div>
            </div>
          </div>
        </div>
      </div>

      {/* STAGE 2: Progressive AI Processing Animation */}
      {portalStage === 'processing' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-10 max-w-xl mx-auto text-center space-y-6 animate-fadeIn">
          <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto shadow-inner">
            <Sparkles className="w-6 h-6 animate-pulse text-blue-600" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">Understanding your request</h2>
            <p className="text-xs text-slate-500 mt-1">Analyzing civic signals with transparent multilingual NLP</p>
          </div>

          {/* Sequential Checkpoints */}
          <div className="space-y-3 text-left max-w-sm mx-auto text-xs">
            <div className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
              processingStep >= 1 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-50 text-slate-400'
            }`}>
              <CheckCircle2 className={`w-4 h-4 ${processingStep >= 1 ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span className="font-medium">1. Language identified ({language})</span>
            </div>

            <div className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
              processingStep >= 2 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-50 text-slate-400'
            }`}>
              <CheckCircle2 className={`w-4 h-4 ${processingStep >= 2 ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span className="font-medium">2. Community issue identified ({aiExtraction?.category || 'Infrastructure'})</span>
            </div>

            <div className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
              processingStep >= 3 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-50 text-slate-400'
            }`}>
              <CheckCircle2 className={`w-4 h-4 ${processingStep >= 3 ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span className="font-medium">3. Location matched ({district}, {locality})</span>
            </div>

            <div className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
              processingStep >= 4 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-50 text-slate-400'
            }`}>
              <CheckCircle2 className={`w-4 h-4 ${processingStep >= 4 ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span className="font-medium">4. Urgency & impact assessed ({aiExtraction?.urgency || 'High'} urgency)</span>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: AI Interpretation Confirmation (Human in the loop) */}
      {portalStage === 'confirm_interpretation' && (
        <div className="bg-white rounded-2xl border border-blue-200 shadow-md p-8 max-w-2xl mx-auto space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                AI Interpretation
              </span>
              <span className="text-xs text-slate-500 font-medium">Verify your concern before recording</span>
            </div>
            <span className="text-xs font-mono text-slate-400">Step 2 of 2</span>
          </div>

          <div className="space-y-2">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">We understood this as:</span>
            <h2 className="text-xl font-extrabold text-slate-900">
              {aiExtraction?.subcategory || 'Rural Infrastructure Need'}
            </h2>
            <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-200 leading-relaxed italic">
              "{aiExtraction?.translated_text || inputText}"
            </p>
          </div>

          {/* Structured Summary Badges */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Location</span>
              <span className="font-bold text-slate-900">{district}</span>
              <span className="text-[10px] text-slate-500 block truncate">{locality}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Category</span>
              <span className="font-bold text-blue-700">{aiExtraction?.category || 'Transportation'}</span>
              <span className="text-[10px] text-slate-500 block">{aiExtraction?.affected_group || 'Residents'}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Urgency Level</span>
              <span className="font-bold text-rose-700">{aiExtraction?.urgency || 'High'}</span>
              <span className="text-[10px] text-slate-500 block font-mono">Severity: {aiExtraction?.severity || 8}/10</span>
            </div>
          </div>

          {/* Human Validation Prompt */}
          <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>Is this interpretation accurate for your community?</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed font-normal">
              Confirming allows the platform to group your request with neighboring signals and alert public planners. You can edit the text if anything was misunderstood.
            </p>
          </div>

          {/* Confirmation Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPortalStage('form')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Concern</span>
            </button>

            <button
              type="button"
              onClick={handleFinalConfirmSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Recording in Community Analytics...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Yes, Confirm & Record Request</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4: Final Submission Confirmation */}
      {portalStage === 'submitted' && submissionResult && (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-md p-8 text-center max-w-2xl mx-auto space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Request ID: {submissionResult.request?.request_id || 'REQ-TE-9042'}
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-3">
              Your community need has been recorded.
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Recorded on {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} for {submissionResult.request?.district} ({submissionResult.request?.locality || 'Rural Sector'}).
            </p>
          </div>

          {/* What Happens Next Guidance Box */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-left space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>What happens next?</span>
            </div>
            
            <p className="text-xs text-slate-700 leading-relaxed font-normal">
              Your request contributes to community-level analysis. Similar requests are grouped to help public authorities identify areas where infrastructure or public services may need attention.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-200">
              <div>
                <span className="text-slate-500 text-[11px] block">Correlated Community Demand</span>
                <span className="font-bold text-blue-700 font-mono text-sm">
                  {submissionResult.community_impact?.total_correlated_requests || 42} Citizen Signals
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Identified Sector</span>
                <span className="font-bold text-slate-900">
                  {submissionResult.community_impact?.category || 'Transportation'}
                </span>
              </div>
            </div>
          </div>

          {/* Privacy Explanation */}
          <div className="text-[11px] text-slate-500 bg-white p-3 rounded-lg border border-slate-200 text-left flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Privacy Guaranteed:</strong> Feedback is aggregated at the community and mandal level to guide public works planning without publishing personal citizen identifiers.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setAuthoritySubTab('needs');
                setMainTab('authority');
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <span>Explore Community Priorities in Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              Share Another Need
            </button>
          </div>
        </div>
      )}

      {/* STAGE 1: Standard Intake Form */}
      {portalStage === 'form' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Intake (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
            <form onSubmit={handleInitiateSubmission} className="space-y-5">
              {/* Location & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Language Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    <span>Select Language / భాష</span>
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="Telugu">తెలుగు (Telugu - India)</option>
                    <option value="Hindi">हिन्दी (Hindi - India)</option>
                    <option value="English">English (Universal)</option>
                    <option value="Portuguese">Português (Brazil)</option>
                  </select>
                </div>

                {/* District Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>District / Administrative Region</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      setLocality(`${e.target.value} Sector`);
                    }}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    <optgroup label="India - Telangana">
                      <option value="Warangal">Warangal (Rural Roads Focus)</option>
                      <option value="Adilabad">Adilabad (Water & Healthcare Focus)</option>
                    </optgroup>
                    <optgroup label="India - Andhra Pradesh">
                      <option value="Anantapur">Anantapur (Healthcare Power Focus)</option>
                      <option value="Kurnool">Kurnool (Drainage & Waste Focus)</option>
                    </optgroup>
                    <optgroup label="India - Maharashtra & UP">
                      <option value="Yavatmal">Yavatmal (Water Supply Focus)</option>
                      <option value="Varanasi Rural">Varanasi Rural (School Infrastructure)</option>
                    </optgroup>
                    <optgroup label="BRICS Partner Regions">
                      <option value="Jequitinhonha">Jequitinhonha (Minas Gerais, Brazil)</option>
                      <option value="Vhembe">Vhembe (Limpopo, South Africa)</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Mode Switcher: Speak Concern vs Write Concern */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setInputMode('voice')}
                  className={`flex-1 py-2 rounded-md transition-all cursor-pointer ${
                    inputMode === 'voice'
                      ? 'bg-white text-blue-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🎙️ Speak your concern (వాయిస్)
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('text')}
                  className={`flex-1 py-2 rounded-md transition-all cursor-pointer ${
                    inputMode === 'text'
                      ? 'bg-white text-blue-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ✍️ Write your concern (టెక్స్ట్)
                </button>
              </div>

              {/* Voice Recorder Component */}
              {inputMode === 'voice' && (
                <VoiceRecorder
                  language={language}
                  onTranscriptionComplete={handleVoiceTranscribed}
                />
              )}

              {/* Text Input Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Describe the Infrastructure Concern</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {inputText.length} characters
                  </span>
                </label>
                <textarea
                  rows={4}
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setIsVoiceSubmitted(false);
                  }}
                  placeholder="Describe your village or community infrastructure need in detail..."
                  className="w-full text-xs leading-relaxed bg-white border border-slate-300 rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-sans"
                />
              </div>

              {/* Sample Prompts */}
              {samplePrompts[language] && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Example issues in {language}:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {samplePrompts[language].map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setInputText(p.text);
                          setIsVoiceSubmitted(false);
                        }}
                        className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-slate-700 transition-all text-left cursor-pointer active:scale-98"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Locality */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mandal / Village / Neighborhood
                </label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="e.g. Chennaraopet Mandal, Ward 4"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Concern for Review</span>
              </button>
            </form>
          </div>

          {/* Right Column: Real-Time Live AI Extractor (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <LiveAIExtractor extraction={aiExtraction} isLoading={isAnalyzing} />

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>How your request informs public planning</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Every submission is normalized into structured civic categories, aggregated with nearby community requests, and correlated against infrastructure gap indicators and ongoing public works to support evidence-based allocations.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
