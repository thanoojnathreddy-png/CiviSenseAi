import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { HotspotPoint } from '../../types';
import { useApp } from '../../context/AppContext';
import { PriorityBadge, CategoryBadge } from '../common/Badge';
import {
  Layers,
  MapPin,
  AlertTriangle,
  Users,
  Building,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Database
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface HotspotMapProps {
  hotspots: HotspotPoint[];
}

export const HotspotMap: React.FC<HotspotMapProps> = ({ hotspots }) => {
  const { setSelectedRecModal, recommendations, setSelectedDistrict, setAuthoritySubTab } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [selectedPoint, setSelectedPoint] = useState<HotspotPoint | null>(null);
  const [activeLayer, setActiveLayer] = useState<'demand' | 'deficit' | 'combined'>('combined');

  useEffect(() => {
    if (hotspots.length > 0 && !selectedPoint) {
      setSelectedPoint(hotspots[0]);
    }
  }, [hotspots, selectedPoint]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [17.5, 78.5],
        zoom: 6,
        scrollWheelZoom: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Layers when hotspots, selectedPoint, or activeLayer changes
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    layerGroupRef.current.clearLayers();

    hotspots.forEach((point) => {
      let color = '#2563EB';
      if (activeLayer === 'deficit') {
        color = point.infrastructure_deficit_index > 65 ? '#E11D48' : point.infrastructure_deficit_index > 45 ? '#D97706' : '#2563EB';
      } else {
        if (point.priority_level === 'CRITICAL') color = '#E11D48';
        else if (point.priority_level === 'HIGH') color = '#D97706';
        else if (point.priority_level === 'MEDIUM') color = '#2563EB';
        else color = '#64748B';
      }

      const radius = Math.min(26, Math.max(12, Math.sqrt(point.request_count) * 0.45));
      const isSelected = selectedPoint?.district === point.district;

      const circle = L.circleMarker([point.latitude, point.longitude], {
        radius: radius,
        fillColor: color,
        color: isSelected ? '#0f172a' : color,
        weight: isSelected ? 3 : 1.5,
        opacity: 1,
        fillOpacity: isSelected ? 0.85 : 0.65
      });

      const popupHtml = `
        <div style="font-family: ui-sans-serif, system-ui, sans-serif; min-width: 170px; padding: 2px;">
          <div style="font-weight: 700; font-size: 13px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
            ${point.district} (${point.state})
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 3px;">
            Citizen Signals: <strong style="color: #0f172a;">${point.request_count.toLocaleString()}</strong>
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 3px;">
            Primary Sector: <strong>${point.top_category}</strong>
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
            Infra Deficit: <strong style="color: #e11d48;">${point.infrastructure_deficit_index.toFixed(0)}/100</strong>
          </div>
          <div style="font-size: 11px; color: #1e40af; font-weight: 700; border-top: 1px solid #f1f5f9; padding-top: 4px;">
            Priority Score: ${point.composite_priority_score}/100
          </div>
        </div>
      `;

      circle.bindPopup(popupHtml);

      circle.on('click', () => {
        setSelectedPoint(point);
      });

      layerGroupRef.current?.addLayer(circle);
    });

    if (selectedPoint && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedPoint.latitude, selectedPoint.longitude], 7, {
        duration: 1.2
      });
    }
  }, [hotspots, selectedPoint, activeLayer]);

  const handleOpenRec = (district: string) => {
    const matched = recommendations.find((r) => r.district.toLowerCase() === district.toLowerCase());
    if (matched) {
      setSelectedRecModal(matched);
    }
  };

  const handleInspectRequests = (district: string) => {
    setSelectedDistrict(district);
    setAuthoritySubTab('explorer');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Map Header & Layer Toolbar */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Geospatial Demand Clusters & Infrastructure Deficit Overlay
          </h3>
        </div>

        {/* Map Layer Mode Toggles */}
        <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-medium self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveLayer('combined')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              activeLayer === 'combined' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Composite Priority
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('demand')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              activeLayer === 'demand' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Citizen Demand
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('deficit')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              activeLayer === 'deficit' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Infra Deficit
          </button>
        </div>
      </div>

      {/* Main Grid: Map (8 cols) + Contextual Diagnostics Drawer (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 relative min-h-[460px]">
        {/* Leaflet Geospatial Map Container */}
        <div className="lg:col-span-8 h-[420px] lg:h-[500px] w-full z-10 relative">
          <div ref={mapContainerRef} className="w-full h-full" style={{ background: '#f8fafc' }} />

          {/* Map Legend Overlay */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs p-2.5 rounded-lg border border-slate-200 shadow-sm z-20 text-[11px] space-y-1">
            <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">Priority Severity</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <span className="text-slate-600">Critical (&gt;85)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                <span className="text-slate-600">High (70-85)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="text-slate-600">Medium</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contextual Region Diagnostics Side Drawer (4 cols) */}
        <div className="lg:col-span-4 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 p-5 flex flex-col justify-between space-y-4">
          {selectedPoint ? (
            <div className="space-y-4">
              {/* Drawer Top */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">
                    Region Diagnostic Panel
                  </span>
                  <h4 className="text-lg font-bold text-slate-900">{selectedPoint.district} Region</h4>
                  <span className="text-xs text-slate-500 font-medium">
                    {selectedPoint.state}, {selectedPoint.country}
                  </span>
                </div>
                <PriorityBadge level={selectedPoint.priority_level} score={selectedPoint.composite_priority_score} size="sm" />
              </div>

              {/* Key Diagnostic Indicators */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Citizen Requests</span>
                  <span className="font-extrabold text-slate-900 font-mono text-base block mt-0.5">
                    {selectedPoint.request_count.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500">Verified signals</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Affected Reach</span>
                  <span className="font-extrabold text-slate-900 font-mono text-base block mt-0.5">
                    ~{selectedPoint.affected_population.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500">Residents impacted</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Primary Need Sector</span>
                  <div className="mt-1">
                    <CategoryBadge category={selectedPoint.top_category} />
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Infra Deficit Index</span>
                  <span className="font-extrabold text-rose-600 font-mono text-base block mt-0.5">
                    {selectedPoint.infrastructure_deficit_index.toFixed(0)}/100
                  </span>
                  <span className="text-[10px] text-slate-500">Capacity gap</span>
                </div>
              </div>

              {/* Diagnostic Assessment Text */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Planning Evidence Summary</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed font-normal">
                  High citizen demand intensity overlaps with a measured infrastructure deficit of {selectedPoint.infrastructure_deficit_index.toFixed(0)}/100 in the {selectedPoint.top_category} sector. {selectedPoint.active_projects_count === 0 ? 'No matching active public works currently address this deficit.' : `Currently ${selectedPoint.active_projects_count} matching works in progress.`}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenRec(selectedPoint.district)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>View Detailed Policy Analysis</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </button>

                <button
                  type="button"
                  onClick={() => handleInspectRequests(selectedPoint.district)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-slate-500" />
                  <span>Inspect Underlying Citizen Signals</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400 space-y-2">
              <MapPin className="w-8 h-8 text-slate-300" />
              <span className="text-xs font-medium">Click on any cluster on the map to inspect regional diagnostics</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
