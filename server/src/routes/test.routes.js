import { Router } from 'express';
import { postGeminiTest } from '../controllers/geminiController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const testRouter = Router();

testRouter.post('/gemini', asyncHandler(postGeminiTest));

export default testRouter;