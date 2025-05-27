"use client";

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { ProposalForm } from '@/components/ProposalForm';
// ProposalDisplay is not used directly on this page anymore for the main generated proposal
// import { ProposalDisplay } from '@/components/ProposalDisplay'; 
import type { SavedProposal, ProposalFormData, StructuredProposal } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { handleGenerateProposalAction } from './actions';


const LOCAL_STORAGE_KEY_SIMPLE_SAVE = 'aiProposalGenerator_savedProposals_v2';
const SESSION_STORAGE_KEY_CURRENT_PROPOSAL = 'currentGeneratedProposalData';

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isGenerating, startGeneratingTransition] = useTransition();

  // State for simple text-based saved proposals (existing functionality)
  const [savedSimpleProposals, setSavedSimpleProposals] = useState<SavedProposal[]>([]);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  
  useEffect(() => {
    setIsLoadingPage(true);
    try {
      const items = localStorage.getItem(LOCAL_STORAGE_KEY_SIMPLE_SAVE);
      if (items) {
        setSavedSimpleProposals(JSON.parse(items));
      }
    } catch (error) {
      console.error("Failed to load simple proposals from localStorage", error);
      // toast({ title: "Error", description: "Could not load saved proposals.", variant: "destructive" });
    }
    setIsLoadingPage(false);
  }, []);

  const handleProposalFormSubmit = (formData: ProposalFormData) => {
    startGeneratingTransition(async () => {
      const result = await handleGenerateProposalAction(formData);
      if (result.proposal) {
        try {
          sessionStorage.setItem(SESSION_STORAGE_KEY_CURRENT_PROPOSAL, JSON.stringify(result.proposal));
          router.push('/proposal/view');
           toast({
            title: "Proposal Generated!",
            description: "Your detailed business proposal is ready to view.",
          });
        } catch (e) {
          console.error("Error saving to session storage or navigating:", e);
          toast({
            title: "Navigation Error",
            description: "Could not display the generated proposal.",
            variant: "destructive",
          });
        }
      } else if (result.error) {
        toast({
          title: "Generation Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };
  
  // This function is for the old simple save, kept for potential future use or if ProposalDisplay (simple version) is reintroduced
  const handleSaveSimpleProposal = (
    proposalDataToSave: Omit<SavedProposal, 'id' | 'createdAt'>
  ) => {
    const newSavedProposal: SavedProposal = {
        ...proposalDataToSave,
        id: Date.now().toString(), 
        createdAt: new Date().toISOString(),
    };
    const updatedProposals = [...savedSimpleProposals, newSavedProposal];
    
    setSavedSimpleProposals(updatedProposals);
    localStorage.setItem(LOCAL_STORAGE_KEY_SIMPLE_SAVE, JSON.stringify(updatedProposals));
    toast({ title: "Simple Proposal Saved!", description: "Your proposal (text version) is saved in browser storage." });
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
            onGenerate={handleProposalFormSubmit} 
            isGenerating={isGenerating}
        />
        {/* ProposalDisplay for structured proposal is now on /proposal/view */}
        {/* If you need to display simple text proposals here again, you might use the old ProposalDisplay component */}
      </main>
      <Footer />
    </div>
  );
}
