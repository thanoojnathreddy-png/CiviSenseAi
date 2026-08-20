import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  MainTab,
  AuthoritySubTab,
  TimePeriodFilter,
  PriorityLevel,
  AIPriorityRecommendation,
  HotspotPoint,
  ExecutiveStats,
  CitizenRequestRecord,
  Demographics,
  InfrastructureIndex,
  GovernmentProject,
  CommunityNeed,
  AnalyticalInsight
} from '../types';
import { apiService } from '../services/api';

interface AppContextType {
  mainTab: MainTab;
  setMainTab: (tab: MainTab) => void;
  authoritySubTab: AuthoritySubTab;
  setAuthoritySubTab: (tab: AuthoritySubTab) => void;
  
  // Unified Global Filters
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  selectedPriorityFilter: string;
  setSelectedPriorityFilter: (priority: string) => void;
  selectedTimePeriod: TimePeriodFilter;
  setSelectedTimePeriod: (period: TimePeriodFilter) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  
  // Highlight / Inspection State
  selectedRecModal: AIPriorityRecommendation | null;
  setSelectedRecModal: (rec: AIPriorityRecommendation | null) => void;
  highlightedDistrict: string | null;
  setHighlightedDistrict: (dist: string | null) => void;
  
  // Data Collections
  stats: ExecutiveStats | null;
  communityNeeds: CommunityNeed[];
  insights: AnalyticalInsight[];
  hotspots: HotspotPoint[];
  recommendations: AIPriorityRecommendation[];
  demographics: Demographics[];
  infrastructure: InfrastructureIndex[];
  governmentProjects: GovernmentProject[];
  requests: CitizenRequestRecord[];
  
  // Filtered Computed Data
  filteredCommunityNeeds: CommunityNeed[];
  filteredHotspots: HotspotPoint[];
  filteredRecommendations: AIPriorityRecommendation[];
  filteredProjects: GovernmentProject[];
  filteredRequests: CitizenRequestRecord[];
  
