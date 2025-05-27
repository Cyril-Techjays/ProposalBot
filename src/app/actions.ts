// src/app/actions.ts
"use server";

import { generateProposal as genkitGenerateProposal, GenerateProposalInput } from "@/ai/flows/generate-proposal";
import { suggestIndustry as genkitSuggestIndustry, SuggestIndustryInput } from "@/ai/flows/suggest-industry";
import type { ProposalFormData } from "@/lib/types";

export async function handleGenerateProposalAction(
  data: ProposalFormData
): Promise<{ proposal?: string; error?: string }> {
  try {
    const input: GenerateProposalInput = {
      companyClientName: data.companyClientName,
      projectName: data.projectName,
      industry: data.industry,
      businessObjectives: data.businessObjectives,
      currentPainPoints: data.currentPainPoints,
      proposedSolution: data.proposedSolution,
      timeline: data.timeline,
      budget: data.budget,
      teamSize: data.teamSize,
      techStack: data.techStack,
    };
    const result = await genkitGenerateProposal(input);
    return { proposal: result.proposal };
  } catch (error) {
    console.error("Error generating proposal:", error);
    return { error: "Failed to generate proposal. Please try again." };
  }
}

export async function handleSuggestIndustryAction(
  companyName: string
): Promise<{ industries?: string[]; error?: string }> {
  if (!companyName.trim()) {
    return { industries: [] }; // Return empty if company name is empty
  }
  try {
    const input: SuggestIndustryInput = { companyName };
    const result = await genkitSuggestIndustry(input);
    return { industries: result.industries };
  } catch (error) {
    console.error("Error suggesting industries:", error);
    // Return empty array or a generic error message for the user
    return { error: "Failed to suggest industries." };
  }
}
