
// src/app/actions.ts
"use server";

import { generateProposal as genkitGenerateProposal, GenerateProposalInput } from "@/ai/flows/generate-proposal";
import { improveSection as genkitImproveSection, ImproveSectionInput, ImproveSectionOutput } from "@/ai/flows/improve-section";
import type { ProposalFormData, StructuredProposal } from "@/lib/types";

// Removed unused camelToTitleCase function

export async function handleGenerateProposalAction(
  data: ProposalFormData
): Promise<{ proposal?: StructuredProposal; error?: string }> {
  try {
    const teamParts: string[] = [];
    const teamCompositionData = data.teamComposition;

    if (teamCompositionData) {
      if (teamCompositionData.frontendDeveloper && teamCompositionData.frontendDeveloper > 0) {
        teamParts.push(`${teamCompositionData.frontendDeveloper} Frontend Developer${teamCompositionData.frontendDeveloper > 1 ? 's' : ''}`);
      }
      if (teamCompositionData.backendDeveloper && teamCompositionData.backendDeveloper > 0) {
        teamParts.push(`${teamCompositionData.backendDeveloper} Backend Developer${teamCompositionData.backendDeveloper > 1 ? 's' : ''}`);
      }
      if (teamCompositionData.businessAnalyst && teamCompositionData.businessAnalyst > 0) {
        teamParts.push(`${teamCompositionData.businessAnalyst} Business Analyst${teamCompositionData.businessAnalyst > 1 ? 's' : ''}`);
      }
      if (teamCompositionData.uiUxDesigner && teamCompositionData.uiUxDesigner > 0) {
        teamParts.push(`${teamCompositionData.uiUxDesigner} UI/UX Designer${teamCompositionData.uiUxDesigner > 1 ? 's' : ''}`);
      }
      if (teamCompositionData.qaEngineer && teamCompositionData.qaEngineer > 0) {
        teamParts.push(`${teamCompositionData.qaEngineer} QA Engineer${teamCompositionData.qaEngineer > 1 ? 's' : ''}`);
      }
      if (teamCompositionData.projectManager && teamCompositionData.projectManager > 0) {
        teamParts.push(`${teamCompositionData.projectManager} Project Manager${teamCompositionData.projectManager > 1 ? 's' : ''}`);
      }
    }
    const finalTeamCompositionString = teamParts.join(', ');

    const input: GenerateProposalInput = {
      companyClientName: data.companyClientName,
      projectName: data.projectName,
      basicRequirements: data.basicRequirements,
      teamComposition: finalTeamCompositionString || undefined, 
    };
    const result = await genkitGenerateProposal(input);
    return { proposal: result };
  } catch (error) {
    console.error("Error generating proposal:", error);
    let errorMessage = "Failed to generate proposal. Please try again.";
    if (error instanceof Error) {
      if (error.message.includes("[503 Service Unavailable]") || error.message.toLowerCase().includes("is overloaded")) {
        errorMessage = "The AI service is currently busy. Please try again in a few moments.";
      } else if (error.message) { 
        errorMessage = error.message;
      } else {
        errorMessage = "An unexpected error occurred while generating the proposal. Please try again.";
      }
    }
    return { error: errorMessage };
  }
}

export async function handleImproveSectionAction(
  input: ImproveSectionInput
): Promise<{ improvedContent?: string; error?: string }> {
  try {
    const result: ImproveSectionOutput = await genkitImproveSection(input);
     if (result.improvedContent === undefined || result.improvedContent === null) {
        console.warn("handleImproveSectionAction: genkitImproveSection returned success but with no improvedContent.");
        return { error: "AI returned empty content unexpectedly. Please try again." };
    }
    return { improvedContent: result.improvedContent };
  } catch (error) {
    console.error("Error improving section with AI:", error); 
    let errorMessage = "An unexpected error occurred while improving the section. Please check server logs for details.";

    if (error instanceof Error) {
      if (error.message) { 
        if (error.message.includes("[503 Service Unavailable]") || error.message.toLowerCase().includes("is overloaded")) {
          errorMessage = "The AI service is currently busy. Please try again in a few moments.";
        } else {
          errorMessage = error.message; 
        }
      } else {
        errorMessage = "An unexpected error occurred while improving the section. Please try rephrasing or try again later.";
      }
    }
    return { error: errorMessage };
  }
}
