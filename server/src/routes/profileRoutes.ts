import { Router } from 'express';
import {
  getProfileByUsername,
  createNewProfile,
  listProfiles,
} from '../controllers/profileController';

const router = Router();

router.get('/', listProfiles);
router.get('/:username', getProfileByUsername);
router.post('/', createNewProfile);

export default router;
