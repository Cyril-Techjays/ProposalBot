// src/app/actions.ts
"use server";

import { generateProposal as genkitGenerateProposal, GenerateProposalInput } from "@/ai/flows/generate-proposal";
// import { suggestIndustry as genkitSuggestIndustry, SuggestIndustryInput } from "@/ai/flows/suggest-industry"; // Removed as industry field is removed
import type { ProposalFormData } from "@/lib/types";

// Helper function to convert camelCase to Title Case
function camelToTitleCase(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1') // insert a space before all caps
    .replace(/^./, (s) => s.toUpperCase()); // capitalize the first char
}

export async function handleGenerateProposalAction(
  data: ProposalFormData
): Promise<{ proposal?: string; error?: string }> {
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
      teamComposition: selectedRoles || undefined, // Pass undefined if empty to let Handlebars condition work
    };
    const result = await genkitGenerateProposal(input);
    return { proposal: result.proposal };
  } catch (error) {
    console.error("Error generating proposal:", error);
    return { error: "Failed to generate proposal. Please try again." };
  }
}

// Removed handleSuggestIndustryAction as the industry field and its suggestion functionality are no longer part of the form.
// export async function handleSuggestIndustryAction(
//   companyName: string
// ): Promise<{ industries?: string[]; error?: string }> {
//   if (!companyName.trim()) {
//     return { industries: [] }; 
//   }
//   try {
//     const input: SuggestIndustryInput = { companyName };
//     const result = await genkitSuggestIndustry(input);
//     return { industries: result.industries };
//   } catch (error) {
//     console.error("Error suggesting industries:", error);
//     return { error: "Failed to suggest industries." };
//   }
// }
