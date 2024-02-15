/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';

export type TShopkeeper = {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'manager' | 'seller' | 'customer';
  bhp?: string;
  profileImage?: string;
};

export type TShopkeeperRole = 'manager' | 'seller' | 'customer';

export type TDecodedShopkeeper = {
  _id: string;
  name: string;
  email: string;
  role: TShopkeeperRole;
  bhp?: string;
  profileImage?: string;
};

export type TShopkeeperProfileDataToBeUpdated = {
  bhp?: string;
  profileImage?: string;
};

//for creating statics
export interface TShopkeeperModel extends Model<TShopkeeper> {
  isShopkeeperExistsWithEmail(email: string): Promise<TShopkeeper | null>;
}
