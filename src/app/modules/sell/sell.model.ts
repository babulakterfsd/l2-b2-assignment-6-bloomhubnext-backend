import { Schema, model } from 'mongoose';
import { TSell } from './sell.interface';

const sellSchema = new Schema<TSell>(
  {
    productID: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    appliedCoupon: {
      type: String,
      default: '',
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
    discountGiven: {
      type: Number,
      default: 0,
    },
    quantityToBeSold: {
      type: Number,
      required: true,
    },
    totalBill: {
      type: Number,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    sellerEmail: {
      type: String,
      required: true,
    },
    dateOfSell: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const SellModel = model<TSell>('sells', sellSchema);
