import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ProductControllers } from './product.controller';
import { productSchema, productUpdateSchema } from './product.validation';

const router = express.Router();

router.get(
  '/:id',
  auth('manager', 'seller'),
  ProductControllers.getSingleProduct,
);
router.put(
  '/:id',
  auth('manager'),
  validateRequest(productUpdateSchema),
  ProductControllers.updateAProduct,
);
router.delete('/:id', auth('manager'), ProductControllers.deleteAProduct);

router.post(
  '/',
  auth('manager'),
  validateRequest(productSchema),
  ProductControllers.createProduct,
);

router.get(
  '/',
  auth('manager', 'seller', 'customer'),
  ProductControllers.getAllProducts,
);

router.delete('/', auth('manager'), ProductControllers.deleteMultipleProducts);

export const ProductRoutes = router;
