
"use client";

import React, { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleImproveSectionAction } from '@/app/actions';
import type { ImproveSectionInput } from '@/ai/flows/improve-section';
import type { ProposalSectionKey } from './ProposalViewLayout';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionKey: ProposalSectionKey;
  currentSectionContentForPrompt: string; // This will be stringified JSON for complex objects or plain text
  proposalContext: {
    proposalTitle: string;
    clientName: string;
    projectType: string;
  };
  onApplyEdit: (sectionKey: ProposalSectionKey, newContentString: string) => void;
}

export function AIChatModal({
  isOpen,
  onClose,
  sectionKey,
  currentSectionContentForPrompt,
  proposalContext,
  onApplyEdit,
}: AIChatModalProps) {
  const [userPrompt, setUserPrompt] = useState('');
  const [isProcessing, startProcessingTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!userPrompt.trim()) {
      toast({ title: "Input Required", description: "Please enter your editing instructions.", variant: "destructive" });
      return;
    }

    startProcessingTransition(async () => {
      const input: ImproveSectionInput = {
        sectionKey,
        currentSectionContent: currentSectionContentForPrompt,
        userPrompt,
        proposalContext,
      };

      const result = await handleImproveSectionAction(input);

      if (result.improvedContent) {
        onApplyEdit(sectionKey, result.improvedContent);
        toast({ title: "AI Edit Applied", description: `The ${sectionKey} section has been updated.` });
        setUserPrompt(''); // Clear prompt on success
        onClose(); // Close modal on success
      } else {
        toast({
          title: "AI Edit Failed",
          description: result.error || "An unknown error occurred while applying AI edits.",
          variant: "destructive",
        });
      }
    });
  };

  const handleModalClose = () => {
    if (!isProcessing) {
      setUserPrompt(''); // Clear prompt if modal is closed without submitting
      onClose();
    }
  };
  
  const sectionTitle = sectionKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleModalClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Wand2 className="h-5 w-5 mr-2 text-primary" />
            AI Edit Assistant: <span className="font-normal ml-1 text-muted-foreground">{sectionTitle}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="ai-prompt" className="text-sm font-medium">
              How would you like to change this section?
            </Label>
            <Textarea
              id="ai-prompt"
              placeholder={`e.g., "Make the tone more formal", "Add a point about scalability", "Shorten this by 20%"`}
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className="min-h-[100px] mt-1"
              disabled={isProcessing}
            />
            <p className="text-xs text-muted-foreground mt-1">
              The AI will use the current content of the '{sectionTitle}' section as context.
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isProcessing} onClick={handleModalClose}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Apply AI Edit
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
