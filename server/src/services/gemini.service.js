import { geminiProvider } from '../providers/gemini.provider.js';

export class GeminiService {
  constructor(provider = geminiProvider) {
    this.provider = provider;
  }

  async generateResponse(prompt) {
    return this.provider.generateResponse(prompt);
  }
}

export const geminiService = new GeminiService();