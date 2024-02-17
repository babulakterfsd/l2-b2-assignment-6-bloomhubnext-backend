import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import { getFormattedDate, getTodaysDate } from '../../utils/dateFormater';
import { ShopkeeperModel } from '../authentication/auth.model';
import { ProductModel } from '../product/product.model';
import { TSell } from './sell.interface';
import { SellModel } from './sell.model';

//create sell in DB
const createSellInDB = async (sellsInfo: TSell) => {
  const seller = await ShopkeeperModel.findOne({
    email: sellsInfo?.sellerEmail,
  });
  if (!seller || seller?.role !== 'seller') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Something is wrong with seller',
    );
  }

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

  const customer = await ShopkeeperModel.findOne({
    email: sellsInfo?.customerEmail,
  });

  if (customer) {
    // this block will execute if customer is already registered
    let result;
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // transaction - 1 -> create sell
      result = await SellModel.create([sellsInfo], { session });

      // transaction - 2 -> reduce quantity in product collection
      const reduceQuantityInProductCollection =
        await ProductModel.findByIdAndUpdate(
          { _id: sellsInfo.productID },
          { $inc: { quantity: -sellsInfo.quantityToBeSold } },
          { session, new: true },
        );

      if (!reduceQuantityInProductCollection) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Failed to sell the product ',
        );
      }

      //transaction - 3 -> update customers bhp in shopkeeper collection
      const customerInDb = await ShopkeeperModel.findOne({
        email: sellsInfo.customerEmail,
      });
      if (!customerInDb) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Customer not found');
      } else {
        const totalBhpEarned = (sellsInfo?.totalBill * 0.1).toFixed(2);
        const existingBhpOfCustomer = customerInDb?.bhp;
        const bhPToBeUpdated = (
          Number(existingBhpOfCustomer) + Number(totalBhpEarned)
        ).toFixed(2);
        const updateCustomerBhp = await ShopkeeperModel.findOneAndUpdate(
          { email: sellsInfo?.customerEmail },
          { bhp: bhPToBeUpdated },
          { session, new: true },
        );
        if (!updateCustomerBhp) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            'Failed to update customer bhp',
          );
        }
      }

      await session.commitTransaction();
      await session.endSession();

      if (result.length < 1) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Failed to sell the product ',
        );
      }

      return result[0];
    } catch (err: any) {
      await session.abortTransaction();
      await session.endSession();
      throw new Error(err);
    }
  } else {
    // this block will execute if customer is not registered
    let result;
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      //transaction - 1 -> create customer
      const customerInfo = {
        name: sellsInfo?.customerName,
        email: sellsInfo?.customerEmail,
        password: sellsInfo?.customerPassword,
        role: 'customer',
        bhp: (Number(sellsInfo?.totalBill) * 0.1).toFixed(2),
        profileImage: '',
      };
      const customer = await ShopkeeperModel.create([customerInfo], {
        session,
      });

      // transaction - 2 -> create sell
      result = await SellModel.create([sellsInfo], { session });

      // transaction - 3 -> reduce quantity in product collection
      const reduceQuantityInProductCollection =
        await ProductModel.findByIdAndUpdate(
          { _id: sellsInfo.productID },
          { $inc: { quantity: -sellsInfo.quantityToBeSold } },
          { session, new: true },
        );

      if (!reduceQuantityInProductCollection) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Failed to sell the product ',
        );
      }

      await session.commitTransaction();
      await session.endSession();

      if (result.length < 1) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Failed to sell the product ',
        );
      }

      return result[0];
    } catch (err: any) {
      await session.abortTransaction();
      await session.endSession();
      throw new Error(err);
    }
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
      totalRevenue: totalRevenue.toFixed(2),
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
