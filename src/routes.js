import { Router } from 'express';
import UserController from './app/controllers/UserController';
import SesseionController from './app/controllers/SessionController';

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/sessions', SesseionController.store);

export default routes;
