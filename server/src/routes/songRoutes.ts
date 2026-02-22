import { Router } from 'express';
import { search, like, unlike, likedByUser } from '../controllers/songController';

const router = Router();

// COM-2 + COM-4 + COM-5: Search songs
router.get('/search', search);

// COM-19: Like / unlike a song
router.post('/:songId/like', like);
router.delete('/:songId/like', unlike);

// Get liked songs by username
router.get('/liked/:username', likedByUser);

export default router;
