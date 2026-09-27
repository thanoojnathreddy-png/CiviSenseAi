import {
  CitizenRequestRecord,
  AIStructuredExtraction,
  ExecutiveStats,
  HotspotPoint,
  AIPriorityRecommendation,
  Demographics,
  InfrastructureIndex,
  GovernmentProject,
  CommunityNeed,
  AnalyticalInsight,
  RegionOption
} from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export const apiService = {
  // Dynamic Administrative Regions & States
  async getRegions(country?: string): Promise<RegionOption[]> {
    const url = country && country !== 'All' ? `${API_BASE}/regions?country=${encodeURIComponent(country)}` : `${API_BASE}/regions`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch regions');
      return await res.json();
    } catch (err) {
      // Graceful fallback to demographics if /regions is still propagating
      const demos = await this.getDemographics(country);
      return demos.map((d: Demographics) => ({
        region_id: d.region_id,
        district: d.district,
        state: d.state,
        country: d.country,
        population: d.population,
        latitude: d.latitude,
        longitude: d.longitude,
        focus_area: 'Infrastructure Planning',
        localities: [`${d.district} Mandal`, `${d.district} Ward 1`, `${d.district} Ward 2`]
      }));
    }
  },
  // Stats & KPIs
  async getStats(country?: string): Promise<ExecutiveStats> {
    const url = country && country !== 'All' ? `${API_BASE}/stats?country=${encodeURIComponent(country)}` : `${API_BASE}/stats`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch executive stats');
    return res.json();
  },

  // Community Needs Aggregation
  async getCommunityNeeds(country?: string, category?: string, priorityLevel?: string): Promise<CommunityNeed[]> {
    const params = new URLSearchParams();
    if (country && country !== 'All') params.append('country', country);
    if (category && category !== 'All') params.append('category', category);
    if (priorityLevel && priorityLevel !== 'All') params.append('priority_level', priorityLevel);

    const res = await fetch(`${API_BASE}/community-needs?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch community needs');
    return res.json();
  },

  // Analytical Insights
  async getInsights(country?: string): Promise<AnalyticalInsight[]> {
    const url = country && country !== 'All' ? `${API_BASE}/insights?country=${encodeURIComponent(country)}` : `${API_BASE}/insights`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch analytical insights');
    return res.json();
  },

  // Demand Hotspots
  async getHotspots(country?: string): Promise<HotspotPoint[]> {
    const url = country && country !== 'All' ? `${API_BASE}/hotspots?country=${encodeURIComponent(country)}` : `${API_BASE}/hotspots`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch demand hotspots');
    return res.json();
  },

  // AI Priority Recommendations
  async getRecommendations(country?: string, priorityLevel?: string, category?: string): Promise<AIPriorityRecommendation[]> {
    const params = new URLSearchParams();
    if (country && country !== 'All') params.append('country', country);
    if (priorityLevel && priorityLevel !== 'All') params.append('priority_level', priorityLevel);
    if (category && category !== 'All') params.append('category', category);
    
    const res = await fetch(`${API_BASE}/recommendations?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
  },

  // Recommendation Detail
  async getRecommendationDetail(recId: string): Promise<AIPriorityRecommendation> {
    const res = await fetch(`${API_BASE}/recommendations/${encodeURIComponent(recId)}`);
    if (!res.ok) throw new Error('Failed to fetch recommendation detail');
    return res.json();
  },

  // Update Recommendation Status
  async updateRecommendationStatus(recId: string, status: string): Promise<any> {
    const res = await fetch(`${API_BASE}/recommendations/${encodeURIComponent(recId)}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update recommendation status');
    return res.json();
  },

  // Get Filtered Citizen Requests
  async getRequests(params?: {
    country?: string;
    state?: string;
    district?: string;
    category?: string;
    language?: string;
    min_severity?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<CitizenRequestRecord[]> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== 'All') {
          query.append(k, String(v));
        }
      });
    }
    const res = await fetch(`${API_BASE}/requests?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch citizen requests');
    return res.json();
  },

  // Real-time AI analysis preview
  async analyzeText(payload: {
    text: string;
    language?: string;
    country?: string;
    state?: string;
    district?: string;
  }): Promise<{
    extraction: AIStructuredExtraction;
    suggested_district: string;
    estimated_affected_scale: string;
    impact_preview: string;
  }> {
    const res = await fetch(`${API_BASE}/analyze-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to analyze citizen text');
    return res.json();
  },

  // Submit Citizen Request
  async submitRequest(payload: {
    text: string;
    language?: string;
    country?: string;
    state?: string;
    district: string;
    locality?: string;
    latitude?: number;
    longitude?: number;
    is_voice?: boolean;
  }): Promise<{
    status: string;
    message: string;
    request: CitizenRequestRecord;
    ai_extraction: AIStructuredExtraction;
    community_impact: {
      district: string;
      category: string;
      total_correlated_requests: number;
      priority_boost: string;
      next_step: string;
    };
  }> {
    const res = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to submit citizen request');
    return res.json();
  },

  // Voice Transcribe
  async transcribeVoice(payload: { sample_id?: string; language_hint?: string }): Promise<{
    transcribed_text: string;
    detected_language: string;
    confidence: number;
    duration_seconds: number;
  }> {
    const res = await fetch(`${API_BASE}/voice-transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to transcribe voice');
    return res.json();
  },

  // Upload Recorded Audio File with Gemini AI fallback
  async uploadVoiceAudio(audioBlob: Blob, languageHint?: string): Promise<{
    transcribed_text: string;
    detected_language: string;
    confidence: number;
    duration_seconds: number;
  }> {
    const formData = new FormData();
    const fileName = (audioBlob.type && audioBlob.type.includes('wav')) ? 'citizen_voice.wav' : 'citizen_voice.webm';
    formData.append('file', audioBlob, fileName);
    if (languageHint) {
      formData.append('language_hint', languageHint);
    }

    try {
      const res = await fetch(`${API_BASE}/transcribe-audio`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[apiService] Backend transcribe-audio unreachable, attempting direct Gemini STT fallback:', err);
    }

    // Direct Gemini client-side fallback if backend is offline or errors
    try {
      return await this.transcribeAudioWithGeminiDirect(audioBlob, languageHint);
    } catch (fallbackErr) {
      console.error('[apiService] Both backend and direct Gemini transcription failed:', fallbackErr);
      throw new Error('Failed to transcribe voice audio via AI');
    }
  },

  // Direct client-side Gemini transcription fallback
  async transcribeAudioWithGeminiDirect(audioBlob: Blob, languageHint: string = 'English'): Promise<{
    transcribed_text: string;
    detected_language: string;
    confidence: number;
    duration_seconds: number;
  }> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error('No VITE_GEMINI_API_KEY configured');

    // Convert blob to base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const b64 = result.split(',')[1] || '';
        resolve(b64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });

    const cleanMime = (audioBlob.type || 'audio/webm').split(';')[0];
    const prompt = (
      `You are the multilingual speech-to-text transcriber for CivicPulse AI citizen grievances. ` +
      `Transcribe the audio verbatim in ${languageHint} or native language. ` +
      `If silence or no intelligible speech is detected, set transcribed_text to an empty string "". ` +
      `Output JSON strictly: {"transcribed_text": string, "detected_language": string, "confidence": number}`
    );

    const payload = {
      contents: [{
        parts: [
          { inline_data: { mime_type: cleanMime, data: base64Data } },
          { text: prompt }
        ]
      }],
      generationConfig: {
        response_mime_type: 'application/json',
        temperature: 0.1
      }
    };

    const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.7-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];
    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) continue;
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) continue;
        const cleanJson = text.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        return {
          transcribed_text: (parsed.transcribed_text || '').trim(),
          detected_language: parsed.detected_language || languageHint,
          confidence: parsed.confidence || 0.96,
          duration_seconds: Math.max(1, Math.round(audioBlob.size / 32000))
        };
      } catch (e) {
        continue;
      }
    }
    throw new Error('Direct Gemini transcription exhausted all models');
  },

  // Voice Samples
  async getVoiceSamples(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/voice-samples`);
    if (!res.ok) throw new Error('Failed to fetch voice samples');
    return res.json();
  },

  // Demographics, Infrastructure & Projects
  async getDemographics(country?: string): Promise<Demographics[]> {
    const url = country && country !== 'All' ? `${API_BASE}/demographics?country=${encodeURIComponent(country)}` : `${API_BASE}/demographics`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch demographics');
    return res.json();
  },

  async getInfrastructure(country?: string): Promise<InfrastructureIndex[]> {
    const url = country && country !== 'All' ? `${API_BASE}/infrastructure?country=${encodeURIComponent(country)}` : `${API_BASE}/infrastructure`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch infrastructure data');
    return res.json();
  },

  async getGovernmentProjects(country?: string, district?: string): Promise<GovernmentProject[]> {
    const params = new URLSearchParams();
    if (country && country !== 'All') params.append('country', country);
    if (district && district !== 'All') params.append('district', district);
    const res = await fetch(`${API_BASE}/government-projects?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch government projects');
    return res.json();
  }
};
