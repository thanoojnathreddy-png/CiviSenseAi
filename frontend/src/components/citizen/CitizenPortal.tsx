import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useTranslation, SupportedLanguageCode } from '../../i18n';
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
  ArrowRight,
  ShieldCheck,
  Edit3,
  Check,
  Clock,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

export const CitizenPortal: React.FC = () => {
  const { regions, setMainTab, setAuthoritySubTab, refreshData, setLiveNotification } = useApp();
  const { t, currentLanguage, setLanguage: setGlobalLanguage, supportedLanguages } = useTranslation();

  // Intake language is initialized to current app language
  const [language, setLanguage] = useState<string>(currentLanguage.name);
  const [district, setDistrict] = useState<string>('');
  const [locality, setLocality] = useState<string>('');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [inputText, setInputText] = useState<string>('');
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('voice');
  const [isVoiceSubmitted, setIsVoiceSubmitted] = useState<boolean>(false);

  // Synchronize when global language changes
  useEffect(() => {
    setLanguage(currentLanguage.name);
  }, [currentLanguage]);

  // Progressive Stages: 'form' -> 'processing' -> 'confirm_interpretation' -> 'submitted'
  const [portalStage, setPortalStage] = useState<'form' | 'processing' | 'confirm_interpretation' | 'submitted'>('form');
  const [processingStep, setProcessingStep] = useState<number>(0);

  const [aiExtraction, setAiExtraction] = useState<AIStructuredExtraction | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);

  // Multilingual Sample Prompts for all supported languages
  const samplePrompts: Record<string, Array<{ label: string; text: string }>> = {
    English: [
      {
        label: 'Hospital Emergency Power Deficit',
        text: 'The Community Health Centre in Kalyanadurg suffers 6-hour daily power cuts with no generator backup. Oxygen concentrators stop working.'
      },
      {
        label: 'Rural Road Washout',
        text: 'The connecting road link to the main market yard is severely damaged by rainfall. Farmers cannot transport harvest produce safely.'
      },
      {
        label: 'Drinking Water Pipeline Breakage',
        text: 'The municipal drinking water pipeline has burst in sector 4. Contaminated water is mixing into household supply.'
      }
    ],
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
        label: 'स्वास्थ्य केंद्र डॉक्टर कमी (PHC Shortage)',
        text: 'हमारे प्राथमिक स्वास्थ्य उपकेंद्र में कोई डॉक्टर या नर्स उपलब्ध नहीं है, आपातकालीन स्थिति में 40 किलोमीटर दूर जाना पड़ता है।'
      },
      {
        label: 'स्कूल बिजली व जलभराव (School Electrification)',
        text: 'हमारे ब्लॉक के प्राथमिक विद्यालय में बरसात के समय जलभराव हो जाता है और बिजली का कनेक्शन नहीं है।'
      }
    ],
    Tamil: [
      {
        label: 'கிராமப்புற சாலை சேதம் (Rural Road)',
        text: 'எங்கள் கிராமத்தில் சாலை மிகவும் சேதமடைந்துள்ளது. மழைக்காலத்தில் பள்ளி குழந்தைகள் செல்ல சிரமப்படுகின்றனர்.'
      },
      {
        label: 'குடிநீர் பற்றாக்குறை (Water Scarcity)',
        text: 'எங்கள் பகுதியில் கடந்த இரண்டு வாரங்களாக குடிநீர் விநியோகம் இல்லை. பொது குழாய்களில் உப்பு நீர் மட்டுமே வருகிறது.'
      }
    ],
    Kannada: [
      {
        label: 'ಕುಡಿಯುವ ನೀರಿನ ಪೈಪ್‌ಲೈನ್ (Water Pipeline)',
        text: 'ನಮ್ಮ ಗ್ರಾಮದಲ್ಲಿ ಕುಡಿಯುವ ನೀರಿನ ಪೈಪ್‌ಲೈನ್ ಒಡೆದು ನೀರು ಪೋಲಾಗುತ್ತಿದೆ, ಶುದ್ಧ ನೀರು ಸಿಗುತ್ತಿಲ್ಲ.'
      },
      {
        label: 'ರಸ್ತೆ ದುರಸ್ತಿ ಸಮಸ್ಯೆ (Road Repair)',
        text: 'ಮುಖ್ಯ ಪಟ್ಟಣಕ್ಕೆ ಸಂಪರ್ಕಿಸುವ ರಸ್ತೆ ಸಂಪೂರ್ಣ ಹಾಳಾಗಿದೆ, ಬಸ್ ಸಂಚಾರ ಸ್ಥಗಿತಗೊಂಡಿದೆ.'
      }
    ],
    Malayalam: [
      {
        label: 'ആരോഗ്യ കേന്ദ്രം ഡോക്ടർ ക്ഷാമം (PHC Shortage)',
        text: 'ഞങ്ങളുടെ പ്രദേശത്തെ പ്രാഥമിക ആരോഗ്യ കേന്ദ്രത്തിൽ ഡോക്ടറും ആംബുലൻസ് സൗകര്യവും ലഭ്യമല്ല.'
      },
      {
        label: 'റോഡ് തകർച്ച (Road Washout)',
        text: 'മഴക്കാലത്ത് പ്രധാന റോഡ് തകർന്ന് ഗതാഗതം തടസ്സപ്പെട്ടു, സ്കൂൾ കുട്ടികൾക്ക് യാത്ര ബുദ്ധിമുട്ടാണ്.'
      }
    ],
    Marathi: [
      {
        label: 'शेतीमाल वाहतूक रस्ता (Market Road)',
        text: 'आमच्या गावातील शेतीमाल वाहतुकीचा रस्ता पावसामुळे वाहून गेला आहे, शेतकरी हवालदिल झाले आहेत.'
      },
      {
        label: 'पिण्याचे पाणी टंचाई (Drinking Water)',
        text: 'आमच्या वस्तीत गेल्या १५ दिवसांपासून टँकरचे पाणी वेळेवर येत नाही, पिण्याच्या पाण्याचे दुर्भिक्ष आहे.'
      }
    ],
    Bengali: [
      {
        label: 'পানীয় জলের নলকূপ সমস্যা (Tube Well Deficit)',
        text: 'আমাদের গ্রামে পানীয় জলের নলকূপগুলো নষ্ট হয়ে গেছে, দূর থেকে জল আনতে হচ্ছে।'
      },
      {
        label: 'গ্রামের ভাঙা রাস্তা (Damaged Road)',
        text: 'বর্ষার জলে গ্রামের কাঁচা রাস্তা ভেঙে গেছে, অ্যাম্বুলেন্স আসার কোনো উপায় নেই।'
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

  // Handle language change from select
  const handleLanguageChange = (newLangName: string) => {
    setLanguage(newLangName);
    const matched = supportedLanguages.find((l) => l.name === newLangName);
    if (matched) {
      setGlobalLanguage(matched.code);
    }
  };

  // Trigger Progressive Processing Sequence
  const handleInitiateSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (!district.trim()) {
      setLocationError(t('citizen.districtError'));
      return;
    }
    setLocationError(null);

    setPortalStage('processing');
    setProcessingStep(1);

    setTimeout(() => setProcessingStep(2), 280);
    setTimeout(() => setProcessingStep(3), 560);
    setTimeout(() => setProcessingStep(4), 840);
    setTimeout(() => setPortalStage('confirm_interpretation'), 1150);
  };

  // Final Confirmation & Submission to Backend
  const handleFinalConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      const cleanDistrict = district.trim();
      const cleanLocality = locality.trim();

      const matchedRegion = regions.find(
        (r) => r.district.toLowerCase() === cleanDistrict.toLowerCase()
      );

      const res = await apiService.submitRequest({
        text: inputText.trim(),
        language: language,
        country: matchedRegion?.country || 'India',
        state: matchedRegion?.state || 'Telangana',
        district: cleanDistrict,
        locality: cleanLocality || `${cleanDistrict} Locality`,
        is_voice: isVoiceSubmitted
      });

      setSubmissionResult(res);
      setPortalStage('submitted');
      setLiveNotification({
        message: `✅ Community need #${res.request.request_id} recorded in ${cleanDistrict}.`,
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
    setDistrict('');
    setLocality('');
    setLocationError(null);
    setAiExtraction(null);
    setIsVoiceSubmitted(false);
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
                {t('home.dpgPlatform')}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {t('citizen.intakeHeaderTitle')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              {t('home.heroTitle')}
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              {t('citizen.intakeHeaderSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs text-slate-600 self-start md:self-auto">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <div className="font-semibold text-slate-800">{t('home.principle1Title')}</div>
              <div className="text-[11px] text-slate-500">{t('home.principle2Title')}</div>
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
            <h2 className="text-xl font-bold text-slate-900">{t('citizen.analyzing')}</h2>
            <p className="text-xs text-slate-500 mt-1">{t('extractor.nlpBadge')}</p>
          </div>

          {/* Sequential Checkpoints */}
          <div className="space-y-3 text-left max-w-sm mx-auto text-xs">
            <div className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
              processingStep >= 1 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-50 text-slate-400'
            }`}>
              <CheckCircle2 className={`w-4 h-4 ${processingStep >= 1 ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span className="font-medium">1. {t('extractor.language')} ({language})</span>
            </div>

            <div className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
              processingStep >= 2 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-50 text-slate-400'
            }`}>
              <CheckCircle2 className={`w-4 h-4 ${processingStep >= 2 ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span className="font-medium">2. {t('extractor.category')} ({aiExtraction?.category || 'Infrastructure'})</span>
            </div>

            <div className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
              processingStep >= 3 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-50 text-slate-400'
            }`}>
              <CheckCircle2 className={`w-4 h-4 ${processingStep >= 3 ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span className="font-medium">3. {t('citizen.districtLabel')} ({district || 'Local'})</span>
            </div>

            <div className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
              processingStep >= 4 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-50 text-slate-400'
            }`}>
              <CheckCircle2 className={`w-4 h-4 ${processingStep >= 4 ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span className="font-medium">4. {t('extractor.severityUrgency')} ({aiExtraction?.urgency || 'High'})</span>
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
                {t('extractor.title')}
              </span>
              <span className="text-xs text-slate-500 font-medium">{t('citizen.reviewTitle')}</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
              {t('citizen.reviewTitle')}:
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              {aiExtraction?.subcategory || 'Infrastructure Need'}
            </h2>
            <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-200 leading-relaxed italic">
              "{aiExtraction?.translated_text || inputText}"
            </p>
          </div>

          {/* Structured Summary Badges */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">{t('citizen.districtLabel')}</span>
              <span className="font-bold text-slate-900">{district}</span>
              <span className="text-[10px] text-slate-500 block truncate">{locality}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">{t('extractor.category')}</span>
              <span className="font-bold text-blue-700">{aiExtraction?.category || 'Transportation'}</span>
              <span className="text-[10px] text-slate-500 block">{aiExtraction?.affected_group || 'Residents'}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">{t('extractor.severityUrgency')}</span>
              <span className="font-bold text-rose-700">{aiExtraction?.urgency || 'High'}</span>
              <span className="text-[10px] text-slate-500 block font-mono">Severity: {aiExtraction?.severity || 8}/10</span>
            </div>
          </div>

          {/* Human Validation Prompt */}
          <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>{t('home.govTitle')}</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed font-normal">
              {t('home.principle3Desc')}
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
              <span>{t('citizen.backToEdit')}</span>
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
                  <span>{t('citizen.submitting')}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t('citizen.confirmSubmitBtn')}</span>
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
              {t('citizen.referenceId')}: {submissionResult.request?.request_id || 'REQ-9042'}
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-3">
              {t('citizen.successTitle')}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              {t('citizen.successSubtitle')}
            </p>
          </div>

          {/* What Happens Next Guidance Box */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-left space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>{t('home.howItWorksTitle')}</span>
            </div>
            
            <p className="text-xs text-slate-700 leading-relaxed font-normal">
              {t('home.step2Desc')}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-200">
              <div>
                <span className="text-slate-500 text-[11px] block">{t('dashboard.kpiTotalRequests')}</span>
                <span className="font-bold text-blue-700 font-mono text-sm">
                  {submissionResult.community_impact?.total_correlated_requests || 42} {t('common.records')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">{t('extractor.category')}</span>
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
              {t('home.principle1Desc')}
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
              <span>{t('citizen.viewInDashboard')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              {t('citizen.submitAnother')}
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
                    <span>{t('citizen.selectLanguage')}</span>
                  </label>
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    {supportedLanguages.map((l) => (
                      <option key={l.code} value={l.name}>
                        {l.flag} {l.nativeName} ({l.name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* District Input Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t('citizen.districtLabel')}</span>
                    </span>
                    <span className="text-[10px] text-rose-500 font-semibold uppercase">{t('citizen.districtRequired')}</span>
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      if (locationError) setLocationError(null);
                    }}
                    placeholder={t('citizen.districtPlaceholder')}
                    className={`w-full text-xs font-medium bg-slate-50 border rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden transition-all ${
                      locationError ? 'border-rose-400 bg-rose-50/40 ring-1 ring-rose-300' : 'border-slate-300'
                    }`}
                  />
                  {locationError && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{locationError}</span>
                    </p>
                  )}
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
                  🎙️ {t('citizen.speakConcern')}
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
                  ✍️ {t('citizen.writeConcern')}
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
                  <span>{t('citizen.describeConcern')}</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {inputText.length} {t('citizen.characters')}
                  </span>
                </label>
                <textarea
                  rows={4}
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setIsVoiceSubmitted(false);
                  }}
                  placeholder={t('citizen.placeholderText')}
                  className="w-full text-xs leading-relaxed bg-white border border-slate-300 rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-sans"
                />
              </div>

              {/* Sample Prompts for selected intake language */}
              {samplePrompts[language] && samplePrompts[language].length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                    {t('citizen.samplePromptsLabel')}
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

              {/* Mandal / Locality */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Mandal / Village / Neighborhood</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                </label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="e.g. Chennaraopet, Ward 4, Downtown, etc."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!inputText.trim() || !district.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('citizen.submitNeedBtn')}</span>
              </button>
              {!district.trim() && inputText.trim() && (
                <p className="text-center text-[11px] text-amber-700 font-medium">
                  ⚠️ {t('citizen.districtError')}
                </p>
              )}
            </form>
          </div>

          {/* Right Column: Real-Time Live AI Extractor (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <LiveAIExtractor extraction={aiExtraction} isLoading={isAnalyzing} />

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>{t('home.howItWorksTitle')}</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {t('home.step2Desc')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
