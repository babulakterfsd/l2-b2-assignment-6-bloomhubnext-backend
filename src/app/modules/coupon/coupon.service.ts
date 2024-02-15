import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TDecodedShopkeeper } from '../authentication/auth.interface';
import { TCoupon } from './coupon.interface';
import { CouponModel } from './coupon.model';

//create coupon in DB
const createCouponInDB = async (
  decodedShopkeeper: TDecodedShopkeeper,
  coupon: TCoupon,
) => {
  if (!decodedShopkeeper) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token');
  } else if (decodedShopkeeper?.role !== 'manager') {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'Only manager can create coupon',
    );
  } else if (coupon?.code.length < 5) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Minimum length of code should be equal or greater than 5',
    );
  } else if (coupon?.code.length > 10) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Maximum length of code should be equal or less than 10',
    );
  } else if (Number(coupon?.discount) < 1) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Minimum discount should be equal or greater than 1',
    );
  } else if (Number(coupon?.discount) > 100) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Maximum discount should be equal or less than 100',
    );
  }

  if (Number(coupon?.discount) < 1) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Minimum discount should be equal or greater than 1',
    );
  } else if (Number(coupon?.discount) > 100) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Maximum discount should be equal or less than 100',
    );
  }

  const result = await CouponModel.create(coupon);

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create coupon');
  }
  return result;
};

//get all coupons from DB
const getAllCouponsFromDB = async () => {
  const result = await CouponModel.find();

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'No coupons found');
  } else {
    return result;
  }
};

export const CouponServices = {
  createCouponInDB,
  getAllCouponsFromDB,
};
