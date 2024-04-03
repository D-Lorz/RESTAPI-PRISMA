import fetch from 'node-fetch';
const propertyController = {}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Retrieve all properties from the database.
propertyController.index = async (req, res) => {
    const listingProperty = await prisma.listings.findMany();
    res.json({
        title: "Database Properties",
        properties: listingProperty
    })
}

// Save property data to the database.
propertyController.saveListingProperty = async (req, res) => {
    console.log("\n\n** Saving property **")
}

export default propertyController