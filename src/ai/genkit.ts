import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({
    apiKey: 'AIzaSyAuGaeiIyN5ZrYjrG_HSeiddW_xDDpffE0'
  })],
  model: 'googleai/gemini-2.0-flash',
});
