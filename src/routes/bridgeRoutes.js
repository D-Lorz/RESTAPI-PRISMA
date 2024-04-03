import { Router } from 'express'
import bridgeController from '../controllers/bridgeController.js';

const router = Router()

/**
 * @ ROUTES API BRIDGE
 */

// Route to fetch property data by page
router.get('/property/:page', bridgeController.getPropertyData);

// Route to fetch property list data by page
router.get('/property/list/:page', bridgeController.getList);

// Route to fetch property data by ID
router.get('/property/show/:id', bridgeController.getPropertyById);

// Route to calculate average count
router.get('/average-count/:page', bridgeController.getPropertyById);

export default router;