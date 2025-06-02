
"use client";

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { ProposalForm } from '@/components/ProposalForm';
// ProposalDisplay is not used directly on this page anymore for the main generated proposal
// SavedProposalsList is also removed as part of simplifying to structured proposals
import type { ProposalFormData, StructuredProposal } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { handleGenerateProposalAction } from './actions';

// Removed LOCAL_STORAGE_KEY_SIMPLE_SAVE
const SESSION_STORAGE_KEY_CURRENT_PROPOSAL = 'currentGeneratedProposalData';

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isGenerating, startGeneratingTransition] = useTransition();

  // Removed state for simple text-based saved proposals
  // const [savedSimpleProposals, setSavedSimpleProposals] = useState<SavedProposal[]>([]);
  const [isLoadingPage, setIsLoadingPage] = useState(true); // Keep for initial page load visual
  
  useEffect(() => {
    // Minimal effect, can be expanded if other async setup is needed
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
  
  // Removed handleSaveSimpleProposal function

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
        {/* SavedProposalsList is removed */}
      </main>
      <Footer />
    </div>
  );
}
