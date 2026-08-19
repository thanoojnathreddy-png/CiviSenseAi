import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  MainTab,
  AuthoritySubTab,
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
  
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  
  selectedRecModal: AIPriorityRecommendation | null;
  setSelectedRecModal: (rec: AIPriorityRecommendation | null) => void;
  
  stats: ExecutiveStats | null;
  communityNeeds: CommunityNeed[];
  insights: AnalyticalInsight[];
  hotspots: HotspotPoint[];
  recommendations: AIPriorityRecommendation[];
  demographics: Demographics[];
  infrastructure: InfrastructureIndex[];
  governmentProjects: GovernmentProject[];
  requests: CitizenRequestRecord[];
  
  isLoading: boolean;
  liveNotification: { message: string; type?: 'info' | 'success' | 'warning' } | null;
  setLiveNotification: (notif: { message: string; type?: 'info' | 'success' | 'warning' } | null) => void;
  refreshData: () => Promise<void>;
  navigateToAuthoritySection: (subTab: AuthoritySubTab) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mainTab, setMainTab] = useState<MainTab>('home');
  const [authoritySubTab, setAuthoritySubTab] = useState<AuthoritySubTab>('overview');
  
  const [selectedCountry, setSelectedCountry] = useState<string>('India');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  
  const [selectedRecModal, setSelectedRecModal] = useState<AIPriorityRecommendation | null>(null);
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

  const navigateToAuthoritySection = (subTab: AuthoritySubTab) => {
    setAuthoritySubTab(subTab);
    setMainTab('authority');
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
        selectedRecModal,
        setSelectedRecModal,
        stats,
        communityNeeds,
        insights,
        hotspots,
        recommendations,
        demographics,
        infrastructure,
        governmentProjects,
        requests,
        isLoading,
        liveNotification,
        setLiveNotification,
        refreshData,
        navigateToAuthoritySection
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
