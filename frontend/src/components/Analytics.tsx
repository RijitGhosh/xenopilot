"use client";

import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Target, Percent, Sparkles, HelpCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend, Cell } from 'recharts';

interface AnalyticsProps {
  analytics: any;
  isLoading: boolean;
}

export default function Analytics({ analytics, isLoading }: AnalyticsProps) {
  if (isLoading || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 animate-pulse">Running advanced aggregations & compiling metrics...</p>
      </div>
    );
  }

  const { metrics, channelPerformance, campaignPerformance, revenueTrend, aiInsights } = analytics;

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Portal</h1>
        <p className="text-slate-400 mt-1">Deep-dive performance logs, channel attribution, and AI growth reviews.</p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase mb-1">Total Revenue</span>
          <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">₹{metrics.totalRevenue.toLocaleString()}</span>
          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Closed-loop attributed conversions</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase mb-1">Total Audience Reach</span>
          <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{metrics.totalCustomers}</span>
          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Seeded consumer profiles</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase mb-1">Overall Conversion Rate</span>
          <span className="text-2xl font-bold text-indigo-500">{metrics.conversionRate}%</span>
          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Average dispatch to purchase</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase mb-1">Average Order Value (AOV)</span>
          <span className="text-2xl font-bold text-emerald-500">₹1,420</span>
          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Basket value from campaign checkouts</span>
        </div>
      </div>

      {/* AI Growth Recommendations Widget */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-2 text-indigo-500 dark:text-indigo-400">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <h2 className="text-lg font-bold tracking-tight">AI Optimization Recommendations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {aiInsights.map((insight: string, idx: number) => (
            <div key={idx} className="bg-white/40 dark:bg-slate-950/40 border border-white/20 dark:border-slate-800/40 rounded-xl p-4 flex items-start space-x-3 backdrop-blur-sm">
              <span className="text-lg mt-0.5">⚡</span>
              <p className="text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue Line Over Time */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <h3 className="text-lg font-bold">Attributed Sales Growth</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                <XAxis dataKey="month" className="text-xs fill-slate-400" />
                <YAxis className="text-xs fill-slate-400" tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Attributed Sales']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Channel Performance comparison */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-6">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <h3 className="text-lg font-bold">Channel conversion performance</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                <XAxis dataKey="channel" className="text-xs fill-slate-400" />
                <YAxis className="text-xs fill-slate-400" tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value) => [`${value}%`, 'Conversion Rate']}
                />
                <Bar dataKey="conversionRate" radius={[6, 6, 0, 0]}>
                  {channelPerformance.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Channel Performance detailed breakdown table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-6">Channel attribution stats breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-950/20">
                <th className="p-3">Channel Name</th>
                <th className="p-3">Dispatched Messages</th>
                <th className="p-3">Conversions</th>
                <th className="p-3">Conversion Efficiency</th>
                <th className="p-3">Revenue Attributed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {channelPerformance.map((chan: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{chan.channel}</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400">{chan.sent}</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 font-semibold">{chan.converted}</td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{chan.conversionRate}%</span>
                    </div>
                  </td>
                  <td className="p-3 font-bold text-slate-800 dark:text-slate-100">₹{chan.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
