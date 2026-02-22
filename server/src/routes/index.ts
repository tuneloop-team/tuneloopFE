import { Router } from 'express';
import healthRoutes from './healthRoutes';
import profileRoutes from './profileRoutes';
import songRoutes from './songRoutes';

const router = Router();

router.use('/', healthRoutes);
router.use('/profile', profileRoutes);
router.use('/songs', songRoutes);

export default router;
