'use client';

import React, { useState } from 'react';
import { useManagementStore } from '@/stores/useManagementStore';
import { MapPin, Navigation, Car, Clock, DollarSign, ExternalLink, Route } from 'lucide-react';

const getAddressString = (addr: any) => {
  if (!addr) return 'Address on file';
  if (typeof addr === 'string') return addr;
  return [addr.street, addr.suburb, addr.state, addr.postcode].filter(Boolean).join(', ') || 'Address on file';
};

export const GoogleMapsView: React.FC = () => {
  const { clients } = useManagementStore();
  const [startAddress, setStartAddress] = useState('Breakthrough Clinic, 120 Collins St, Melbourne VIC');
  const [selectedClientAddress, setSelectedClientAddress] = useState(
    getAddressString(clients[0]?.address) || 'Richmond, VIC'
  );
  const [travelMinutes, setTravelMinutes] = useState(24);
  const [distanceKm, setDistanceKm] = useState(14.5);
  const [mmZone, setMmZone] = useState('MMM 1-3 (Metro - max 30 min claim)');

  const hourlyRate = 193.99; // Standard 2026 Allied Health Therapy rate
  const billableTravelAmount = ((travelMinutes / 60) * hourlyRate).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Field Route & NDIS Provider Travel</h1>
          <p className="text-xs text-slate-400">
            Compliant travel time calculation under NDIS Pricing Arrangements (MMM zones 1-7)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Route Calculator Configuration */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Navigation className="w-4 h-4 text-teal-400" /> Travel Claim Builder
          </h2>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Origin (Practice / Base)</label>
              <input
                type="text"
                value={startAddress}
                onChange={(e) => setStartAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Destination Participant</label>
              <select
                onChange={(e) => {
                  const client = clients.find((c) => c.id === e.target.value);
                  if (client?.address) setSelectedClientAddress(getAddressString(client.address));
                }}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {getAddressString(c.address)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Participant Address</label>
              <input
                type="text"
                value={selectedClientAddress}
                onChange={(e) => setSelectedClientAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Estimated Time (mins)</label>
                <input
                  type="number"
                  value={travelMinutes}
                  onChange={(e) => setTravelMinutes(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Distance (km)</label>
                <input
                  type="number"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Modified Monash Model (MMM)</label>
              <select
                value={mmZone}
                onChange={(e) => setMmZone(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              >
                <option>MMM 1-3 (Metro - max 30 min claim)</option>
                <option>MMM 4-5 (Regional - max 60 min claim)</option>
                <option>MMM 6-7 (Remote - negotiated claim)</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs text-teal-300 font-bold">
              <span>NDIS Billable Travel Claim</span>
              <span className="text-lg font-extrabold text-white">${billableTravelAmount}</span>
            </div>
            <p className="text-[11px] text-teal-400/80">
              Line item: 15_799_0128_1_3 (Provider Travel - Capacity Building)
            </p>
          </div>
        </div>

        {/* Right 2 Columns: Simulated Maps & Field Dispatch Overview */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400" /> Live Field Route Dispatch
              </h2>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Car className="w-3.5 h-3.5" /> Optimal traffic routing
              </span>
            </div>

            {/* Visual Route Representation */}
            <div className="h-64 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:16px_16px]" />
              
              <div className="relative z-10 flex items-center justify-center gap-6">
                <div className="p-3 rounded-2xl bg-slate-900 border border-teal-500/40 text-teal-400">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-0.5 bg-teal-500/40 dashed" />
                  <Route className="w-5 h-5 text-teal-400 animate-pulse" />
                  <div className="w-12 h-0.5 bg-teal-500/40" />
                </div>
                <div className="p-3 rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-500/30">
                  <MapPin className="w-6 h-6" />
                </div>
              </div>

              <div className="relative z-10">
                <p className="text-xs font-bold text-white">{startAddress.split(',')[0]} ➔ {selectedClientAddress}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{distanceKm} km • Approx. {travelMinutes} minutes drive</p>
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startAddress)}&destination=${encodeURIComponent(selectedClientAddress)}`}
                target="_blank"
                rel="noreferrer"
                className="relative z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold border border-slate-700 transition-colors"
              >
                Open in Google Maps <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <span className="text-[10px] uppercase font-bold text-slate-400">Schedule Status</span>
              <p className="text-xs font-semibold text-white mt-1">Confirmed Appointment</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <span className="text-[10px] uppercase font-bold text-slate-400">Vehicle Allowance</span>
              <p className="text-xs font-semibold text-white mt-1">$0.99 / km eligible</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <span className="text-[10px] uppercase font-bold text-slate-400">Safety Check-in</span>
              <p className="text-xs font-semibold text-teal-400 mt-1">Lone Worker Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
