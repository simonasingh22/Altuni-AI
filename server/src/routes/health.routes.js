import { Router } from 'express';
import { getHealth } from '../controllers/healthController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateHealthRequest } from '../validators/health.validator.js';

const healthRouter = Router();

healthRouter.get('/', validateHealthRequest, asyncHandler(getHealth));

export default healthRouter;
