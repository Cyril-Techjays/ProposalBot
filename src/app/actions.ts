
// src/app/actions.ts
"use server";

import { generateProposal as genkitGenerateProposal, GenerateProposalInput } from "@/ai/flows/generate-proposal";
import { improveSection as genkitImproveSection, ImproveSectionInput, ImproveSectionOutput } from "@/ai/flows/improve-section";
import type { ProposalFormData, StructuredProposal } from "@/lib/types";

// Helper function to convert camelCase to Title Case (already present, reused)
function camelToTitleCase(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1') 
    .replace(/^./, (s) => s.toUpperCase());
}

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
      // Number roles (previously boolean)
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
    const errorMessage = (error instanceof Error) ? error.message : "Failed to generate proposal. Please try again.";
    return { error: errorMessage };
  }
}

export async function handleImproveSectionAction(
  input: ImproveSectionInput
): Promise<{ improvedContent?: string; error?: string }> {
  try {
    const result: ImproveSectionOutput = await genkitImproveSection(input);
    return { improvedContent: result.improvedContent };
  } catch (error) {
    console.error("Error improving section with AI:", error);
    const errorMessage = (error instanceof Error) ? error.message : "Failed to improve section. Please try again.";
    return { error: errorMessage };
  }
}

