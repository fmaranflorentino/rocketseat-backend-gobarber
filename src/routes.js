import { Router } from 'express';
import UserController from './app/controllers/UserController';
import SesseionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/sessions', SesseionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);


export default routes;
