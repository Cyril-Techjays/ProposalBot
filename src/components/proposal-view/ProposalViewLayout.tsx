"use client";

import React, { useState } from 'react';
import type { StructuredProposal } from '@/lib/types';
import { ProposalHeader } from './ProposalHeader';
import { ProposalTabs } from './ProposalTabs';
import { ExecutiveSummarySection } from './ExecutiveSummarySection';
import { GenericSection } from './GenericSection';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProposalViewLayoutProps {
  proposal: StructuredProposal;
}

export type ProposalSectionKey = 
  | 'executiveSummary' 
  | 'requirementsAnalysis' 
  | 'featureBreakdown' 
  | 'projectTimelineSection' 
  | 'budgetAndInvestmentSection' 
  | 'teamAndResources';

export function ProposalViewLayout({ proposal }: ProposalViewLayoutProps) {
  const [activeTab, setActiveTab] = useState<ProposalSectionKey>('executiveSummary');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'executiveSummary':
        return <ExecutiveSummarySection data={proposal.executiveSummary} />;
      case 'requirementsAnalysis':
        return <GenericSection title="Requirements Analysis" content={proposal.requirementsAnalysis.content} />;
      case 'featureBreakdown':
        return <GenericSection title="Feature Breakdown" content={proposal.featureBreakdown.content} />;
      case 'projectTimelineSection':
        return <GenericSection title="Project Timeline" content={proposal.projectTimelineSection.content} />;
      case 'budgetAndInvestmentSection':
        return <GenericSection title="Budget & Investment" content={proposal.budgetAndInvestmentSection.content} />;
      case 'teamAndResources':
        return <GenericSection title="Team & Resources" content={proposal.teamAndResources.content} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ProposalHeader
        title={proposal.proposalTitle}
        clientName={proposal.clientName}
        projectType={proposal.projectType}
        summaryBadges={proposal.summaryBadges}
      />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ProposalTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="mt-6 bg-card p-6 rounded-lg shadow-md">
           <ScrollArea className="h-[calc(100vh-300px)]"> {/* Adjust height as needed */}
            {renderTabContent()}
          </ScrollArea>
        </div>
      </main>
      {/* Optional Footer can be added here if needed on this page */}
    </div>
  );
}
