import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { VoiceRecorder } from './VoiceRecorder';
import { LiveAIExtractor } from './LiveAIExtractor';
import { apiService } from '../../services/api';
import { AIStructuredExtraction } from '../../types';
import { Send, CheckCircle2, MapPin, Globe, Sparkles, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';

export const CitizenPortal: React.FC = () => {
  const { setMainTab, setAuthoritySubTab, refreshData, setLiveNotification } = useApp();

  const [language, setLanguage] = useState<string>('Telugu');
  const [district, setDistrict] = useState<string>('Warangal');
  const [locality, setLocality] = useState<string>('Chennaraopet Mandal');
  const [inputText, setInputText] = useState<string>('మా గ్రామంలో రోడ్డు సరిగా లేదు. వర్షాకాలంలో పిల్లలు బడికి వెళ్లడానికి చాలా ఇబ్బంది పడుతున్నారు. అంబులెన్స్ కూడా రాలేకపోతోంది.');
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('voice');
  const [isVoiceSubmitted, setIsVoiceSubmitted] = useState<boolean>(true);

  const [aiExtraction, setAiExtraction] = useState<AIStructuredExtraction | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);

  // Common public issue prompts by language
  const samplePrompts: Record<string, Array<{ label: string; text: string }>> = {
    Telugu: [
      {
        label: 'రోడ్డు సమస్య (Road Connectivity)',
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
        label: 'पीने का पानी (Water Crisis)',
        text: 'हमारे इलाके में पिछले 3 हफ्तों से पीने का साफ पानी नहीं आ रहा है, अस्पताल में मरीज बढ़ रहे हैं।'
      },
      {
        label: 'स्वास्थ्य केंद्र (PHC Doctor Shortage)',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

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
      setLiveNotification({
        message: `✅ Request #${res.request.request_id} recorded. Contributed to community demand in ${district}.`,
        type: 'success'
      });
      await refreshData();
    } catch (err) {
      console.error('Submission error:', err);
      alert('Failed to submit citizen request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmissionResult(null);
    setInputText('');
    setAiExtraction(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold uppercase tracking-wider">
                Digital Public Good Intake
              </span>
              <span className="text-xs text-slate-500 font-mono">Multilingual Voice & Text</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
              Share a Community Development Need
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Voice or write your neighborhood or village infrastructure challenge in your native language. 
              Your request is analyzed, grouped with local community signals, and provided directly to public planning authorities.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <div className="font-semibold text-slate-800">Public Service Channel</div>
              <div className="text-[11px] text-slate-500">Transparent community intelligence</div>
            </div>
          </div>
        </div>
      </div>

      {submissionResult ? (
        /* Submission Success & Community Demand Tracker */
        <div className="bg-white rounded-xl border border-emerald-200 shadow-md p-8 text-center max-w-2xl mx-auto space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Tracking Reference: {submissionResult.request?.request_id || 'CP-2026-TEL-9042'}
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-3">
              Request Successfully Processed & Registered
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Your submission has been converted into structured civic data and added to community demand analytics.
            </p>
          </div>

          {/* Community Demand Impact Card */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-left space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
              <span className="font-semibold text-slate-600 uppercase tracking-wider">Community Demand Contribution</span>
              <span className="font-bold text-blue-600 font-mono">Aggregated in Region</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 text-[11px] block">Target District</span>
                <span className="font-bold text-slate-800">{submissionResult.community_impact?.district}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Identified Category</span>
                <span className="font-bold text-slate-800">{submissionResult.community_impact?.category}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Correlated Requests</span>
                <span className="font-bold text-blue-700 font-mono text-sm">
                  {submissionResult.community_impact?.total_correlated_requests} Citizens
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Priority Weight</span>
                <span className="font-bold text-emerald-700 font-mono text-sm">
                  {submissionResult.community_impact?.priority_boost}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded border border-slate-200 italic">
              "{submissionResult.request?.translated_text}"
            </div>
          </div>

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
      ) : (
        /* Submission Form & Live AI Extractor Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Intake Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Location & Language Controls */}
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

              {/* Input Mode Selector */}
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
                  🎙️ Voice Request (వాయిస్ రికార్డింగ్)
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
                  ✍️ Text Request (టెక్స్ట్ రూపంలో)
                </button>
              </div>

              {/* Voice Recorder Module */}
              {inputMode === 'voice' && (
                <VoiceRecorder
                  language={language}
                  onTranscriptionComplete={handleVoiceTranscribed}
                />
              )}

              {/* Text Input Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Development Request Details</span>
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
                  placeholder="Describe your village or community infrastructure need..."
                  className="w-full text-xs leading-relaxed bg-white border border-slate-300 rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
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
                        className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-slate-700 transition-all text-left cursor-pointer"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Locality Specification */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Specific Mandal / Village / Ward Area
                </label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="e.g. Chennaraopet Mandal, Ward 4"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !inputText.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing & Integrating with Civic Intelligence Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Community Development Request</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Real-Time AI Structured Extraction Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <LiveAIExtractor extraction={aiExtraction} isLoading={isAnalyzing} />

            {/* Platform Impact Note */}
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
