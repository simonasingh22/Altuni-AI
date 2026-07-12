import { Router } from 'express';
import companyRouter from './company.routes.js';
import healthRouter from './health.routes.js';
import historyRouter from './history.routes.js';
import testRouter from './test.routes.js';

const apiRouter = Router();

apiRouter.use('/company', companyRouter);
apiRouter.use('/health', healthRouter);
apiRouter.use('/history', historyRouter);
apiRouter.use('/test', testRouter);

export default apiRouter;
