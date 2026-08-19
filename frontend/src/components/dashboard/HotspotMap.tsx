import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { HotspotPoint } from '../../types';
import { useApp } from '../../context/AppContext';
import { PriorityBadge, CategoryBadge } from '../common/Badge';
import { MapPin, AlertTriangle, Users, Briefcase, ExternalLink, Info } from 'lucide-react';

interface HotspotMapProps {
  hotspots: HotspotPoint[];
  onSelectHotspot?: (hotspot: HotspotPoint) => void;
}

export const HotspotMap: React.FC<HotspotMapProps> = ({
  hotspots,
  onSelectHotspot
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const { setSelectedRecModal, recommendations, selectedCountry } = useApp();
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotPoint | null>(null);
  const [activeLayer, setActiveLayer] = useState<'all' | 'critical' | 'roads' | 'water'>('all');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Set initial view centered on Southern/Central India
      const map = L.map(mapContainerRef.current, {
        center: [17.5, 78.8],
        zoom: 6,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Center when Country Changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (selectedCountry === 'Brazil') {
      mapInstanceRef.current.setView([-16.43, -41.00], 7);
    } else if (selectedCountry === 'South Africa') {
      mapInstanceRef.current.setView([-22.95, 30.46], 7);
    } else if (selectedCountry === 'India') {
      mapInstanceRef.current.setView([17.5, 78.8], 6);
    } else {
      mapInstanceRef.current.setView([15.0, 40.0], 3);
    }
  }, [selectedCountry]);

  // Render Hotspots Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const filtered = hotspots.filter((h) => {
      if (activeLayer === 'critical') return h.priority_level === 'CRITICAL';
      if (activeLayer === 'roads') return h.top_category.toLowerCase().includes('transport');
      if (activeLayer === 'water') return h.top_category.toLowerCase().includes('water');
      return true;
    });

    filtered.forEach((hotspot) => {
      const isCritical = hotspot.priority_level === 'CRITICAL' || hotspot.composite_priority_score >= 85;
      const isHigh = hotspot.priority_level === 'HIGH' || (hotspot.composite_priority_score >= 75 && hotspot.composite_priority_score < 85);

      const fillColor = isCritical ? '#DC2626' : isHigh ? '#D97706' : '#2563EB';
      const radius = Math.min(26, Math.max(12, Math.sqrt(hotspot.request_count) * 3.6));

      // Create Custom SVG Circle Marker
      const circle = L.circleMarker([hotspot.latitude, hotspot.longitude], {
        radius: radius,
        fillColor: fillColor,
        color: '#FFFFFF',
        weight: 2,
        opacity: 0.95,
        fillOpacity: 0.75
      });

      // Hover Tooltip
      circle.bindTooltip(
        `<div class="p-1 font-sans text-xs">
          <div class="font-bold text-slate-900">${hotspot.district}, ${hotspot.state}</div>
          <div class="text-slate-600">${hotspot.request_count} verified citizen requests</div>
          <div class="font-mono text-xs font-bold text-rose-600">Priority Score: ${hotspot.composite_priority_score}/100 (${hotspot.priority_level})</div>
        </div>`,
        { direction: 'top', className: 'custom-leaflet-tooltip' }
      );

      // Click Event
      circle.on('click', () => {
        setSelectedHotspot(hotspot);
        if (onSelectHotspot) onSelectHotspot(hotspot);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo([hotspot.latitude, hotspot.longitude]);
        }
      });

      markersLayerRef.current?.addLayer(circle);

      // Add pulsing outer ring for CRITICAL hotspots
      if (isCritical) {
        const pulseCircle = L.circleMarker([hotspot.latitude, hotspot.longitude], {
          radius: radius + 8,
          fillColor: fillColor,
          color: fillColor,
          weight: 1,
          opacity: 0.4,
          fillOpacity: 0.15,
          className: 'hotspot-pulse'
        });
        markersLayerRef.current?.addLayer(pulseCircle);
      }
    });
  }, [hotspots, activeLayer, onSelectHotspot]);

  const handleOpenRecDetail = (district: string) => {
    const matched = recommendations.find((r) => r.district.toLowerCase() === district.toLowerCase());
    if (matched) {
      setSelectedRecModal(matched);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[560px]">
      {/* Map Header & Filter Toolbar */}
      <div className="px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Demand Hotspot Map & Infrastructure Gaps
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono font-medium">
              {hotspots.length} Active Regional Clusters
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Circle size indicates citizen demand density • Color indicates AI Priority Severity
          </p>
        </div>

        {/* Layer Filters */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-md border border-slate-200 text-xs font-medium">
          <button
            onClick={() => setActiveLayer('all')}
            className={`px-2.5 py-1 rounded transition-all ${
              activeLayer === 'all' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Hotspots
          </button>
          <button
            onClick={() => setActiveLayer('critical')}
            className={`px-2.5 py-1 rounded transition-all ${
              activeLayer === 'critical' ? 'bg-rose-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Critical (90+)
          </button>
          <button
            onClick={() => setActiveLayer('roads')}
            className={`px-2.5 py-1 rounded transition-all ${
              activeLayer === 'roads' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Roads
          </button>
          <button
            onClick={() => setActiveLayer('water')}
            className={`px-2.5 py-1 rounded transition-all ${
              activeLayer === 'water' ? 'bg-sky-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Water
          </button>
        </div>
      </div>

      {/* Map Content + Side District Diagnostics Drawer */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Leaflet Map Div */}
        <div ref={mapContainerRef} className="flex-1 w-full h-full" />

        {/* Selected Hotspot Diagnostics Drawer */}
        {selectedHotspot && (
          <div className="w-80 bg-white/95 backdrop-blur-xs border-l border-slate-200 p-5 shadow-lg overflow-y-auto flex flex-col justify-between absolute right-0 top-0 bottom-0 z-20 animate-fadeIn">
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {selectedHotspot.district}
                  </h3>
                  <div className="text-xs text-slate-500">{selectedHotspot.state}, {selectedHotspot.country}</div>
                </div>
                <PriorityBadge level={selectedHotspot.priority_level} score={selectedHotspot.composite_priority_score} size="sm" />
              </div>

              {/* Core Metrics */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Citizen Demand</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    {selectedHotspot.request_count} Requests
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Infra Deficit</span>
                  <span className="font-bold text-rose-700 font-mono text-sm">
                    {selectedHotspot.infrastructure_deficit_index.toFixed(0)}/100
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Affected Pop</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    {selectedHotspot.affected_population.toLocaleString()}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Matching Projects</span>
                  <span className={`font-bold font-mono text-sm ${selectedHotspot.active_projects_count === 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                    {selectedHotspot.active_projects_count} Active
                  </span>
                </div>
              </div>

              {/* Top Issue Category */}
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold mb-1">
                  Dominant Demand Area
                </span>
                <CategoryBadge category={selectedHotspot.top_category} />
              </div>

              {/* AI Diagnostic Summary */}
              <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-100 text-xs">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold mb-1">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span>AI Diagnostic Overview:</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  High concentration of citizen submissions identifies severe {selectedHotspot.top_category.toLowerCase()} deficit. 
                  {selectedHotspot.active_projects_count === 0 ? ' No active matching government public work is currently addressing this corridor.' : ' Current works require fast-tracking.'}
                </p>
              </div>
            </div>

            {/* Action to Open Full Recommendation */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={() => handleOpenRecDetail(selectedHotspot.district)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
              >
                <span>View Full AI Recommendation</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSelectedHotspot(null)}
                className="w-full py-1.5 text-center text-xs text-slate-500 hover:text-slate-800"
              >
                Close Drawer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Map Footer Legend */}
      <div className="px-5 py-2.5 border-t border-slate-200 bg-slate-50/90 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-[11px]">
          <span className="font-semibold text-slate-700 uppercase tracking-wider">Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-600" />
            <span>Critical Priority (Score 85+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-600" />
            <span>High Priority (75-84)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600" />
            <span>Medium Priority (60-74)</span>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Click any hotspot marker to inspect live district diagnostics
        </span>
      </div>
    </div>
  );
};
