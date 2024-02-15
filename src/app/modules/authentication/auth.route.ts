import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { ShopkeeperControllers } from './auth.controller';
import {
  loginSchema,
  signupSchema,
  updateProfileSchema,
} from './auth.validation';

const router = express.Router();

router.post(
  '/register',
  validateRequest(signupSchema),
  ShopkeeperControllers.registerShopkeeper,
);

router.post(
  '/login',
  validateRequest(loginSchema),
  ShopkeeperControllers.loginShopkeeper,
);

router.post('/verify-token', ShopkeeperControllers.verifyToken);

router.post(
  '/refresh-token',
  ShopkeeperControllers.getAccessTokenUsingRefreshToken,
);

router.put(
  '/update-profile',
  validateRequest(updateProfileSchema),
  ShopkeeperControllers.updateShopkeeperProfile,
);

router.get('/get-profile', ShopkeeperControllers.getShopkeeperProfile);

export const AuthRoutes = router;
