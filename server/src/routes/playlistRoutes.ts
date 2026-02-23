import { Router } from 'express';
import {
  create,
  listByUser,
  getById,
  remove,
  addTrack,
  removeTrack,
} from '../controllers/playlistController';

const router = Router();

// COM-7: Create a playlist
router.post('/', create);

// Get playlists by user
router.get('/user/:username', listByUser);

// Get single playlist (with tracks)
router.get('/:id', getById);

// Delete playlist (owner only)
router.delete('/:id', remove);

// COM-8: Add track to playlist
router.post('/:id/tracks', addTrack);

// COM-9: Remove track from playlist
router.delete('/:id/tracks/:trackId', removeTrack);

export default router;
