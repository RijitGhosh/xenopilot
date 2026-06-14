"use client";

import React from 'react';
import { Users, Megaphone, DollarSign, Percent, ArrowUpRight, Sparkles, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, Legend } from 'recharts';

interface DashboardProps {
  analytics: any;
  isLoading: boolean;
  onNavigate: (page: string) => void;
}

export default function Dashboard({ analytics, isLoading, onNavigate }: DashboardProps) {
  if (isLoading || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 animate-pulse">Loading real-time executive dashboard...</p>
      </div>
    );
  }

  const { metrics, channelPerformance, campaignPerformance, revenueTrend, aiInsights } = analytics;

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-400 mt-1">AI-driven marketing campaign summary and customer insights.</p>
        </div>
        <button
          onClick={() => onNavigate('builder')}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-lg hover:shadow-indigo-500/20 transition duration-150 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch AI Builder</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Customers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-slate-400">Total Audience</span>
            <span className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-500">
              <Users className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold">{metrics.totalCustomers}</h3>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              <span>+12.4% AOV Growth</span>
            </p>
          </div>
        </div>

        {/* Card 2: Active Campaigns */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-slate-400">Active Pilots</span>
            <span className="p-2 bg-pink-50 dark:bg-pink-950/50 rounded-lg text-pink-500">
              <Megaphone className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold">{metrics.activeCampaigns}</h3>
            <p className="text-xs text-slate-400 mt-1">
              <span>Running simulation agents</span>
            </p>
          </div>
        </div>

        {/* Card 3: Revenue Generated */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-slate-400">Attributed Revenue</span>
            <span className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg text-emerald-500">
              <DollarSign className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold">₹{metrics.totalRevenue.toLocaleString()}</h3>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              <span>+18.2% vs last month</span>
            </p>
          </div>
        </div>

        {/* Card 4: Conversion Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-slate-400">Conversion Rate</span>
            <span className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded-lg text-amber-500">
              <Percent className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold">{metrics.conversionRate}%</h3>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              <span>Avg AOV: ₹1,420</span>
            </p>
          </div>
        </div>
      </div>

      {/* AI Insights Widget */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-2 text-indigo-500 dark:text-indigo-400">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <h2 className="text-lg font-bold tracking-tight">XenoPilot Real-Time Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {aiInsights.map((insight: string, idx: number) => (
            <div key={idx} className="bg-white/40 dark:bg-slate-950/40 border border-white/20 dark:border-slate-800/40 rounded-xl p-4 flex items-start space-x-3 backdrop-blur-sm">
              <span className="text-lg mt-0.5">💡</span>
              <p className="text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Revenue Trend Line */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <h3 className="text-lg font-bold">Revenue Growth Trend</h3>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                <XAxis dataKey="month" className="text-xs fill-slate-400" />
                <YAxis className="text-xs fill-slate-400" tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Channel Performance Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-emerald-500" />
              <h3 className="text-lg font-bold">Channel Revenue Breakdown</h3>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                <XAxis dataKey="channel" className="text-xs fill-slate-400" />
                <YAxis className="text-xs fill-slate-400" tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                  {channelPerformance.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Campaign Performance Table Snippet */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            <h3 className="text-lg font-bold">Recent Campaign Performance</h3>
          </div>
          <button
            onClick={() => onNavigate('campaigns')}
            className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
          >
            View All Campaigns →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase">
                <th className="pb-3 font-semibold">Campaign Name</th>
                <th className="pb-3 font-semibold">Channel</th>
                <th className="pb-3 font-semibold">Sent</th>
                <th className="pb-3 font-semibold">Converted</th>
                <th className="pb-3 font-semibold">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {campaignPerformance.map((camp: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                  <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{camp.name}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      camp.channel === 'WHATSAPP' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' :
                      camp.channel === 'EMAIL' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400' :
                      camp.channel === 'SMS' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400' :
                      'bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-400'
                    }`}>
                      {camp.channel}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{camp.sent}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400 font-semibold">{camp.converted}</td>
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min(camp.conversionRate * 3, 100)}%` }}></div>
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{camp.conversionRate}%</span>
                    </div>
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
