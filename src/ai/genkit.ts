import {genkit} from 'genkit';
// import {googleAI} from '@genkit-ai/googleai'; // Temporarily commented out

export const ai = genkit({
  // plugins: [googleAI()], // Temporarily commented out
  plugins: [], // Initialize with no plugins
  // model: 'googleai/gemini-2.0-flash', // Temporarily commented out as no plugin provides it
});
