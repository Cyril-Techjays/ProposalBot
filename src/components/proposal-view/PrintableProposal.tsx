
"use client";

import React from 'react';
import type { StructuredProposal } from '@/lib/types';
import { ExecutiveSummarySection } from './ExecutiveSummarySection';
import { RequirementsAnalysisSection } from './RequirementsAnalysisSection';
import { FeatureBreakdownSection } from './FeatureBreakdownSection';
import { ProjectTimelineSection } from './ProjectTimelineSection';
import { TeamAndResourcesSection } from './TeamAndResourcesSection';

interface PrintableProposalProps {
  proposalData: StructuredProposal;
}

export const FULL_PROPOSAL_PRINT_ID = "full-proposal-print-area";

export function PrintableProposal({ proposalData }: PrintableProposalProps) {
  if (!proposalData) return null;

  // Basic styles for print - adjust as needed
  const sectionStyle: React.CSSProperties = {
    paddingTop: '20px', // Add some space before each section
    paddingBottom: '20px',
  };
  const pageBreakStyle: React.CSSProperties = {
    pageBreakBefore: 'always',
  };

  return (
    <div id={FULL_PROPOSAL_PRINT_ID} style={{ fontFamily: 'Arial, sans-serif', color: '#333' }}>
      <div style={sectionStyle}>
        <ExecutiveSummarySection data={proposalData.executiveSummary} />
      </div>
      <div style={{ ...pageBreakStyle, ...sectionStyle }}>
        <RequirementsAnalysisSection data={proposalData.requirementsAnalysis} />
      </div>
      <div style={{ ...pageBreakStyle, ...sectionStyle }}>
        <FeatureBreakdownSection data={proposalData.featureBreakdown} />
      </div>
      <div style={{ ...pageBreakStyle, ...sectionStyle }}>
        <ProjectTimelineSection data={proposalData.projectTimelineSection} />
      </div>
      <div style={{ ...pageBreakStyle, ...sectionStyle }}>
        <TeamAndResourcesSection data={proposalData.teamAndResources} />
      </div>
    </div>
  );
}
