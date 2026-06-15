"use client";

import React, { useState } from 'react';
import { Sparkles, Megaphone, Users, Mail, MessageSquare, Send, CheckCircle2, ChevronRight, Play } from 'lucide-react';
import { API_URL } from '../lib/api';

interface BuilderProps {
  onNavigate: (page: string) => void;
  refetchAnalytics: () => void;
}

export default function Builder({ onNavigate, refetchAnalytics }: BuilderProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposal, setProposal] = useState<any | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchResult, setLaunchResult] = useState<any | null>(null);
  const [liveStats, setLiveStats] = useState<any>({ sent: 0, delivered: 0, converted: 0 });

  const examples = [
    'Bring back customers who have not purchased in 90 days.',
    'Reward loyal VIP customers with an early access clearance.',
    'Recover inactive shopping cart abandoners from last week.'
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setProposal(null);
    setLaunchResult(null);

    try {
      const response = await fetch(`${API_URL}/api/ai/generate-campaign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: prompt })
      });
      const data = await response.json();
      setProposal(data);
    } catch (e) {
      console.error('Error generating campaign proposal:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLaunch = async () => {
    if (!proposal) return;
    setIsLaunching(true);

    try {
      const response = await fetch(`${API_URL}/api/campaigns/launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${proposal.audienceName} - AI Pilot`,
          goal: prompt,
          segmentDefinition: JSON.stringify(proposal.segmentFilters),
          channel: proposal.channelRecommendation,
          subject: proposal.subject,
          message: proposal.message,
          cta: proposal.cta,
          expectedRevenue: proposal.expectedRevenue
        })
      });

      const data = await response.json();
      setLaunchResult(data);
      refetchAnalytics();

      // Start live callback simulation ticks in the UI!
      let sentCount = 0;
      let deliveredCount = 0;
      let convertedCount = 0;
      const targetCount = data.recipientCount;

      const interval = setInterval(() => {
        // Ticking up counters
        if (sentCount < targetCount) {
          sentCount += Math.ceil(targetCount / 5);
          if (sentCount > targetCount) sentCount = targetCount;
        }

        if (deliveredCount < sentCount) {
          deliveredCount += Math.ceil(targetCount / 6);
          if (deliveredCount > sentCount) deliveredCount = sentCount;
        }

        // Conversion ticks
        if (deliveredCount === targetCount && convertedCount === 0) {
          convertedCount = Math.round(targetCount * 0.12); // ~12% conversion mockup
        }

        setLiveStats({
          sent: sentCount,
          delivered: deliveredCount,
          converted: convertedCount
        });

        if (sentCount >= targetCount && deliveredCount >= targetCount) {
          clearInterval(interval);
        }
      }, 1000);

    } catch (e) {
      console.error('Error launching campaign:', e);
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Campaign Builder</h1>
        <p className="text-slate-400 mt-1">Describe your campaign goal. XenoPilot will segment users, choose channels, and write messages.</p>
      </div>

      {/* Main Input Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <label className="block text-sm font-semibold text-slate-400">What do you want to achieve today?</label>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Bring back customers inactive for 90 days..."
            className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 resize-none"
          />
          <Sparkles className="absolute right-3 bottom-3 w-5 h-5 text-indigo-400 animate-pulse-soft" />
        </div>

        {/* Example Prompt Badges */}
        <div className="flex flex-wrap gap-2.5">
          {examples.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => setPrompt(ex)}
              className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-full transition cursor-pointer"
            >
              {ex}
            </button>
          ))}
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-500/50 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/10 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Analyzing database segments and generating strategy...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate AI Marketing Plan</span>
            </>
          )}
        </button>
      </div>

      {/* AI Campaign Proposal Display */}
      {proposal && !launchResult && (
        <div className="space-y-6 animate-slideUp">
          <h2 className="text-xl font-bold">Recommended AI Marketing Proposal</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Columns left: Details */}
            <div className="md:col-span-2 space-y-6">
              {/* Audience & Channel Breakdown Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Target Segment */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Audience Segment</span>
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-500">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold">{proposal.audienceName}</h4>
                        <span className="text-xs text-slate-400 font-semibold">{proposal.audienceCount} customers matched</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{proposal.audienceReasoning}</p>
                  </div>

                  {/* Channel Recommendation */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Channel Recommendation</span>
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg text-emerald-500">
                        <Megaphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold">{proposal.channelRecommendation}</h4>
                        <span className="text-xs text-slate-400 font-semibold">Attributed ROI: High</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{proposal.channelReasoning}</p>
                  </div>
                </div>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Overall Reasoning Strategy */}
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Campaign Strategy Reasoning</span>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">{proposal.reasoning}</p>
                </div>
              </div>
            </div>

            {/* Column right: Simulated Message Preview */}
            <div className="space-y-6">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Interactive Copy Preview</span>
              
              {proposal.channelRecommendation === 'EMAIL' ? (
                // Email frame mockup
                <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm text-slate-800">
                  <div className="bg-slate-200 dark:bg-slate-900 px-4 py-2 flex items-center space-x-1 border-b border-slate-300 dark:border-slate-800">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="p-4 space-y-2.5 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="font-bold text-slate-400">Subject:</span> {proposal.subject || 'Special Promo'}
                    </div>
                    <hr className="border-slate-100 dark:border-slate-850" />
                    <div className="space-y-2 font-sans pt-1">
                      <p className="leading-relaxed">{proposal.message.replace('{{name}}', 'Jane')}</p>
                      <button className="bg-indigo-600 text-white font-semibold px-3 py-1.5 rounded block text-center w-full mt-4">
                        {proposal.cta}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Phone frame Mockup for WhatsApp/SMS/RCS
                <div className="bg-slate-900 border-[6px] border-slate-800 rounded-3xl overflow-hidden aspect-[9/16] shadow-xl flex flex-col relative text-white">
                  {/* Phone Notch */}
                  <div className="h-4 bg-slate-800 flex justify-center items-center">
                    <div className="w-16 h-2 bg-slate-950 rounded-full"></div>
                  </div>

                  {/* Header bar of chat */}
                  <div className="bg-slate-850 p-3 border-b border-slate-800 flex items-center space-x-2">
                    <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center text-xs font-bold">X</div>
                    <div>
                      <h5 className="text-xs font-bold">Brand Pilot</h5>
                      <span className="text-[9px] text-emerald-400 font-semibold block">online</span>
                    </div>
                  </div>

                  {/* Body chat area */}
                  <div className="flex-1 p-3 bg-slate-950 space-y-4 overflow-y-auto font-sans">
                    <div className="bg-slate-800 text-xs p-3 rounded-2xl rounded-tl-none max-w-[85%] leading-relaxed border border-slate-700/50">
                      <p>{proposal.message.replace('{{name}}', 'Jane')}</p>
                      <div className="mt-3 border-t border-slate-700/50 pt-2 flex justify-between items-center text-indigo-400 font-bold text-[10px]">
                        <span>{proposal.cta}</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Expected Results Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 block mb-1">Expected Attributed Revenue</span>
                <span className="text-2xl font-bold text-indigo-500">₹{proposal.expectedRevenue.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Based on historical channel conversions</span>
              </div>

              {/* Launch Button */}
              <button
                onClick={handleLaunch}
                disabled={isLaunching}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-500/50 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                {isLaunching ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Spawning CRM Campaign and dispatching webhooks...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Launch Pilot Campaign</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Live Dispatch Tracker screen */}
      {launchResult && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-6 text-center animate-fadeIn">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/50 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-100 dark:border-emerald-800">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold">XenoPilot Successfully Deployed</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              The CRM has generated campaign records and dispatches have been pushed to the channel microservice.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 mt-6">
            <div className="text-center space-y-1">
              <span className="text-xs text-slate-400 font-semibold block uppercase">Total Segments</span>
              <span className="text-2xl font-bold">{launchResult.recipientCount}</span>
            </div>
            <div className="text-center space-y-1">
              <span className="text-xs text-slate-400 font-semibold block uppercase">Dispatched</span>
              <span className="text-2xl font-bold text-indigo-500">{liveStats.sent}</span>
            </div>
            <div className="text-center space-y-1">
              <span className="text-xs text-slate-400 font-semibold block uppercase">Delivered</span>
              <span className="text-2xl font-bold text-emerald-500">{liveStats.delivered}</span>
            </div>
          </div>

          <div className="pt-4 flex justify-center space-x-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-sm transition cursor-pointer"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => onNavigate('campaigns')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm shadow-md hover:shadow-indigo-500/10 transition cursor-pointer"
            >
              Track Campaign Live Funnel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
