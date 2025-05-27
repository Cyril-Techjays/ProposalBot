"use client";

import { useState, useEffect } from 'react';
import { Footer } from '@/components/Footer';
import { ProposalForm } from '@/components/ProposalForm';
import { ProposalDisplay } from '@/components/ProposalDisplay';
import type { SavedProposal, ProposalFormData } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'aiProposalGenerator_savedProposals_v2'; // Updated key for new structure

export default function HomePage() {
  const [generatedProposalText, setGeneratedProposalText] = useState<string>('');
  const [currentFormDataForDisplay, setCurrentFormDataForDisplay] = useState<ProposalFormData | null>(null);
  // Saved proposals logic is kept for persistence, though UI for listing/editing is removed from this page.
  const [savedProposals, setSavedProposals] = useState<SavedProposal[]>([]);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  
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
    setCurrentFormDataForDisplay(formData);
    // Scroll to display section
    setTimeout(() => {
        const displaySection = document.getElementById('proposal-display-section');
        displaySection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };
  
  const clearGeneratedProposal = () => {
    setGeneratedProposalText('');
    setCurrentFormDataForDisplay(null);
  };

  const handleSaveCurrentProposal = (
    proposalDataToSave: Omit<SavedProposal, 'id' | 'createdAt'>
  ) => {
    const newSavedProposal: SavedProposal = {
        ...proposalDataToSave,
        id: Date.now().toString(), 
        createdAt: new Date().toISOString(),
    };
    const updatedProposals = [...savedProposals, newSavedProposal];
    
    setSavedProposals(updatedProposals);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProposals));
    toast({ title: "Proposal Saved!", description: "Your proposal is saved in browser storage." });
    
    // Optionally clear after saving, or let user explicitly clear
    // clearGeneratedProposal(); 
  };

  if (isLoadingPage) {
    return (
        <div className="flex flex-col min-h-screen bg-background items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading AI Proposal Generator...</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header removed as per screenshot, title handled in-page */}
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12 md:py-16 flex flex-col items-center">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2 sm:mb-3">
            AI Proposal Generator
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl">
            Generate comprehensive project proposals in minutes
          </p>
        </div>

        <ProposalForm 
            onProposalGenerated={handleProposalGenerated} 
        />

        {generatedProposalText && currentFormDataForDisplay && (
          <div id="proposal-display-section" className="w-full max-w-3xl mt-10 sm:mt-12">
            <ProposalDisplay
              proposalText={generatedProposalText}
              originalFormData={currentFormDataForDisplay}
              onSaveProposal={handleSaveCurrentProposal} // Simplified save, always saves as new
              onClearProposal={clearGeneratedProposal}
            />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
