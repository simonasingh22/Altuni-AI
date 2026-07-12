import { Router } from 'express';
import { getHistoryList, getHistoryAnalysis } from '../controllers/historyController.js';

const historyRouter = Router();

historyRouter.get('/', getHistoryList);
historyRouter.get('/:id', getHistoryAnalysis);

export default historyRouter;
