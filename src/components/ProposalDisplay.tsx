"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Save, Edit3, Check, XCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SavedProposal, ProposalFormData } from "@/lib/types";

interface ProposalDisplayProps {
  proposalText: string;
  originalFormData: ProposalFormData | null;
  onSaveProposal: (proposalToSave: Omit<SavedProposal, 'id' | 'createdAt'>) => void;
  onClearProposal: () => void;
}

export function ProposalDisplay({ proposalText, originalFormData, onSaveProposal, onClearProposal }: ProposalDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableText, setEditableText] = useState(proposalText);
  const { toast } = useToast();

  useEffect(() => {
    setEditableText(proposalText);
  }, [proposalText]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(editableText).then(() => {
      toast({ title: "Copied to clipboard!" });
    }).catch(err => {
      toast({ title: "Copy failed", description: err.message, variant: "destructive" });
    });
  };

  const handleSave = () => {
    if (!originalFormData) {
      toast({ title: "Save Failed", description: "Original form data not available.", variant: "destructive" });
      return;
    }
    onSaveProposal({ 
      ...originalFormData, 
      generatedProposalText: editableText 
    });
    setIsEditing(false); // Exit edit mode after saving
  };

  if (!proposalText && !isEditing) {
    return null; // Don't render if there's no proposal text and not in edit mode (e.g. initial state)
  }
  
  const projectName = originalFormData?.projectName || "Generated";
  const clientName = originalFormData?.companyClientName || "Proposal";


  return (
    <Card className="shadow-lg mt-8">
      <CardHeader className="flex flex-row justify-between items-start">
        <div>
          <CardTitle className="flex items-center text-xl">
            <FileText className="mr-2 h-6 w-6 text-primary" />
            {`${projectName} for ${clientName}`}
          </CardTitle>
          <CardDescription>Your generated business proposal.</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={onClearProposal} aria-label="Close Proposal View" className="flex-shrink-0">
          <XCircle className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={editableText}
            onChange={(e) => setEditableText(e.target.value)}
            className="min-h-[400px] text-sm leading-relaxed border-accent focus-visible:ring-accent"
            aria-label="Editable proposal content"
          />
        ) : (
          <div className="prose prose-sm max-w-none p-4 border rounded-md bg-secondary/30 min-h-[200px] whitespace-pre-wrap text-sm leading-relaxed">
            {editableText || "Proposal content will appear here."}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex gap-2">
          <Button onClick={handleCopyToClipboard} variant="outline" size="sm" aria-label="Copy proposal to clipboard">
            <Copy className="mr-2 h-4 w-4" /> Copy Text
          </Button>
          {isEditing ? (
            <Button onClick={() => { setIsEditing(false); setEditableText(proposalText); /* Revert changes on cancel */}} variant="outline" size="sm" aria-label="Cancel editing">
              <XCircle className="mr-2 h-4 w-4" /> Cancel Edit
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" aria-label="Edit proposal text">
              <Edit3 className="mr-2 h-4 w-4" /> Edit
            </Button>
          )}
        </div>
        <Button onClick={handleSave} size="sm" disabled={!originalFormData} aria-label="Save this proposal">
          <Save className="mr-2 h-4 w-4" /> {isEditing ? "Save Changes" : "Save Proposal"}
        </Button>
      </CardFooter>
    </Card>
  );
}
