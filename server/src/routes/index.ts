import { Router } from 'express';
import healthRoutes from './healthRoutes';
import profileRoutes from './profileRoutes';
import songRoutes from './songRoutes';
import playlistRoutes from './playlistRoutes';

const router = Router();

router.use('/', healthRoutes);
router.use('/profile', profileRoutes);
router.use('/songs', songRoutes);
router.use('/playlists', playlistRoutes);

export default router;
