import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { CouponControllers } from './coupon.controller';
import { couponSchema } from './coupon.validation';

const router = express.Router();

router.post(
  '/',
  auth('manager'),
  validateRequest(couponSchema),
  CouponControllers.createCoupon,
);

router.get('/', CouponControllers.getAllCoupons);

export const CouponRoutes = router;
