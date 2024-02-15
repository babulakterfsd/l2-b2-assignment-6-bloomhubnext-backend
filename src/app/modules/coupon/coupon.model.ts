import { Schema, model } from 'mongoose';
import { TCoupon } from './coupon.interface';

const couponSchema = new Schema<TCoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      minlength: 5,
      maxlength: 10,
    },
    discount: {
      type: String,
      required: true,
    },
    validTill: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: false,
  },
);

export const CouponModel = model<TCoupon>('coupons', couponSchema);
