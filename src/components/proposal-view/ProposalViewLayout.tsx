
"use client";

import React, { useState, useEffect } from 'react';
import type { StructuredProposal } from '@/lib/types';
import { ProposalHeader } from './ProposalHeader';
import { ProposalTabs } from './ProposalTabs';
import { ExecutiveSummarySection } from './ExecutiveSummarySection';
import { RequirementsAnalysisSection } from './RequirementsAnalysisSection';
import { FeatureBreakdownSection } from './FeatureBreakdownSection'; 
import { ProjectTimelineSection } from './ProjectTimelineSection';
import { TeamAndResourcesSection } from './TeamAndResourcesSection'; // Import new component
import { GenericSection } from './GenericSection'; // Keep for potential fallback or future simple sections
import { ScrollArea } from '@/components/ui/scroll-area';
import { AIChatModal } from './AIChatModal'; 
import { useToast } from '@/hooks/use-toast';

const SESSION_STORAGE_KEY_CURRENT_PROPOSAL = 'currentGeneratedProposalData';

interface ProposalViewLayoutProps {
  initialProposal: StructuredProposal; 
}

export type ProposalSectionKey = 
  | 'executiveSummary' 
  | 'requirementsAnalysis' 
  | 'featureBreakdown' 
  | 'projectTimelineSection' 
  | 'teamAndResources';

export function ProposalViewLayout({ initialProposal }: ProposalViewLayoutProps) {
  const [currentProposal, setCurrentProposal] = useState<StructuredProposal>(initialProposal);
  const [activeTab, setActiveTab] = useState<ProposalSectionKey>('executiveSummary');
  const [isAIChatModalOpen, setIsAIChatModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentProposal(initialProposal);
  }, [initialProposal]);

  const openAIChatModal = () => setIsAIChatModalOpen(true);
  const closeAIChatModal = () => setIsAIChatModalOpen(false);

  const getCurrentSectionDataForPrompt = (): string => {
    if (!currentProposal) return "";
    switch (activeTab) {
      case 'executiveSummary':
        return JSON.stringify(currentProposal.executiveSummary);
      case 'requirementsAnalysis':
        return JSON.stringify(currentProposal.requirementsAnalysis); 
      case 'featureBreakdown':
        return JSON.stringify(currentProposal.featureBreakdown);
      case 'projectTimelineSection':
        return JSON.stringify(currentProposal.projectTimelineSection);
      case 'teamAndResources':
        return JSON.stringify(currentProposal.teamAndResources); // Stringify the object
      default:
        const exhaustiveCheck: never = activeTab; 
        return "";
    }
  };

  const handleApplyChatEdit = (sectionKey: ProposalSectionKey, newContentString: string) => {
    if (!currentProposal) return;

    let updatedProposal = { ...currentProposal };
    try {
      switch (sectionKey) {
        case 'executiveSummary':
          updatedProposal.executiveSummary = JSON.parse(newContentString);
          break;
        case 'requirementsAnalysis':
          updatedProposal.requirementsAnalysis = JSON.parse(newContentString); 
          break;
        case 'featureBreakdown':
          updatedProposal.featureBreakdown = JSON.parse(newContentString);
          break;
        case 'projectTimelineSection':
          updatedProposal.projectTimelineSection = JSON.parse(newContentString);
          break;
        case 'teamAndResources':
          updatedProposal.teamAndResources = JSON.parse(newContentString); // Parse the JSON string
          break;
        default:
          const exhaustiveCheck: never = sectionKey; 
          throw new Error(`Unknown section key: ${exhaustiveCheck}`);
      }
      setCurrentProposal(updatedProposal);
      sessionStorage.setItem(SESSION_STORAGE_KEY_CURRENT_PROPOSAL, JSON.stringify(updatedProposal));
    } catch (e) {
      console.error("Error applying AI edit:", e);
      toast({ title: "Update Failed", description: "AI returned invalid data or an error occurred parsing the update. Please ensure the AI respects the required JSON format for complex sections.", variant: "destructive" });
    }
  };


  const renderTabContent = () => {
    if (!currentProposal) return null; 

    switch (activeTab) {
      case 'executiveSummary':
        return <ExecutiveSummarySection data={currentProposal.executiveSummary} />;
      case 'requirementsAnalysis':
        return <RequirementsAnalysisSection data={currentProposal.requirementsAnalysis} />; 
      case 'featureBreakdown':
        return <FeatureBreakdownSection data={currentProposal.featureBreakdown} />;
      case 'projectTimelineSection':
        return <ProjectTimelineSection data={currentProposal.projectTimelineSection} />;
      case 'teamAndResources':
        return <TeamAndResourcesSection data={currentProposal.teamAndResources} />; // Use new component
      default:
        const exhaustiveCheck: never = activeTab;
        // Fallback for safety, though all keys should be handled
        return <GenericSection title="Content Area" content={`Content for section ${exhaustiveCheck} will appear here.`} />;
    }
  };

  if (!currentProposal) { 
    return <div>Loading proposal data...</div>; 
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ProposalHeader
        title={currentProposal.proposalTitle}
        clientName={currentProposal.clientName}
        projectType={currentProposal.projectType}
        summaryBadges={currentProposal.summaryBadges}
        onAIChatClick={openAIChatModal} 
      />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ProposalTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="mt-6 bg-card p-6 rounded-lg shadow-md">
           <ScrollArea className="h-[calc(100vh-300px)] pr-3"> 
            {renderTabContent()}
          </ScrollArea>
        </div>
      </main>
      {isAIChatModalOpen && (
        <AIChatModal
          isOpen={isAIChatModalOpen}
          onClose={closeAIChatModal}
          sectionKey={activeTab}
          currentSectionContentForPrompt={getCurrentSectionDataForPrompt()}
          proposalContext={{
            proposalTitle: currentProposal.proposalTitle,
            clientName: currentProposal.clientName,
            projectType: currentProposal.projectType,
          }}
          onApplyEdit={handleApplyChatEdit}
        />
      )}
    </div>
  );
}
