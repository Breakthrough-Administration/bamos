'use client';

import React from 'react';
import { GraduationCap, CheckCircle2, Clock, Award, BookOpen, ExternalLink } from 'lucide-react';

export const GoogleClassroomModule: React.FC = () => {
  const courses = [
    {
      id: 'c-1',
      title: 'NDIS Worker Orientation Module: Quality, Safety & You',
      provider: 'NDIS Quality & Safeguards Commission',
      status: '100% Completed',
      completionDate: '15 Jan 2026',
      badge: 'Mandatory Audit Credential'
    },
    {
      id: 'c-2',
      title: 'Positive Behaviour Support (PBS) Practitioner Framework',
      provider: 'Breakthrough Clinical Academy',
      status: 'In Progress (80%)',
      completionDate: 'Due 30 Mar 2026',
      badge: 'Core Clinical Practice'
    },
    {
      id: 'c-3',
      title: 'Emergency Medication & First Aid in Disability Support',
      provider: 'St John Ambulance Australia',
      status: '100% Completed',
      completionDate: '02 Feb 2026',
      badge: 'Safety Certified'
    },
    {
      id: 'c-4',
      title: 'Restrictive Practices Elimination & Human Rights in NDIS',
      provider: 'NDIS Commission Academy',
      status: '100% Completed',
      completionDate: '10 Feb 2026',
      badge: 'Governance Standard'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Google Classroom Staff Induction & CPD</h1>
          <p className="text-xs text-slate-400">
            AHPRA continuing professional development, mandatory NDIS Commission modules, and clinical competency tracking
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 uppercase tracking-wide">
                  {course.badge}
                </span>
                <span className="text-xs font-semibold text-slate-400 font-mono">
                  {course.completionDate}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">{course.title}</h3>
              <p className="text-xs text-slate-400">{course.provider}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 text-teal-400 font-bold">
                <CheckCircle2 className="w-4 h-4" /> {course.status}
              </span>
              <button className="text-xs text-slate-400 hover:text-white font-semibold flex items-center gap-1">
                Course Materials <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
