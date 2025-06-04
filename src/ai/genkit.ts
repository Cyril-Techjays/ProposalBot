import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'zod';

export const ai = genkit({
  plugins: [googleAI({
    apiKey: 'AIzaSyAuGaeiIyN5ZrYjrG_HSeiddW_xDDpffE0'
  })],
  model: 'googleai/gemini-2.0-flash',
});

// New prompt for generating feature and task breakdown
export const generateFeatureBreakdownPrompt = ai.definePrompt({
  name: 'generateFeatureBreakdownPrompt',
  input: { schema: z.string().describe('Project basic requirements description') },
  output: { 
    schema: z.array(z.object({
      name: z.string(),
      description: z.string(),
      isRequired: z.boolean(),
      tasks: z.array(z.object({
        name: z.string(),
        description: z.string(),
        estimatedHours: z.number().describe('Estimated hours for this task (should be positive)'),
        isRequired: z.boolean(),
      }))
    })).describe('Array of features with tasks and estimated hours') 
  },
  prompt: `Based on the following project requirements description, generate a detailed feature and task breakdown.

For each feature, provide a name, description, and indicate if it is required. Inside each feature, list the individual tasks required to complete that feature. For each task, provide a name, description, estimated hours (as a positive number), and indicate if it is required.

Ensure the estimated hours are realistic for a typical development team. The output should be a JSON array of feature objects.

Project Requirements Description:
{{{input}}}

Output Format (JSON array of objects):
[
  {
    "name": "Feature Name",
    "description": "Feature Description",
    "isRequired": true/false,
    "tasks": [
      {
        "name": "Task Name",
        "description": "Task Description",
        "estimatedHours": 10, // Number of hours
        "isRequired": true/false
      }
    ]
  }
]
`,
});
