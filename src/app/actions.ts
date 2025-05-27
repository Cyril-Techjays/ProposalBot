// src/app/actions.ts
"use server";

import { generateProposal as genkitGenerateProposal, GenerateProposalInput } from "@/ai/flows/generate-proposal";
import type { ProposalFormData, StructuredProposal } from "@/lib/types";

// Helper function to convert camelCase to Title Case
function camelToTitleCase(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1') // insert a space before all caps
    .replace(/^./, (s) => s.toUpperCase()); // capitalize the first char
}

export async function handleGenerateProposalAction(
  data: ProposalFormData
): Promise<{ proposal?: StructuredProposal; error?: string }> {
  try {
    const selectedRoles = data.teamComposition 
      ? Object.entries(data.teamComposition)
          .filter(([,isSelected]) => isSelected)
          .map(([role]) => camelToTitleCase(role))
          .join(', ')
      : '';

    const input: GenerateProposalInput = {
      companyClientName: data.companyClientName,
      projectName: data.projectName,
      basicRequirements: data.basicRequirements,
      teamComposition: selectedRoles || undefined, 
    };
    const result = await genkitGenerateProposal(input);
    return { proposal: result };
  } catch (error) {
    console.error("Error generating proposal:", error);
    // Check if error is an object and has a message property
    const errorMessage = (error instanceof Error) ? error.message : "Failed to generate proposal. Please try again.";
    return { error: errorMessage };
  }
}
