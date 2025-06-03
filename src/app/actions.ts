// src/app/actions.ts
"use server";

import { generateProposal as genkitGenerateProposal, GenerateProposalInput } from "@/ai/flows/generate-proposal";
import { improveSection as genkitImproveSection, ImproveSectionInput, ImproveSectionOutput } from "@/ai/flows/improve-section";
import type { ProposalFormData, StructuredProposal, MultiStepProposalFormData } from "@/lib/types";

export async function handleGenerateProposalAction(
  data: MultiStepProposalFormData
): Promise<{ proposal?: StructuredProposal; error?: string }> {
  try {
    const input: GenerateProposalInput = {
      companyClientName: data.companyClientName,
      projectName: data.projectName,
      basicRequirements: data.basicRequirements,
      teamComposition: JSON.stringify(data.teamCompositionData),
    };
    const result = await genkitGenerateProposal(input);
    return { proposal: result };
  } catch (error) {
    console.error("Error generating proposal:", error);
    let errorMessage = "Failed to generate proposal. Please try again.";
    if (error instanceof Error) {
      if (error.message.includes("[503 Service Unavailable]") || error.message.toLowerCase().includes("is overloaded")) {
        errorMessage = "The AI service is currently busy. Please try again in a few moments.";
      } else if (error.message === "AI failed to generate a structured proposal.") {
        errorMessage = "The AI could not create a proposal matching the detailed requirements or structure. This can sometimes happen with complex requests. Please try simplifying your project requirements or try generating again.";
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = "An unexpected error occurred while generating the proposal (the AI service returned an error without a message). Please try again.";
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
    
    // This check remains as a final safeguard, though the flow should ideally throw an error before this.
     if (result.improvedSectionContent === undefined || result.improvedSectionContent === null) {
        console.warn("ACTION_WARN: genkitImproveSection (AI flow) returned successfully but 'improvedSectionContent' was undefined or null. This is highly unexpected as the flow should throw an error if content is not a string. Input:", input);
        return { error: "AI Edit Error: The AI flow completed but returned an empty or invalid content structure unexpectedly. Please try again or check server logs." };
    }
    return { improvedContent: result.improvedSectionContent };
  } catch (error) {
    console.error("ACTION_ERROR: Error improving section with AI:", error);
    // Default error message
    let errorMessage = "An unexpected error occurred while improving the section. Please check server logs for more details.";

    if (error instanceof Error) {
      if (error.message) {
        // Prioritize specific error messages from the flow or service
        if (error.message.includes("[503 Service Unavailable]") || error.message.toLowerCase().includes("is overloaded")) {
          errorMessage = "The AI service is currently busy. Please try again in a few moments.";
        } else if (error.message.includes("AI_FLOW_ERROR_PROMPT_OUTPUT_INVALID")) { 
            errorMessage = `AI Edit Failed: ${error.message.replace("AI_FLOW_ERROR_PROMPT_OUTPUT_INVALID:", "").trim()}`;
        } else if (error.message.includes("AI_FLOW_ERROR_JSON_PARSE_FAILED")) { 
            errorMessage = `AI Edit Failed: ${error.message.replace("AI_FLOW_ERROR_JSON_PARSE_FAILED:", "").trim()}`;
        } else if (error.message.includes("AI_FLOW_ERROR_EMPTY_JSON_STRING")) { 
            errorMessage = `AI Edit Failed: ${error.message.replace("AI_FLOW_ERROR_EMPTY_JSON_STRING:", "").trim()}`;
        } else if (error.message.includes("AI_FLOW_ERROR_INTERNAL_TYPE")) { 
            errorMessage = `AI Edit Failed: ${error.message.replace("AI_FLOW_ERROR_INTERNAL_TYPE:", "").trim()}. Please report this issue.`;
        }
        // Fallback to the generic error message if it's not one of the handled specific messages.
        else {
             errorMessage = error.message; 
        }
      } else { 
        errorMessage = "AI processing failed with an unspecified error (the AI service returned an error without a message). Please try rephrasing your request or try again later.";
      }
    }
    return { error: errorMessage };
  }
}

