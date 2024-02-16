import { Types } from 'mongoose';

export type TSell = {
  _id: string;
  productID: Types.ObjectId;
  productName: string;
  productPrice: number;
  appliedCoupon: string;
  discountPercentage: number;
  discountGiven: number;
  quantityToBeSold: number;
  totalBill: number;
  customerEmail: string;
  customerName?: string;
  customerPassword?: string;
  sellerEmail: string;
  dateOfSell: string;
};
