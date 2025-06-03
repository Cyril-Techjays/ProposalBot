"use client";

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { ProposalForm } from '@/components/ProposalForm';
import { TeamCompositionStep } from '@/components/TeamCompositionStep';
// ProposalDisplay is not used directly on this page anymore for the main generated proposal
// SavedProposalsList is also removed as part of simplifying to structured proposals
import type { StructuredProposal, MultiStepProposalFormData } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { handleGenerateProposalAction } from './actions';

// Removed LOCAL_STORAGE_KEY_SIMPLE_SAVE
const SESSION_STORAGE_KEY_CURRENT_PROPOSAL = 'currentGeneratedProposalData';

// Define initial state for multi-step form data
const initialFormData: MultiStepProposalFormData = {
  companyClientName: "",
  projectName: "",
  basicRequirements: "",
  teamCompositionData: [],
};

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isGenerating, startGeneratingTransition] = useTransition();

  // Removed state for simple text-based saved proposals
  // const [savedSimpleProposals, setSavedSimpleProposals] = useState<SavedProposal[]>([]);
  const [isLoadingPage, setIsLoadingPage] = useState(true); // Keep for initial page load visual
  
  // State for managing the current step
  const [currentStep, setCurrentStep] = useState(1); // Start at step 1
  // State for storing form data across steps
  const [formData, setFormData] = useState<MultiStepProposalFormData>(initialFormData);

  
  useEffect(() => {
    // Minimal effect, can be expanded if other async setup is needed
    setIsLoadingPage(false); 
  }, []);

  // Handle submission of the first step (basic info)
  const handleNextStep = (data: MultiStepProposalFormData) => {
    setFormData(data); // Save data from step 1
    setCurrentStep(2); // Move to step 2
  };

  // Handle going back from the second step
  const handlePreviousStep = (data: MultiStepProposalFormData) => {
     // Optionally save current data before going back if needed
     setFormData(data); // Save current state of step 2 form
     setCurrentStep(1); // Move back to step 1
  };

  // Handle submission of the final step (team composition) and trigger generation
  const handleGenerateProposal = (data: MultiStepProposalFormData) => {
    // This function will now be called from TeamCompositionStep with complete data
    startGeneratingTransition(async () => {
      const result = await handleGenerateProposalAction(data); // Pass complete data
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

        {/* Conditionally render steps */}
        {currentStep === 1 && (
          <ProposalForm 
            onNext={handleNextStep} // Pass the next step handler
            initialData={formData} // Pass current form data (useful for going back)
            isGenerating={isGenerating} // Keep generating state for now, might be used differently later
          />
        )}

        {currentStep === 2 && (
          <TeamCompositionStep
             initialData={formData} // Pass data from step 1 and potentially previous team composition
             onGenerate={handleGenerateProposal} // Pass the generate handler
             onPrevious={handlePreviousStep} // Pass the previous step handler
             isGenerating={isGenerating}
          />
        )}

        {/* ProposalDisplay for structured proposal is now on /proposal/view */}
        {/* SavedProposalsList is removed */}
      </main>
      <Footer />
    </div>
  );
}
