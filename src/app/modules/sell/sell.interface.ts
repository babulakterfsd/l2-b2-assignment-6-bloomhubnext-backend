import { Types } from 'mongoose';

export type TSell = {
  _id: string;
  productID: Types.ObjectId;
  productName: string;
  productPrice: number;
  quantityToBeSold: number;
  buyerName: string;
  dateOfSell: string;
  totalBill: number;
};
