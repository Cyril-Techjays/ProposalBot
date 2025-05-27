
"use client";

import React, { useState, useEffect } from 'react';
import type { StructuredProposal } from '@/lib/types';
import { ProposalHeader } from './ProposalHeader';
import { ProposalTabs } from './ProposalTabs';
import { ExecutiveSummarySection } from './ExecutiveSummarySection';
import { GenericSection } from './GenericSection';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AIChatModal } from './AIChatModal'; // Import the new modal
import { useToast } from '@/hooks/use-toast';

const SESSION_STORAGE_KEY_CURRENT_PROPOSAL = 'currentGeneratedProposalData';

interface ProposalViewLayoutProps {
  initialProposal: StructuredProposal; // Changed from 'proposal' to 'initialProposal'
}

export type ProposalSectionKey = 
  | 'executiveSummary' 
  | 'requirementsAnalysis' 
  | 'featureBreakdown' 
  | 'projectTimelineSection' 
  | 'budgetAndInvestmentSection' 
  | 'teamAndResources';

export function ProposalViewLayout({ initialProposal }: ProposalViewLayoutProps) {
  const [currentProposal, setCurrentProposal] = useState<StructuredProposal>(initialProposal);
  const [activeTab, setActiveTab] = useState<ProposalSectionKey>('executiveSummary');
  const [isAIChatModalOpen, setIsAIChatModalOpen] = useState(false);
  const { toast } = useToast();

  // Effect to update currentProposal if initialProposal changes (e.g., due to page refresh with new session data)
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
        return currentProposal.requirementsAnalysis.content;
      case 'featureBreakdown':
        return currentProposal.featureBreakdown.content;
      case 'projectTimelineSection':
        return currentProposal.projectTimelineSection.content;
      case 'budgetAndInvestmentSection':
        return currentProposal.budgetAndInvestmentSection.content;
      case 'teamAndResources':
        return currentProposal.teamAndResources.content;
      default:
        const exhaustiveCheck: never = activeTab; // Ensures all cases are handled
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
          updatedProposal.requirementsAnalysis = { ...updatedProposal.requirementsAnalysis, content: newContentString };
          break;
        case 'featureBreakdown':
          updatedProposal.featureBreakdown = { ...updatedProposal.featureBreakdown, content: newContentString };
          break;
        case 'projectTimelineSection':
          updatedProposal.projectTimelineSection = { ...updatedProposal.projectTimelineSection, content: newContentString };
          break;
        case 'budgetAndInvestmentSection':
          updatedProposal.budgetAndInvestmentSection = { ...updatedProposal.budgetAndInvestmentSection, content: newContentString };
          break;
        case 'teamAndResources':
          updatedProposal.teamAndResources = { ...updatedProposal.teamAndResources, content: newContentString };
          break;
        default:
          const exhaustiveCheck: never = sectionKey; // Ensures all cases are handled
          throw new Error(\`Unknown section key: \${exhaustiveCheck}\`);
      }
      setCurrentProposal(updatedProposal);
      sessionStorage.setItem(SESSION_STORAGE_KEY_CURRENT_PROPOSAL, JSON.stringify(updatedProposal));
      // Toast is now handled by the modal on success/failure
      // toast({ title: "Section Updated", description: \`\${sectionKey} has been updated by AI.\` });
    } catch (e) {
      console.error("Error applying AI edit:", e);
      toast({ title: "Update Failed", description: "AI returned invalid data or an error occurred.", variant: "destructive" });
    }
  };


  const renderTabContent = () => {
    if (!currentProposal) return null; // Ensure currentProposal is available

    switch (activeTab) {
      case 'executiveSummary':
        return <ExecutiveSummarySection data={currentProposal.executiveSummary} />;
      case 'requirementsAnalysis':
        return <GenericSection title="Requirements Analysis" content={currentProposal.requirementsAnalysis.content} />;
      case 'featureBreakdown':
        return <GenericSection title="Feature Breakdown" content={currentProposal.featureBreakdown.content} />;
      case 'projectTimelineSection':
        return <GenericSection title="Project Timeline" content={currentProposal.projectTimelineSection.content} />;
      case 'budgetAndInvestmentSection':
        return <GenericSection title="Budget & Investment" content={currentProposal.budgetAndInvestmentSection.content} />;
      case 'teamAndResources':
        return <GenericSection title="Team & Resources" content={currentProposal.teamAndResources.content} />;
      default:
        return null;
    }
  };

  if (!currentProposal) { // Handle case where currentProposal might not be set yet
    return <div>Loading proposal data...</div>; // Or some other loading indicator
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ProposalHeader
        title={currentProposal.proposalTitle}
        clientName={currentProposal.clientName}
        projectType={currentProposal.projectType}
        summaryBadges={currentProposal.summaryBadges}
        onAIChatClick={openAIChatModal} // Pass the handler
      />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ProposalTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="mt-6 bg-card p-6 rounded-lg shadow-md">
           <ScrollArea className="h-[calc(100vh-300px)] pr-3"> {/* Adjust height as needed, added pr-3 for scrollbar */}
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
      {/* Optional Footer can be added here if needed on this page */}
    </div>
  );
}
