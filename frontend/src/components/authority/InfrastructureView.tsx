import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InfrastructureIndex } from '../../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Layers,
  AlertTriangle,
  Building2,
  Droplets,
  HeartPulse,
  GraduationCap,
  Trash2,
  Zap,
  Bus,
  CheckCircle2,
  Info,
  Search,
  XCircle
} from 'lucide-react';

export const InfrastructureView: React.FC = () => {
  const {
    infrastructure,
    selectedCountry,
    recommendations,
    selectedDistrict,
    setSelectedDistrict,
    globalSearchQuery,
    setGlobalSearchQuery
  } = useApp();

  const [selectedSector, setSelectedSector] = useState<string>('all');

  const filteredInfra = infrastructure.filter((i) => {
    if (selectedCountry && selectedCountry !== 'All' && i.country.toLowerCase() !== selectedCountry.toLowerCase()) return false;
    if (selectedDistrict !== 'All' && i.district.toLowerCase() !== selectedDistrict.toLowerCase()) return false;
    if (globalSearchQuery.trim()) {
      const q = globalSearchQuery.toLowerCase();
      return i.district.toLowerCase().includes(q) || i.state.toLowerCase().includes(q);
    }
    return true;
  });

  const chartData = filteredInfra.map((item) => ({
    district: item.district,
    Roads: item.road_index,
    Water: item.water_index,
    Health: item.healthcare_index,
    Education: item.education_index,
    Waste: item.waste_management_index,
    Power: item.electricity_index,
    Transport: item.public_transport_index
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono">
              Sector Diagnostics
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Multi-Sector Infrastructure Indicators
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Regional Infrastructure & Gap Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare official public infrastructure indicators across administrative regions to detect disparities and cross-reference with citizen demand.
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-xs text-slate-500 block">Regions Evaluated</span>
          <span className="text-xl font-extrabold font-mono text-slate-900">{filteredInfra.length} Districts</span>
        </div>
      </div>

      {/* Comparative Multi-Sector Capacity Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Sector Infrastructure Capacity Index (0–100 Scale)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Higher is better (&lt;40 = Critical Deficit)</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="district" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#475569' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '6px',
                  fontSize: '12px',
                  border: 'none'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Roads" fill="#64748B" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Water" fill="#0284C7" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Health" fill="#0D9488" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Education" fill="#6366F1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Power" fill="#D97706" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comprehensive Regional Indicators Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Regional Infrastructure Matrix & Citizen Demand Correlation
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Red cells indicate critical deficits (&lt;40)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Region</th>
                <th className="px-3 py-3 text-center">Road Access</th>
                <th className="px-3 py-3 text-center">Water Supply</th>
                <th className="px-3 py-3 text-center">Healthcare</th>
                <th className="px-3 py-3 text-center">Education</th>
                <th className="px-3 py-3 text-center">Waste Mgmt</th>
                <th className="px-3 py-3 text-center">Electricity</th>
                <th className="px-3 py-3 text-center">Transit</th>
                <th className="px-4 py-3 text-right">Demand Overlap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-normal">
              {filteredInfra.map((item) => {
                const rec = recommendations.find((r) => r.district.toLowerCase() === item.district.toLowerCase());
                const demandIntensity = rec ? rec.citizen_requests_count : 15;
                
                return (
                  <tr key={item.region_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-slate-900 whitespace-nowrap">
                      <div>{item.district}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{item.state}, {item.country}</div>
                    </td>

                    {/* Road Index */}
                    <td className={`px-3 py-3.5 text-center font-mono font-bold ${
                      item.road_index < 40 ? 'bg-rose-50 text-rose-700 font-extrabold' : 'text-slate-700'
                    }`}>
                      {item.road_index.toFixed(0)}/100
                    </td>

                    {/* Water Index */}
                    <td className={`px-3 py-3.5 text-center font-mono font-bold ${
                      item.water_index < 40 ? 'bg-rose-50 text-rose-700 font-extrabold' : 'text-slate-700'
                    }`}>
                      {item.water_index.toFixed(0)}/100
                    </td>

                    {/* Health Index */}
                    <td className={`px-3 py-3.5 text-center font-mono font-bold ${
                      item.healthcare_index < 40 ? 'bg-rose-50 text-rose-700 font-extrabold' : 'text-slate-700'
                    }`}>
                      {item.healthcare_index.toFixed(0)}/100
                    </td>

                    {/* Education Index */}
                    <td className={`px-3 py-3.5 text-center font-mono font-bold ${
                      item.education_index < 40 ? 'bg-rose-50 text-rose-700 font-extrabold' : 'text-slate-700'
                    }`}>
                      {item.education_index.toFixed(0)}/100
                    </td>

                    {/* Waste Index */}
                    <td className={`px-3 py-3.5 text-center font-mono font-bold ${
                      item.waste_management_index < 40 ? 'bg-rose-50 text-rose-700 font-extrabold' : 'text-slate-700'
                    }`}>
                      {item.waste_management_index.toFixed(0)}/100
                    </td>

                    {/* Electricity Index */}
                    <td className="px-3 py-3.5 text-center font-mono text-slate-700">
                      {item.electricity_index.toFixed(0)}/100
                    </td>

                    {/* Transit Index */}
                    <td className="px-3 py-3.5 text-center font-mono text-slate-700">
                      {item.public_transport_index.toFixed(0)}/100
                    </td>

                    {/* Demand Overlap */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        demandIntensity > 25 ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {demandIntensity > 25 ? 'Very High Demand' : 'Moderate Demand'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
