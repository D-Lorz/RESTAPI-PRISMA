import { Router } from 'express'
import propertyController from '../controllers/propertyController.js';

const router = Router()

/**
 * @ ROUTES DATABASE
 */

router.get('/', propertyController.index)
// Save Property Listing in Database
router.post('/save-listing-property', propertyController.saveListingProperty)

// Route to fetch property data by page for property listings
//router.get('/listings/property/:page', propertyController.getPropertyData);

export default router;