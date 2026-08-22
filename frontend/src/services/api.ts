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
