import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { HomePage } from './components/home/HomePage';
import { CitizenPortal } from './components/citizen/CitizenPortal';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { CommunityNeedsView } from './components/authority/CommunityNeedsView';
import { InfrastructureView } from './components/authority/InfrastructureView';
import { ProjectsView } from './components/authority/ProjectsView';
import { InsightsView } from './components/authority/InsightsView';
import { RequestExplorer } from './components/explorer/RequestExplorer';
import { HotspotMap } from './components/dashboard/HotspotMap';
import { RecommendationsList } from './components/dashboard/RecommendationsList';
import { RecommendationModal } from './components/dashboard/RecommendationModal';
import { Sparkles, ShieldCheck, Globe2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    mainTab,
    authoritySubTab,
    hotspots,
    recommendations,
    selectedRecModal,
    setSelectedRecModal,
    liveNotification,
    setLiveNotification
  } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Gov-Tech Navbar */}
      <Navbar />

      {/* Live Notification Banner */}
      {liveNotification && (
        <div className="bg-slate-900 text-white px-4 py-2.5 shadow-md flex items-center justify-between z-30 animate-fadeIn border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between w-full text-xs font-medium">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>{liveNotification.message}</span>
            </div>
            <button
              onClick={() => setLiveNotification(null)}
              className="text-slate-400 hover:text-white text-xs underline ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Screen Content */}
      <main className="flex-1">
        {mainTab === 'home' && <HomePage />}
        
        {mainTab === 'citizen' && <CitizenPortal />}
        
        {mainTab === 'authority' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {authoritySubTab === 'overview' && <DashboardOverview />}
            {authoritySubTab === 'needs' && <CommunityNeedsView />}
            {authoritySubTab === 'map' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                      Geospatial Intelligence
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Multi-Layer Demand Mapping
                    </span>
                  </div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                    Demand Hotspots & Infrastructure Gaps Map
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Explore geographic clusters of citizen requests, compare against regional infrastructure deficits, and inspect live district diagnostics.
                  </p>
                </div>
                <HotspotMap hotspots={hotspots} />
                {selectedRecModal && (
                  <RecommendationModal
                    rec={selectedRecModal}
                    onClose={() => setSelectedRecModal(null)}
                  />
                )}
              </div>
            )}
            {authoritySubTab === 'infrastructure' && <InfrastructureView />}
            {authoritySubTab === 'recommendations' && (
              <div className="space-y-6">
                <RecommendationsList recommendations={recommendations} />
                {selectedRecModal && (
                  <RecommendationModal
                    rec={selectedRecModal}
                    onClose={() => setSelectedRecModal(null)}
                  />
                )}
              </div>
            )}
            {authoritySubTab === 'projects' && <ProjectsView />}
            {authoritySubTab === 'insights' && <InsightsView />}
            {authoritySubTab === 'explorer' && <RequestExplorer />}
          </div>
        )}
      </main>

      {/* Public Digital Good Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-800">CivicPulse AI</span>
            <span>• An Open Digital Public Good Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap justify-center">
            <span>Evidence-Based Decision Support</span>
            <span>•</span>
            <span>Multilingual Speech-to-Text</span>
            <span>•</span>
            <span>UN SDG 9 / 11 / 6 Alignment</span>
            <span>•</span>
            <span>Human-in-the-Loop Governance</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
