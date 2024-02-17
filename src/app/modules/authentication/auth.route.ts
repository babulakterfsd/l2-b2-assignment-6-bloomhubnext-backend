import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ShopkeeperControllers } from './auth.controller';
import {
  customeExistanceCheckingSchema,
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

router.post('/logout', ShopkeeperControllers.logoutShopkeeper);

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
router.post(
  '/check-customer-existance',
  auth('seller'),
  validateRequest(customeExistanceCheckingSchema),
  ShopkeeperControllers.isCustomerExistsWithEmail,
);

export const AuthRoutes = router;
