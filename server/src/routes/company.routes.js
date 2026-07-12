import { Router } from 'express';
import { getCompanyAnalysis, getCompanyResearch } from '../controllers/companyController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateCompanyNameParams } from '../validators/companyName.validator.js';

const companyRouter = Router();

companyRouter.get('/:companyName', validateCompanyNameParams, asyncHandler(getCompanyResearch));
companyRouter.get('/:companyName/analyze', validateCompanyNameParams, asyncHandler(getCompanyAnalysis));

export default companyRouter;
