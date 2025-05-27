"use client";

import { ListChecks, Trash2, Eye, Edit3 } from "lucide-react";
import type { SavedProposal } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface SavedProposalsListProps {
  proposals: SavedProposal[];
  onLoadProposal: (proposal: SavedProposal) => void;
  onDeleteProposal: (proposalId: string) => void;
  onEditProposal: (proposal: SavedProposal) => void; 
}

export function SavedProposalsList({ proposals, onLoadProposal, onDeleteProposal, onEditProposal }: SavedProposalsListProps) {
  if (proposals.length === 0) {
    return (
      <Card className="mt-8 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <ListChecks className="mr-2 h-6 w-6 text-primary" />
            Saved Proposals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You have no saved proposals yet. Create one to see it here!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <ListChecks className="mr-2 h-6 w-6 text-primary" />
          Saved Proposals
        </CardTitle>
        <CardDescription>View, edit the details, or delete your previously generated proposals.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4 -mr-4"> {/* Added negative margin to compensate for scrollbar */}
          <ul className="space-y-3">
            {proposals.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((p) => (
              <li key={p.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg hover:shadow-md transition-shadow bg-card">
                <div className="flex-grow mb-3 sm:mb-0 mr-4">
                  <h4 className="font-semibold text-foreground text-md">
                    {p.projectName || "Untitled Project"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    For: {p.companyClientName || "Client"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Saved on: {new Date(p.createdAt).toLocaleDateString()} at {new Date(p.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0 self-start sm:self-center">
                  <Button variant="outline" size="icon" onClick={() => onLoadProposal(p)} title="View Proposal Content">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => onEditProposal(p)} title="Edit Proposal Details & Regenerate">
                     <Edit3 className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" title="Delete Proposal">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the proposal titled 
                          "{p.projectName || "Untitled Project"} for {p.companyClientName || "Client"}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDeleteProposal(p.id)} className="bg-destructive hover:bg-destructive/90">
                          Yes, delete it
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
