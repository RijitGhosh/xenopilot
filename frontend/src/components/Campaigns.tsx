"use client";

import React, { useState, useEffect } from 'react';
import { Megaphone, ArrowLeft, Mail, MessageSquare, Percent, DollarSign, Calendar, TrendingUp, ChevronRight, Activity, Users } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { API_URL } from '../lib/api';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [campaignDetail, setCampaignDetail] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Fetch campaigns list
  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/campaigns`);
      const data = await response.json();
      setCampaigns(data || []);
    } catch (e) {
      console.error('Error fetching campaigns list:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Fetch detailed campaign metrics
  const fetchCampaignDetail = async (id: string) => {
    setIsDetailLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/campaigns/${id}`);
      const data = await response.json();
      setCampaignDetail(data);
    } catch (e) {
      console.error('Error fetching campaign detail:', e);
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCampaignId) {
      fetchCampaignDetail(selectedCampaignId);
    } else {
      setCampaignDetail(null);
    }
  }, [selectedCampaignId]);

  if (selectedCampaignId && campaignDetail) {
    const { campaign, metrics } = campaignDetail;

    // Funnel chart data
    const funnelData = [
      { name: 'Sent', count: metrics.sent, fill: '#6366f1' },
      { name: 'Delivered', count: metrics.delivered, fill: '#818cf8' },
      { name: 'Opened', count: metrics.opened, fill: '#a5b4fc' },
      { name: 'Clicked', count: metrics.clicked, fill: '#c7d2fe' },
      { name: 'Converted', count: metrics.converted, fill: '#10b981' }
    ];

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Detail Header */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => { setSelectedCampaignId(null); fetchCampaigns(); }}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition border border-slate-200 dark:border-slate-800 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Campaign Tracker Deep-Dive</span>
            <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
          </div>
        </div>

        {/* Top Info metrics row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 block uppercase mb-1">Delivered Funnel</span>
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{metrics.delivered} / {metrics.sent}</span>
            <span className="text-[10px] text-emerald-500 font-semibold block mt-0.5">Success Rate: {metrics.sent > 0 ? Math.round((metrics.delivered/metrics.sent)*100) : 0}%</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 block uppercase mb-1">Open Rate</span>
            <span className="text-2xl font-bold text-indigo-500">{metrics.openRate}%</span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Opened: {metrics.opened} recipients</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 block uppercase mb-1">Click Rate</span>
            <span className="text-2xl font-bold text-amber-500">{metrics.clickRate}%</span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Clicked: {metrics.clicked} recipients</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 block uppercase mb-1">Attributed Revenue</span>
            <span className="text-2xl font-bold text-emerald-500">₹{metrics.revenue.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Converted: {metrics.converted} users</span>
          </div>
        </div>

        {/* Split grid: Message copy & Funnel chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Campaign details & message copy */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold">Campaign Attributes</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-semibold">Goal Description</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 max-w-[200px] text-right truncate">{campaign.goal}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-semibold">Channel</span>
                <span className="font-bold text-indigo-500">{campaign.channel}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-semibold">Expected Revenue</span>
                <span className="font-bold">₹{campaign.expectedRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-semibold">Created Date</span>
                <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-semibold">Simulation Status</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 font-bold rounded-full">{campaign.status}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-400 block mb-2">Campaign Message copy</span>
              <p className="text-xs p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed font-medium">
                {campaign.message}
              </p>
            </div>
          </div>

          {/* Funnel chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-bold mb-6">Delivery Funnel Conversions</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                  <XAxis type="number" className="text-xs fill-slate-400" />
                  <YAxis dataKey="name" type="category" className="text-xs fill-slate-400 font-semibold" />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recipient Logs table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center space-x-1.5 mb-6">
            <Activity className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold">Recipient logs & timeline updates</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="p-3">Customer</th>
                  <th className="p-3">Channel Address</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Last Attributed Event</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {campaign.communications.map((comm: any) => (
                  <tr key={comm.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">{comm.customer.name}</td>
                    <td className="p-3 text-xs text-slate-400 font-semibold">{campaign.channel === 'EMAIL' ? comm.customer.email : comm.customer.phone}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        comm.status === 'CONVERTED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' :
                        comm.status === 'FAILED' ? 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400' :
                        comm.status === 'CLICKED' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400' :
                        comm.status === 'OPENED' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400' :
                        'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-450'
                      }`}>
                        {comm.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-slate-500 dark:text-slate-400">
                      {comm.events.length > 0 ? (
                        <span>{comm.events[comm.events.length - 1].type} at {new Date(comm.events[comm.events.length - 1].timestamp).toLocaleTimeString()}</span>
                      ) : (
                        <span className="italic text-slate-400">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* List Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaign Tracker</h1>
          <p className="text-slate-400 mt-1">Monitor, review, and track active and completed marketing pilots.</p>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm animate-pulse-soft">Loading campaigns database...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-20 text-slate-400 italic">No campaigns launched yet. Start by generating one in the builder!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="p-4">Campaign Name</th>
                  <th className="p-4">Channel</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Matched Segment</th>
                  <th className="p-4">Conversion rate</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {campaigns.map((camp) => (
                  <tr
                    key={camp.id}
                    onClick={() => setSelectedCampaignId(camp.id)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 cursor-pointer transition"
                  >
                    <td className="p-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">{camp.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5 max-w-[250px] truncate">{camp.goal}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        camp.channel === 'WHATSAPP' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' :
                        camp.channel === 'EMAIL' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400' :
                        camp.channel === 'SMS' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-400'
                      }`}>
                        {camp.channel}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        camp.status === 'LAUNCHED' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 animate-pulse' :
                        camp.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {camp.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {(() => {
                        try {
                          const parsed = JSON.parse(camp.segmentDefinition);
                          return parsed.segment || 'Active';
                        } catch (e) {
                          return 'Active';
                        }
                      })()}
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-200">
                      {camp.metrics?.conversionRate}%
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      {new Date(camp.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="p-4 text-slate-400 hover:text-slate-600">
                      <ChevronRight className="w-5 h-5" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