  // UI State & Actions
  isLoading: boolean;
  liveNotification: { message: string; type?: 'info' | 'success' | 'warning' } | null;
  setLiveNotification: (notif: { message: string; type?: 'info' | 'success' | 'warning' } | null) => void;
  refreshData: () => Promise<void>;
  navigateToAuthoritySection: (subTab: AuthoritySubTab) => void;
  filterByIndicator: (indicatorType: 'total' | 'critical_needs' | 'infra_gaps' | 'under_review') => void;
  openRegionDetails: (district: string) => void;
  resetAllFilters: () => void;
  hasActiveFilters: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mainTab, setMainTab] = useState<MainTab>('home');
  const [authoritySubTab, setAuthoritySubTab] = useState<AuthoritySubTab>('overview');
  
  // Filters
  const [selectedCountry, setSelectedCountry] = useState<string>('India');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('All');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriodFilter>('all');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  
  // Inspection State
  const [selectedRecModal, setSelectedRecModal] = useState<AIPriorityRecommendation | null>(null);
  const [highlightedDistrict, setHighlightedDistrict] = useState<string | null>(null);

  // Raw Data State
  const [stats, setStats] = useState<ExecutiveStats | null>(null);
  const [communityNeeds, setCommunityNeeds] = useState<CommunityNeed[]>([]);
  const [insights, setInsights] = useState<AnalyticalInsight[]>([]);
  const [hotspots, setHotspots] = useState<HotspotPoint[]>([]);
  const [recommendations, setRecommendations] = useState<AIPriorityRecommendation[]>([]);
  const [demographics, setDemographics] = useState<Demographics[]>([]);
  const [infrastructure, setInfrastructure] = useState<InfrastructureIndex[]>([]);
  const [governmentProjects, setGovernmentProjects] = useState<GovernmentProject[]>([]);
  const [requests, setRequests] = useState<CitizenRequestRecord[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [liveNotification, setLiveNotification] = useState<{ message: string; type?: 'info' | 'success' | 'warning' } | null>(null);

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [
        statsData,
        needsData,
        insightsData,
        hotspotsData,
        recsData,
        demosData,
        infraData,
        projectsData,
        requestsData
      ] = await Promise.all([
        apiService.getStats(selectedCountry),
        apiService.getCommunityNeeds(selectedCountry),
        apiService.getInsights(selectedCountry),
        apiService.getHotspots(selectedCountry),
        apiService.getRecommendations(selectedCountry),
        apiService.getDemographics(selectedCountry),
        apiService.getInfrastructure(selectedCountry),
        apiService.getGovernmentProjects(selectedCountry),
        apiService.getRequests({ country: selectedCountry, limit: 200 })
      ]);

      setStats(statsData);
      setCommunityNeeds(needsData);
      setInsights(insightsData);
      setHotspots(hotspotsData);
      setRecommendations(recsData);
      setDemographics(demosData);
      setInfrastructure(infraData);
      setGovernmentProjects(projectsData);
      setRequests(requestsData);
    } catch (err) {
      console.error('Error refreshing platform data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCountry]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (liveNotification) {
      const timer = setTimeout(() => {
        setLiveNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [liveNotification]);

  // Unified Filter computations
  const hasActiveFilters = useMemo(() => {
    return (
      selectedDistrict !== 'All' ||
      selectedCategory !== 'All' ||
      selectedPriorityFilter !== 'All' ||
      selectedLanguage !== 'All' ||
      selectedTimePeriod !== 'all' ||
      globalSearchQuery.trim().length > 0
    );
  }, [selectedDistrict, selectedCategory, selectedPriorityFilter, selectedLanguage, selectedTimePeriod, globalSearchQuery]);

  const resetAllFilters = useCallback(() => {
    setSelectedDistrict('All');
    setSelectedCategory('All');
    setSelectedPriorityFilter('All');
    setSelectedLanguage('All');
    setSelectedTimePeriod('all');
    setGlobalSearchQuery('');
  }, []);

  const filteredCommunityNeeds = useMemo(() => {
    return communityNeeds.filter((n) => {
      if (selectedCountry !== 'All' && n.country.toLowerCase() !== selectedCountry.toLowerCase()) return false;
      if (selectedDistrict !== 'All' && n.district.toLowerCase() !== selectedDistrict.toLowerCase()) return false;
      if (selectedCategory !== 'All' && n.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      if (selectedPriorityFilter !== 'All' && n.priority_level.toUpperCase() !== selectedPriorityFilter.toUpperCase()) return false;
      if (globalSearchQuery.trim()) {
        const q = globalSearchQuery.toLowerCase();
        return (
          n.title.toLowerCase().includes(q) ||
          n.district.toLowerCase().includes(q) ||
          n.category.toLowerCase().includes(q) ||
          n.key_issues.some((k) => k.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [communityNeeds, selectedCountry, selectedDistrict, selectedCategory, selectedPriorityFilter, globalSearchQuery]);

  const filteredHotspots = useMemo(() => {
    return hotspots.filter((h) => {
      if (selectedCountry !== 'All' && h.country.toLowerCase() !== selectedCountry.toLowerCase()) return false;
      if (selectedDistrict !== 'All' && h.district.toLowerCase() !== selectedDistrict.toLowerCase()) return false;
      if (selectedCategory !== 'All' && h.top_category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      if (selectedPriorityFilter !== 'All' && h.priority_level.toUpperCase() !== selectedPriorityFilter.toUpperCase()) return false;
      return true;
    });
  }, [hotspots, selectedCountry, selectedDistrict, selectedCategory, selectedPriorityFilter]);

  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((r) => {
      if (selectedCountry !== 'All' && r.country.toLowerCase() !== selectedCountry.toLowerCase()) return false;
      if (selectedDistrict !== 'All' && r.district.toLowerCase() !== selectedDistrict.toLowerCase()) return false;
      if (selectedCategory !== 'All' && r.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      if (selectedPriorityFilter !== 'All' && r.priority_level.toUpperCase() !== selectedPriorityFilter.toUpperCase()) return false;
      if (globalSearchQuery.trim()) {
        const q = globalSearchQuery.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.district.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.ai_reasoning.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [recommendations, selectedCountry, selectedDistrict, selectedCategory, selectedPriorityFilter, globalSearchQuery]);

  const filteredProjects = useMemo(() => {
    return governmentProjects.filter((p) => {
      if (selectedCountry !== 'All' && p.country.toLowerCase() !== selectedCountry.toLowerCase()) return false;
      if (selectedDistrict !== 'All' && p.district.toLowerCase() !== selectedDistrict.toLowerCase()) return false;
      if (selectedCategory !== 'All' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      if (globalSearchQuery.trim()) {
        const q = globalSearchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          p.implementing_agency.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [governmentProjects, selectedCountry, selectedDistrict, selectedCategory, globalSearchQuery]);

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (selectedCountry !== 'All' && r.country.toLowerCase() !== selectedCountry.toLowerCase()) return false;
      if (selectedDistrict !== 'All' && r.district.toLowerCase() !== selectedDistrict.toLowerCase()) return false;
      if (selectedCategory !== 'All' && r.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      if (selectedLanguage !== 'All' && r.language.toLowerCase() !== selectedLanguage.toLowerCase()) return false;
      if (globalSearchQuery.trim()) {
        const q = globalSearchQuery.toLowerCase();
        return (
          r.raw_text.toLowerCase().includes(q) ||
          r.translated_text.toLowerCase().includes(q) ||
          r.district.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [requests, selectedCountry, selectedDistrict, selectedCategory, selectedLanguage, globalSearchQuery]);

  const navigateToAuthoritySection = (subTab: AuthoritySubTab) => {
    setAuthoritySubTab(subTab);
    setMainTab('authority');
  };

  // Interactive KPI Indicator Navigation
  const filterByIndicator = (indicatorType: 'total' | 'critical_needs' | 'infra_gaps' | 'under_review') => {
    setMainTab('authority');
    if (indicatorType === 'total') {
      resetAllFilters();
      setAuthoritySubTab('explorer');
    } else if (indicatorType === 'critical_needs') {
      setSelectedPriorityFilter('CRITICAL');
      setAuthoritySubTab('needs');
    } else if (indicatorType === 'infra_gaps') {
      resetAllFilters();
      setAuthoritySubTab('infrastructure');
    } else if (indicatorType === 'under_review') {
      resetAllFilters();
      setAuthoritySubTab('recommendations');
    }
  };

  const openRegionDetails = (district: string) => {
    setSelectedDistrict(district);
    const matched = recommendations.find((r) => r.district.toLowerCase() === district.toLowerCase());
    if (matched) {
      setSelectedRecModal(matched);
    }
  };

  return (
    <AppContext.Provider
      value={{
        mainTab,
        setMainTab,
        authoritySubTab,
        setAuthoritySubTab,
        selectedCountry,
        setSelectedCountry,
        selectedDistrict,
        setSelectedDistrict,
        selectedCategory,
        setSelectedCategory,
        selectedLanguage,
        setSelectedLanguage,
        selectedPriorityFilter,
        setSelectedPriorityFilter,
        selectedTimePeriod,
        setSelectedTimePeriod,
        globalSearchQuery,
        setGlobalSearchQuery,
        selectedRecModal,
        setSelectedRecModal,
        highlightedDistrict,
        setHighlightedDistrict,
        stats,
        communityNeeds,
        insights,
        hotspots,
        recommendations,
        demographics,
        infrastructure,
        governmentProjects,
        requests,
        filteredCommunityNeeds,
        filteredHotspots,
        filteredRecommendations,
        filteredProjects,
        filteredRequests,
        isLoading,
        liveNotification,
        setLiveNotification,
        refreshData,
        navigateToAuthoritySection,
        filterByIndicator,
        openRegionDetails,
        resetAllFilters,
        hasActiveFilters
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
