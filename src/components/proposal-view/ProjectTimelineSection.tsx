
"use client";

import React from 'react';
import type { ProjectTimelineSectionData } from '@/lib/types';
import { CheckCircle } from 'lucide-react';

interface ProjectTimelineSectionProps {
  data: ProjectTimelineSectionData;
}

export function ProjectTimelineSection({ data }: ProjectTimelineSectionProps) {
  if (!data || !data.phases || data.phases.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-semibold text-foreground tracking-tight">{data?.title || "Project Timeline & Phases"}</h2>
        <p className="text-muted-foreground">Timeline phases will appear here once generated.</p>
        <p className="text-muted-foreground mt-4">No timeline phases available to display.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-semibold text-foreground tracking-tight mb-6">{data.title}</h2>
      
      <div className="relative space-y-10">
        {/* Vertical connecting line */}
        {data.phases.length > 1 && (
          <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-border hidden sm:block" aria-hidden="true" />
        )}

        {data.phases.map((phase, index) => (
          <div key={phase.id} className="relative flex items-start gap-x-5">
            {/* Numbered Circle */}
            <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-semibold z-10">
              {index + 1}
            </div>

            <div className="flex-grow pt-1 sm:pt-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1">
                <h3 className="text-xl font-semibold text-foreground">{phase.title}</h3>
                <div className="text-right mt-1 sm:mt-0 flex-shrink-0">
                  <p className="text-sm font-medium text-primary">{phase.duration}</p>
                  {phase.percentageOfProject && (
                    <p className="text-xs text-muted-foreground">{phase.percentageOfProject}</p>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                {phase.description}
              </p>

              {phase.keyDeliverables && phase.keyDeliverables.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-foreground mb-1.5">Key Deliverables:</h4>
                  <ul className="space-y-1">
                    {phase.keyDeliverables.map((deliverable, dIndex) => (
                      <li key={`${phase.id}-deliverable-${dIndex}`} className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
