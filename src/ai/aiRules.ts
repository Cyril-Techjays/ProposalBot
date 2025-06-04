import { z } from 'zod';
import { generateFeatureBreakdownPrompt } from './genkit';

// Define types for our rules
export type SeniorityLevel = 'junior' | 'mid' | 'senior';
export type Feature = {
  name: string;
  description: string;
  tasks: Task[];
  isRequired: boolean;
};

export type Task = {
  name: string;
  description: string;
  estimatedHours: number;
  isRequired: boolean;
};

// Validation schema for features and tasks
const taskSchema = z.object({
  name: z.string(),
  description: z.string(),
  estimatedHours: z.number().positive(),
  isRequired: z.boolean(),
});

const featureSchema = z.object({
  name: z.string(),
  description: z.string(),
  tasks: z.array(taskSchema),
  isRequired: z.boolean(),
});

// Timeline estimation based on seniority
const getTimelineMultiplier = (seniority: SeniorityLevel): number => {
  switch (seniority) {
    case 'junior':
      return 1.5; // 50% more time
    case 'mid':
      return 1.2; // 20% more time
    case 'senior':
      return 1.0; // Base time
    default:
      return 1.0;
  }
};

// Function to validate features and tasks
export const validateFeaturesAndTasks = (features: Feature[]): Feature[] => {
  return features.map(feature => {
    try {
      // Validate the feature
      const validatedFeature = featureSchema.parse(feature);
      
      // Validate all tasks within the feature
      const validatedTasks = validatedFeature.tasks.map(task => {
        try {
          return taskSchema.parse(task);
        } catch (error) {
          console.error(`Invalid task in feature ${feature.name}:`, error);
          return task;
        }
      });

      return {
        ...validatedFeature,
        tasks: validatedTasks,
      };
    } catch (error) {
      console.error(`Invalid feature: ${feature.name}`, error);
      return feature;
    }
  });
};

// Function to estimate timeline based on features, tasks, and seniority
export const estimateTimeline = (
  features: Feature[],
  seniority: SeniorityLevel
): number => {
  const multiplier = getTimelineMultiplier(seniority);
  
  // Calculate total hours from all tasks
  const totalHours = features.reduce((acc, feature) => {
    const featureHours = feature.tasks.reduce((taskAcc, task) => {
      return taskAcc + task.estimatedHours;
    }, 0);
    return acc + featureHours;
  }, 0);

  // Convert hours to weeks (assuming 40-hour work weeks)
  const weeks = (totalHours * multiplier) / 40;
  
  return Math.ceil(weeks);
};

// Function to generate feature and task breakdown from description
export const generateFeatureBreakdown = async (description: string): Promise<Feature[]> => {
  try {
    const { output } = await generateFeatureBreakdownPrompt(description);
    // The output should match the Feature[] structure based on the prompt schema, but could be null
    return output || [];
  } catch (error) {
    console.error("Error generating feature breakdown from AI:", error);
    return []; // Return empty array in case of error
  }
};

// Main function to process the proposal generation
export const processProposalGeneration = async (
  description: string,
  seniority: SeniorityLevel
) => {
  // 1. Generate feature and task breakdown
  const features = await generateFeatureBreakdown(description);
  
  // 2. Validate the breakdown
  const validatedFeatures = validateFeaturesAndTasks(features);
  
  // 3. Calculate timeline based on seniority
  const timeline = estimateTimeline(validatedFeatures, seniority);
  
  return {
    features: validatedFeatures,
    timeline,
  };
}; 