import { ValidationError } from '../utils/errors.js';
import { geminiService } from '../services/gemini.service.js';

export async function postGeminiTest(request, response) {
  const prompt = request.body?.prompt;

  if (typeof prompt !== 'string' || !prompt.trim()) {
    throw new ValidationError('Prompt is required', {
      field: 'prompt'
    });
  }

  const geminiResponse = await geminiService.generateResponse(prompt);

  response.status(200).json({
    response: geminiResponse
  });
}