'use client';

import React, { useState } from 'react';
import { useManagementStore } from '@/stores/useManagementStore';
import { Target, CheckCircle, Clock, Plus, ArrowUpRight, Award, BarChart2 } from 'lucide-react';

export const NDISGoalTracker: React.FC = () => {
  const { clients, selectedClientId, setSelectedClientId, updateClient } = useManagementStore();

  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('Daily Living');

  const goals = selectedClient?.goals || [
    {
      id: 'g-1',
      title: 'Improve emotional regulation during community transitions',
      category: 'Social & Community',
      targetDate: '2026-12-31',
      progress: 70,
      status: 'In Progress',
      strategies: ['Visual timetable', 'Sensory breaks', 'Positive reinforcement']
    },
    {
      id: 'g-2',
      title: 'Independent public transport navigation to daily activities',
      category: 'Capacity Building',
      targetDate: '2026-08-30',
      progress: 45,
      status: 'In Progress',
      strategies: ['Smart card practice', 'Supported route rehearsals']
    }
  ];

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle || !selectedClient) return;

    const newGoal = {
      id: `goal-${Date.now()}`,
      title: newGoalTitle,
      category: newGoalCategory,
      targetDate: '2026-12-31',
      progress: 10,
      status: 'In Progress',
      strategies: ['Allied health behavioral support']
    };

    const updatedGoals = [...goals, newGoal];
    updateClient(selectedClient.id, { goals: updatedGoals as any });
    setNewGoalTitle('');
  };

  const updateGoalProgress = (goalId: string, delta: number) => {
    if (!selectedClient) return;
    const updatedGoals = goals.map((g) => {
      if (g.id === goalId) {
        const currentProgress = g.progress ?? 0;
        const next = Math.max(0, Math.min(100, currentProgress + delta));
        return { ...g, progress: next, status: next === 100 ? 'Achieved' : 'In Progress' };
      }
      return g;
    });
    updateClient(selectedClient.id, { goals: updatedGoals as any });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">NDIS Goal Outcomes Tracker</h1>
          <p className="text-xs text-slate-400">
            Measuring participant capacity building progress against Section 34 NDIS Plan goals
          </p>
        </div>

        {/* Client selector dropdown */}
        <select
          value={selectedClient?.id}
          onChange={(e) => setSelectedClientId(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
        >
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} (NDIS: {c.ndisNumber})
            </option>
          ))}
        </select>
      </div>

      {/* Goal Summary Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Active Goals
          </span>
          <p className="text-2xl font-extrabold text-white">{goals.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Average Goal Attainment
          </span>
          <p className="text-2xl font-extrabold text-teal-400">
            {Math.round(goals.reduce((a, b) => a + (b.progress ?? b.progressPercent ?? 0), 0) / (goals.length || 1))}%
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Target Outcome Year
          </span>
          <p className="text-2xl font-extrabold text-white">2026 NDIS Plan</p>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Participant Plan Goals</h2>
          <span className="text-xs text-teal-400 font-semibold">{selectedClient?.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const goalProgress = goal.progress ?? goal.progressPercent ?? 0;
            return (
              <div
                key={goal.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 uppercase tracking-wide">
                      {goal.category}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5">{goal.title}</h3>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                      goalProgress >= 100
                        ? 'bg-teal-500/20 text-teal-300'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {goalProgress}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${goalProgress}%` }}
                  />
                </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Target: {goal.targetDate}</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => updateGoalProgress(goal.id, -10)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    -10%
                  </button>
                  <button
                    onClick={() => updateGoalProgress(goal.id, +10)}
                    className="px-2 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold"
                  >
                    +10%
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* Add Goal Form */}
      <form
        onSubmit={handleAddGoal}
        className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row gap-3 items-end"
      >
        <div className="flex-1 w-full space-y-1">
          <label className="text-xs font-semibold text-slate-300">Add New NDIS Plan Goal</label>
          <input
            type="text"
            required
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            placeholder="e.g. Master independent meal preparation with assistive aids"
            className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
        <div className="w-full sm:w-48 space-y-1">
          <label className="text-xs font-semibold text-slate-300">Category</label>
          <select
            value={newGoalCategory}
            onChange={(e) => setNewGoalCategory(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
          >
            <option>Daily Living</option>
            <option>Social & Community</option>
            <option>Capacity Building</option>
            <option>Health & Wellbeing</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 font-bold text-xs text-white transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Goal
        </button>
      </form>
    </div>
  );
};
