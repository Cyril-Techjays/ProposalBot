
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { StructuredProposal } from '@/lib/types';
import { ProposalViewLayout } from '@/components/proposal-view/ProposalViewLayout';
import { useToast } from '@/hooks/use-toast';

const SESSION_STORAGE_KEY_CURRENT_PROPOSAL = 'currentGeneratedProposalData';

export default function ProposalViewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [initialProposalData, setInitialProposalData] = useState<StructuredProposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedData = sessionStorage.getItem(SESSION_STORAGE_KEY_CURRENT_PROPOSAL);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setInitialProposalData(parsedData);
        // We keep the data in sessionStorage to allow refresh, 
        // ProposalViewLayout will handle updates to a working copy.
      } else {
        setError("No proposal data found. Please generate a new proposal.");
        toast({
          title: "Error Loading Proposal",
          description: "No proposal data found in session. Please generate a new one.",
          variant: "destructive",
        });
        // Optional: Redirect back to home page if no data
        // router.replace('/'); 
      }
    } catch (e) {
      console.error("Failed to load proposal data from session storage:", e);
      setError("Failed to load proposal data. It might be corrupted.");
       toast({
          title: "Error Loading Proposal",
          description: "Could not parse proposal data from session.",
          variant: "destructive",
        });
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]); // Removed initialProposalData from dependencies

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Proposal...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center p-4">
        <h1 className="text-2xl font-semibold text-destructive mb-4">Error Displaying Proposal</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button 
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Go to Generator
        </button>
      </div>
    );
  }

  if (!initialProposalData) {
     // This case should ideally be handled by the error state if storedData is null
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center">
        <p className="text-muted-foreground">No proposal to display.</p>
         <button 
          onClick={() => router.push('/')}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Generate New Proposal
        </button>
      </div>
    );
  }

  // Pass initialProposalData to ProposalViewLayout. It will manage its own state for edits.
  return <ProposalViewLayout initialProposal={initialProposalData} />;
}
