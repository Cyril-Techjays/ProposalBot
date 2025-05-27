import React from 'react';
import type { RequirementsAnalysis } from '@/lib/types';
import { ChevronRight } from 'lucide-react';

interface RequirementsAnalysisSectionProps {
  data: RequirementsAnalysis;
}

export function RequirementsAnalysisSection({ data }: RequirementsAnalysisSectionProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-3">Requirements Analysis</h2>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Project Requirements</h3>
        <div className="p-4 bg-muted/30 rounded-md">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {data.projectRequirementsOverview || "No overview provided."}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-foreground mb-3">Functional Requirements</h3>
        {data.functionalRequirements && data.functionalRequirements.length > 0 ? (
          <ul className="space-y-2">
            {data.functionalRequirements.map((req, index) => (
              <li key={`func-${index}`} className="flex items-start p-2 rounded-md hover:bg-muted/50 transition-colors">
                <ChevronRight className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{req}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No functional requirements listed.</p>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold text-foreground mb-3">Non-Functional Requirements</h3>
        {data.nonFunctionalRequirements && data.nonFunctionalRequirements.length > 0 ? (
          <ul className="space-y-2">
            {data.nonFunctionalRequirements.map((req, index) => (
              <li key={`nonfunc-${index}`} className="flex items-start p-2 rounded-md hover:bg-muted/50 transition-colors">
                <ChevronRight className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{req}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No non-functional requirements listed.</p>
        )}
      </div>
    </div>
  );
}
