import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import { getFormattedDate, getTodaysDate } from '../../utils/dateFormater';
import { ProductModel } from '../product/product.model';
import { TSell } from './sell.interface';
import { SellModel } from './sell.model';

//create sell in DB
const createSellInDB = async (sellsInfo: TSell) => {
  const productToBeSold = await ProductModel.findById({
    _id: sellsInfo.productID,
  });

  if (!productToBeSold) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Product does not exist');
  } else if (productToBeSold?.quantity < 1) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Product not found');
  } else if (sellsInfo?.quantityToBeSold > productToBeSold?.quantity) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Quantity should be equal or less than available quantity',
    );
  } else if (sellsInfo?.dateOfSell > getTodaysDate()) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You cannot sell a product in the future!',
    );
  }
  let result;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // transaction - 1
    result = await SellModel.create([sellsInfo], { session });

    // transaction - 2
    const reduceQuantityInProductCollection =
      await ProductModel.findByIdAndUpdate(
        { _id: sellsInfo.productID },
        { $inc: { quantity: -sellsInfo.quantityToBeSold } },
        { session, new: true },
      );

    if (!reduceQuantityInProductCollection) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to sell the product ');
    }

    await session.commitTransaction();
    await session.endSession();

    if (result.length < 1) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to sell the product ');
    }

    return result[0];
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(err);
  }
};

// get all sells
const getAllSellsFromDB = async (timeframe: string) => {
  let startDate;

  // Calculate the start date based on the specified timeframe
  switch (timeframe) {
    case 'daily':
      startDate = getTodaysDate();
      break;
    case 'weekly':
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      startDate = getFormattedDate(weekAgo);
      break;
    case 'monthly':
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      startDate = getFormattedDate(monthAgo);
      break;
    case 'yearly':
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      startDate = getFormattedDate(yearAgo);
      break;
    default:
      const yearAgoAsDefault = new Date();
      yearAgoAsDefault.setFullYear(yearAgoAsDefault.getFullYear() - 1);
      startDate = getFormattedDate(yearAgoAsDefault);
  }

  // Query the database with the specified timeframe
  const soldProductList = await SellModel.find({
    dateOfSell: { $gte: startDate },
  }).sort({ createdAt: -1 });

  if (soldProductList.length < 1) {
    return {
      meta: {
        totalSellGenerated: 0,
        totalRevenue: 0,
        totalItemSold: 0,
      },
      soldProductList: [],
    };
  } else {
    let totalRevenue = 0;
    let totalItemSold = 0;
    let totalSellGenerated = await SellModel.countDocuments({
      dateOfSell: { $gte: startDate },
    });

    soldProductList.forEach((curr) => {
      totalRevenue += curr.totalBill;
      totalItemSold += curr.quantityToBeSold;
    });

    const meta = {
      totalSellGenerated,
      totalRevenue,
      totalItemSold,
    };

    return {
      meta,
      soldProductList,
    };
  }
};

export const SellServices = {
  createSellInDB,
  getAllSellsFromDB,
};
