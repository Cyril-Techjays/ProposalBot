import { config } from 'dotenv';
config();

import '@/ai/flows/improve-proposal.ts';
// import '@/ai/flows/suggest-industry.ts'; // Removed as industry field is removed
import '@/ai/flows/generate-proposal.ts';
