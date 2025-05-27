"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProposalForm } from '@/components/ProposalForm';
import { ProposalDisplay } from '@/components/ProposalDisplay';
import { SavedProposalsList } from '@/components/SavedProposalsList';
import { Button } from '@/components/ui/button';
import { PlusCircle, ListChecks, Loader2 } from 'lucide-react';
import type { SavedProposal, ProposalFormData } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_KEY = 'proposalCraftAI_savedProposals_v1';

export default function HomePage() {
  const [generatedProposalText, setGeneratedProposalText] = useState<string>('');
  const [currentFormData, setCurrentFormData] = useState<ProposalFormData | null>(null);
  const [savedProposals, setSavedProposals] = useState<SavedProposal[]>([]);
  const [view, setView] = useState<'form' | 'saved'>('form'); 
  const [editingProposalData, setEditingProposalData] = useState<ProposalFormData & {id?: string, createdAt?: string} | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true); // For initial localStorage load
  
  const { toast } = useToast();

  useEffect(() => {
    setIsLoadingPage(true);
    try {
      const items = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (items) {
        setSavedProposals(JSON.parse(items));
      }
    } catch (error) {
      console.error("Failed to load proposals from localStorage", error);
      toast({ title: "Error", description: "Could not load saved proposals.", variant: "destructive" });
    }
    setIsLoadingPage(false);
  }, [toast]);

  const handleProposalGenerated = (proposal: string, formData: ProposalFormData) => {
    setGeneratedProposalText(proposal);
    setCurrentFormData(formData);
    // If we were editing, this generated proposal is the result of that edit
    if (editingProposalData?.id) {
        handleSaveProposal({
            ...formData,
            generatedProposalText: proposal,
        }, editingProposalData.id, editingProposalData.createdAt || new Date().toISOString());
    }
  };
  
  const clearGeneratedProposal = () => {
    setGeneratedProposalText('');
    setCurrentFormData(null);
    // Don't clear editingProposalData here, user might want to go back to the form with it
  };

  const handleSaveProposal = (
    proposalDataToSave: ProposalFormData & { generatedProposalText: string },
    existingId?: string,
    existingCreatedAt?: string
  ) => {
    let updatedProposals;
    let actionToastTitle = "Proposal Saved!";

    if (existingId) { // This is an update to an existing saved proposal
        const index = savedProposals.findIndex(p => p.id === existingId);
        if (index !== -1) {
            const updatedProposal: SavedProposal = {
                ...proposalDataToSave,
                id: existingId,
                createdAt: existingCreatedAt || savedProposals[index].createdAt, // Preserve original creation if not provided
            };
            updatedProposals = [...savedProposals];
            updatedProposals[index] = updatedProposal;
            actionToastTitle = "Proposal Updated!";
        } else { // ID provided but not found, treat as new (should not happen if logic is correct)
            const newSavedProposal: SavedProposal = {
                ...proposalDataToSave,
                id: Date.now().toString(), 
                createdAt: new Date().toISOString(),
            };
            updatedProposals = [...savedProposals, newSavedProposal];
        }
    } else { // This is a new proposal to save
        const newSavedProposal: SavedProposal = {
            ...proposalDataToSave,
            id: Date.now().toString(), 
            createdAt: new Date().toISOString(),
        };
        updatedProposals = [...savedProposals, newSavedProposal];
    }
    
    setSavedProposals(updatedProposals);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProposals));
    toast({ title: actionToastTitle, description: "Your changes are now in your saved list." });
    
    setGeneratedProposalText(''); 
    setCurrentFormData(null);
    setEditingProposalData(null); 
    setView('saved'); 
  };


  const handleLoadProposalForDisplay = (proposal: SavedProposal) => {
    setGeneratedProposalText(proposal.generatedProposalText);
    const formDataFromSaved: ProposalFormData = { // Reconstruct ProposalFormData
        companyClientName: proposal.companyClientName,
        projectName: proposal.projectName,
        industry: proposal.industry,
        businessObjectives: proposal.businessObjectives,
        currentPainPoints: proposal.currentPainPoints,
        proposedSolution: proposal.proposedSolution,
        timeline: proposal.timeline,
        budget: proposal.budget,
        teamSize: proposal.teamSize,
        techStack: proposal.techStack,
    };
    setCurrentFormData(formDataFromSaved);
    setEditingProposalData(null); 
    setView('form'); 
    // Smooth scroll to the display section
    setTimeout(() => {
        const displaySection = document.getElementById('proposal-display-section');
        displaySection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDeleteProposal = (proposalId: string) => {
    const proposalToDelete = savedProposals.find(p => p.id === proposalId);
    const updatedProposals = savedProposals.filter(p => p.id !== proposalId);
    setSavedProposals(updatedProposals);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProposals));
    toast({ title: "Proposal Deleted", description: `"${proposalToDelete?.projectName || 'Proposal'}" has been removed.` });
    
    // If the deleted proposal was being viewed or edited, clear the view
    if (currentFormData?.projectName === proposalToDelete?.projectName && currentFormData?.companyClientName === proposalToDelete?.companyClientName) {
        clearGeneratedProposal();
    }
    if (editingProposalData?.id === proposalId) {
        setEditingProposalData(null);
        setView('form'); // Go back to a clean form
    }
  };
  
  const handleEditProposalDetails = (proposalToEdit: SavedProposal) => {
    setEditingProposalData({ // Set this to populate the form
        id: proposalToEdit.id, // Keep ID for saving later
        createdAt: proposalToEdit.createdAt, // Keep createdAt
        companyClientName: proposalToEdit.companyClientName,
        projectName: proposalToEdit.projectName,
        industry: proposalToEdit.industry,
        businessObjectives: proposalToEdit.businessObjectives,
        currentPainPoints: proposalToEdit.currentPainPoints,
        proposedSolution: proposalToEdit.proposedSolution,
        timeline: proposalToEdit.timeline,
        budget: proposalToEdit.budget,
        teamSize: proposalToEdit.teamSize,
        techStack: proposalToEdit.techStack,
    });
    setGeneratedProposalText(''); // Clear any currently displayed proposal text
    setCurrentFormData(null); // Clear current form data for display
    setView('form'); // Switch to form to edit
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const startNewProposal = () => {
    setEditingProposalData(null); // Clear any editing state
    setGeneratedProposalText('');
    setCurrentFormData(null);
    setView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (isLoadingPage) {
    return (
        <div className="flex flex-col min-h-screen bg-background items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading ProposalCraft AI...</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
            <Button 
                variant={view === 'form' && !editingProposalData ? 'default' : 'outline'} 
                onClick={startNewProposal}
                className="text-sm sm:text-base py-2 px-4 sm:py-3 sm:px-6 shadow-sm flex-grow sm:flex-grow-0"
            >
                <PlusCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> New Proposal
            </Button>
            <Button 
                variant={view === 'saved' ? 'default' : 'outline'} 
                onClick={() => setView('saved')}
                className="text-sm sm:text-base py-2 px-4 sm:py-3 sm:px-6 shadow-sm flex-grow sm:flex-grow-0"
            >
                <ListChecks className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Saved Proposals ({savedProposals.length})
            </Button>
        </div>

        {view === 'form' && (
          <>
            <ProposalForm 
                onProposalGenerated={handleProposalGenerated} 
                initialData={editingProposalData || undefined} // Pass data if editing
            />
            {generatedProposalText && currentFormData && (
              <div id="proposal-display-section" className="mt-8">
                <ProposalDisplay
                  proposalText={generatedProposalText}
                  originalFormData={currentFormData}
                  onSaveProposal={(data) => handleSaveProposal(data, editingProposalData?.id, editingProposalData?.createdAt)}
                  onClearProposal={clearGeneratedProposal}
                />
              </div>
            )}
          </>
        )}

        {view === 'saved' && (
          <SavedProposalsList
            proposals={savedProposals}
            onLoadProposal={handleLoadProposalForDisplay}
            onDeleteProposal={handleDeleteProposal}
            onEditProposal={handleEditProposalDetails}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
