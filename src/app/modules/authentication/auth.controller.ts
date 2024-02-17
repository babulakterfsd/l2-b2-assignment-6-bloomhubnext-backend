import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import config from '../../config';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TDecodedShopkeeper } from './auth.interface';
import { ShopkeeperServices } from './auth.service';

//create shopkeeper
const registerShopkeeper = catchAsync(async (req, res) => {
  const result = await ShopkeeperServices.registerShopkeeperInDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Registration completed successfully!',
    data: result,
  });
});

//login shopkeeper
const loginShopkeeper = catchAsync(async (req, res) => {
  const result = await ShopkeeperServices.loginShopkeeperInDB(req.body);
  const { accesstoken, refreshfToken, shopkeeperFromDB } = result;

  res.cookie('refreshfToken', refreshfToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Logged in successfully!',
    data: {
      shopkeeper: {
        _id: shopkeeperFromDB?._id,
        name: shopkeeperFromDB?.name,
        email: shopkeeperFromDB?.email,
        role: shopkeeperFromDB?.role,
      },
      token: accesstoken,
    },
  });
});

// verify token from client side
const verifyToken = catchAsync(async (req, res) => {
  const result = await ShopkeeperServices.verifyToken(req.body.token);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Token verification completed!',
    data: result,
  });
});

//get access token using refresh token
const getAccessTokenUsingRefreshToken = catchAsync(async (req, res) => {
  const result = await ShopkeeperServices.getAccessTokenByRefreshToken(
    req.cookies?.refreshfToken,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token retrieved succesfully!',
    data: result,
  });
});

// get shopkeeper profile
const getShopkeeperProfile = catchAsync(async (req, res) => {
  const token = req?.headers?.authorization;
  const splittedToken = token?.split(' ')[1] as string;

  const decodedShopkeeper = jwt.verify(
    splittedToken,
    config.jwt_access_secret as string,
  );

  const { email } = decodedShopkeeper as TDecodedShopkeeper;

  const result = await ShopkeeperServices.getShopkeeperFromDbByEmail(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile has been retrieved succesfully',
    data: result,
  });
});

// update shopkeeper profile
const updateShopkeeperProfile = catchAsync(async (req, res) => {
  const dataToBeUpdated = req.body;
  const token = req?.headers?.authorization;
  const splittedToken = token?.split(' ')[1] as string;

  const decodedShopkeeper = jwt.verify(
    splittedToken,
    config.jwt_access_secret as string,
  );

  const result = await ShopkeeperServices.updateShopkeeperProfileInDB(
    decodedShopkeeper as TDecodedShopkeeper,
    dataToBeUpdated,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile has been updated succesfully',
    data: result,
  });
});

// check if customer exists with email
const isCustomerExistsWithEmail = catchAsync(async (req, res) => {
  const { email } = req.body;
  console.log(req.body);
  const result = await ShopkeeperServices.isCustomerExistsWithEmail(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result
      ? 'Customer exists with this email'
      : 'Customer does not exist with this email',
    data: result,
  });
});

// logout shopkeeper
const logoutShopkeeper = catchAsync(async (req, res) => {
  res.clearCookie('refreshfToken', {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Logged out successfully!',
    data: null,
  });
});

export const ShopkeeperControllers = {
  registerShopkeeper,
  loginShopkeeper,
  verifyToken,
  getAccessTokenUsingRefreshToken,
  getShopkeeperProfile,
  updateShopkeeperProfile,
  isCustomerExistsWithEmail,
  logoutShopkeeper,
};
