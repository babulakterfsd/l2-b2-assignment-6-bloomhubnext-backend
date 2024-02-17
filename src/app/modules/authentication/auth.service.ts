/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unsafe-optional-chaining */
import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';
import config from '../../config';
import AppError from '../../errors/AppError';
import {
  TDecodedShopkeeper,
  TShopkeeper,
  TShopkeeperProfileDataToBeUpdated,
} from './auth.interface';
import { ShopkeeperModel } from './auth.model';

//create shopkeeper in DB
const registerShopkeeperInDB = async (shopkeeper: TShopkeeper) => {
  const isShopkeeperExistsWithEmail =
    await ShopkeeperModel.isShopkeeperExistsWithEmail(shopkeeper?.email);

  if (isShopkeeperExistsWithEmail) {
    throw new Error('Email already exists, please try with different  email.');
  } else {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // transaction - 1
      const newShopkeeper = await ShopkeeperModel.create([shopkeeper], {
        session,
      });

      await session.commitTransaction();
      await session.endSession();

      if (newShopkeeper.length < 1) {
        throw new Error('Registration failed !');
      }

      return newShopkeeper[0];
    } catch (err: any) {
      await session.abortTransaction();
      await session.endSession();
      throw new Error(err);
    }
  }
};

// login shopkeeper in DB
const loginShopkeeperInDB = async (shopkeeper: TShopkeeper) => {
  const shopkeeperFromDB = await ShopkeeperModel.isShopkeeperExistsWithEmail(
    shopkeeper?.email,
  );
  if (!shopkeeperFromDB) {
    throw new Error('No user found with this email');
  }
  const isPasswordMatched = await bcrypt.compare(
    shopkeeper?.password,
    shopkeeperFromDB.password,
  );
  if (!isPasswordMatched) {
    throw new Error('Incorrect password');
  }

  //create token and send it to client side
  const payload = {
    _id: shopkeeperFromDB?._id,
    name: shopkeeperFromDB?.name,
    email: shopkeeperFromDB?.email,
    role: shopkeeperFromDB?.role,
  };

  const accesstoken = jwt.sign(payload, config.jwt_access_secret as string, {
    expiresIn: config.jwt_access_expires_in,
  });

  const refreshfToken = jwt.sign(payload, config.jwt_refresh_secret as string, {
    expiresIn: config.jwt_refresh_expires_in,
  });

  return {
    accesstoken,
    refreshfToken,
    shopkeeperFromDB,
  };
};

//verify token from client side
const verifyToken = async (token: string) => {
  if (!token) {
    return false;
  }

  // checking token is valid or not
  let decodedShopkeeper: JwtPayload | string;

  try {
    decodedShopkeeper = jwt.verify(
      token as string,
      config.jwt_access_secret as string,
    ) as JwtPayload;
  } catch (error) {
    return false;
  }

  const { email } = decodedShopkeeper as JwtPayload;

  // checking if the shopkeeper exists
  const shopkeeper = await ShopkeeperModel.isShopkeeperExistsWithEmail(email);

  if (!shopkeeper) {
    return false;
  }

  return true;
};

//generate refresh token
const getAccessTokenByRefreshToken = async (token: string) => {
  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Refresh token is required');
  }

  // checking token is valid or not
  let decodedShopkeeper: JwtPayload | string;

  try {
    decodedShopkeeper = jwt.verify(
      token as string,
      config.jwt_refresh_secret as string,
    ) as JwtPayload;
  } catch (error) {
    throw new JsonWebTokenError('Unauthorized Access!');
  }

  const { _id, name, role, email } = decodedShopkeeper as JwtPayload;

  // checking if the shopkeeper exists
  const shopkeeper = await ShopkeeperModel.isShopkeeperExistsWithEmail(email);

  if (!shopkeeper) {
    throw new AppError(httpStatus.NOT_FOUND, 'Unauthorized Access!');
  }

  const payload = {
    _id,
    name,
    role,
    email,
  };

  const accessToken = jwt.sign(payload, config.jwt_access_secret as string, {
    expiresIn: config.jwt_access_expires_in,
  });

  return {
    accessToken,
  };
};

// get shopkeeper by email
const getShopkeeperFromDbByEmail = async (email: string) => {
  if (!email) {
    throw new Error('Email is required');
  } else {
    const shopkeeperFromDB = await ShopkeeperModel.findOne({
      email,
    });
    const modifiedShopkeeper = {
      _id: shopkeeperFromDB?._id,
      name: shopkeeperFromDB?.name,
      email: shopkeeperFromDB?.email,
      role: shopkeeperFromDB?.role,
      profileImage: shopkeeperFromDB?.profileImage,
      bhp: shopkeeperFromDB?.bhp,
    };

    return modifiedShopkeeper;
  }
};

//update shopkeeper profile
const updateShopkeeperProfileInDB = async (
  shopkeeper: TDecodedShopkeeper,
  dataToBeUpdated: TShopkeeperProfileDataToBeUpdated,
) => {
  const shopkeeperFromDB = await ShopkeeperModel.findOne({
    email: shopkeeper?.email,
  });

  if (!shopkeeperFromDB) {
    throw new JsonWebTokenError('Unauthorized Access!');
  }

  const { bhp, profileImage } = dataToBeUpdated;

  const result = await ShopkeeperModel.findOneAndUpdate(
    { email: shopkeeperFromDB?.email },
    {
      bhp: bhp ? bhp : shopkeeperFromDB?.bhp,
      profileImage: profileImage
        ? profileImage
        : shopkeeperFromDB?.profileImage,
    },
    {
      new: true,
    },
  );

  if (!result) {
    throw new Error('Update failed');
  }

  const modifiedResult = {
    _id: result?._id,
    name: result?.name,
    email: result?.email,
    role: result?.role,
    bhp: result?.bhp,
    profileImage: result?.profileImage,
  };

  return modifiedResult;
};

//check if customer ixists with email
const isCustomerExistsWithEmail = async (email: string) => {
  const customer = await ShopkeeperModel.findOne({ email });

  if (customer) {
    return true;
  } else {
    return false;
  }
};

//logout shopkeeper from db
const logoutShopkeeperInDB = async (token: string) => {
  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Token is required');
  }

  // checking token is valid or not
  let decodedShopkeeper: JwtPayload | string;

  try {
    decodedShopkeeper = jwt.verify(
      token as string,
      config.jwt_access_secret as string,
    ) as JwtPayload;
  } catch (error) {
    throw new JsonWebTokenError('Unauthorized Access!');
  }
  const { email } = decodedShopkeeper as JwtPayload;

  // checking if the shopkeeper exists
  const shopkeeper = await ShopkeeperModel.findOne({ email });

  if (!shopkeeper) {
    throw new AppError(httpStatus.NOT_FOUND, 'Unauthorized Access!');
  }

  return true;
};

export const ShopkeeperServices = {
  registerShopkeeperInDB,
  loginShopkeeperInDB,
  verifyToken,
  getAccessTokenByRefreshToken,
  getShopkeeperFromDbByEmail,
  updateShopkeeperProfileInDB,
  isCustomerExistsWithEmail,
  logoutShopkeeperInDB,
};
