import fetch from 'node-fetch';
const bridgeController = {}
const baseUrl = process.env.BASE_URL+':'+process.env.PORT
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Controller function to handle property API requests
bridgeController.getPropertyData = async (req, res) => {
    try {
        // Parse the page parameter or default to 1
        const page = req.params.page ? parseInt(req.params.page) : 1;
        // Check if page is a positive number
        if (isNaN(page) || page < 1) {
            throw new Error('El parámetro de página debe ser un número positivo');
        }

        // Interval in hours
        const interval = 5;
        // Current date and time
        const currentDate = new Date();

        // Calculate start and end dates based on interval and page
        const startDate = new Date(currentDate.getTime() - interval * 60 * 60 * 1000 * page);
        const endDate = new Date(currentDate.getTime() - interval * 60 * 60 * 1000 * (page - 1));

        // Format dates to ISO 8601 format
        const formattedStartDate = startDate.toISOString();
        const formattedEndDate = endDate.toISOString();

        // Get access token
        const bridgeToken = process.env.API_BRIDGE_ACCESS_TOKEN;

        // Construct request options object
        const params = {
            access_token: bridgeToken,
            $top: 2000,
            $filter: `BridgeModificationTimestamp gt ${formattedStartDate} and BridgeModificationTimestamp lt ${formattedEndDate}`,
            $select: 'ListingKey,BridgeModificationTimestamp'
        };

        // Construct the URL with query parameters
        const url = new URL('https://api.bridgedataoutput.com/api/v2/OData/miamire/Property/replication');
        url.search = new URLSearchParams(params).toString();

        // Configure request headers
        const requestOptions = {
            method: 'GET',
            //headers: { 'Content-Type': 'application/json' }
        }
        
        // Perform HTTP request using fetch
        await fetch(url, requestOptions)
        .then(response => {
            if (response.ok) 
                return response.json(); // Analizar la respuesta como JSON
            throw new Error('Error en la solicitud');
        })
        .then(data => {
            // Manejar los datos recibidos
            console.log(data);
            res.json(data);
        })
        .catch(error => {
            // Manejar errores
            console.error('Error:', error);
            res.json(error);
        });
    } catch (error) {
        // Log error to console
        console.error('Error en la solicitud:', error);
        // Send error response
        res.status(500).json({ error: 'Hubo un problema con la solicitud' });
    }
};

// Function to fetch property list data
bridgeController.getList = async (req, res) => {
    try {
       // Extract page parameter or default to 0
        const page = req.query.page || 0;

        // Get access token
        const bridgeToken = process.env.API_BRIDGE_ACCESS_TOKEN;

        // Construct request parameters object
        const params = {
            access_token: bridgeToken,
            limit: 10,
            offset: page,
            sortBy: 'BridgeModificationTimestamp'
        };

        // Construct URL for fetching property list data
        const url = new URL('https://api.bridgedataoutput.com/api/v2/miamire/listings');
        url.search = new URLSearchParams(params).toString();

        // Configure request headers
        const requestOptions = {
            method: 'GET'
        };

        // Perform HTTP request using fetch
        await fetch(url, requestOptions)
        .then(response => {
            if (response.ok)
                return response.json(); // Analizar la respuesta como JSON
            throw new Error('Error en la solicitud');
        })
        .then(async data => {
            // Manejar los datos recibidos
            const result = await savePropertyList_DB(data.bundle);
            console.log(result);
            res.json({result, propertyList: data.bundle});
        })
        .catch(error => {
            // Manejar errores
            console.error('Error:', error);
            res.json(error);
        });

    } catch (error) {
        // Log and handle errors
        console.error(error);
        res.status(500).json({ error: 'Hubo un problema al obtener la lista de propiedades' });
    }
};

async function savePropertyList_DB(data) {
    console.log("Function savePropertyList_DB")
    // const url = baseUrl + '/save-listing-property'

    const newProperties = [];

    for (const propertyObject of data) {
        const newProperty = await prisma.listings.create({
            data: { jsonData: JSON.stringify(propertyObject) }
        });
        newProperties.push(newProperty);
    }

    console.log("newProperties---")
    console.log(newProperties);
    
    return {
        message: "Properties saved successfully",
        total_saved_properties: newProperties.length
    };
}

// Function to fetch property data by ID
bridgeController.getPropertyById = async (req, res) => {
    try {
        // Extract ID parameter from request
        const id = req.params.id;

        // Get access token
        const bridgeToken = process.env.API_BRIDGE_ACCESS_TOKEN;

        // Construct URL for fetching property data by ID
        const url = `https://api.bridgedataoutput.com/api/v2/OData/miamire/Property('${id}')`;

        // Configure request headers
        const requestOptions = await fetch(url, {
            headers: {
                Authorization: `Bearer ${bridgeToken}`
            }
        });

        // Perform HTTP request using fetch
        await fetch(url, requestOptions)
        .then(response => {
            if (response.ok)
                return response.json(); // Analizar la respuesta como JSON
            throw new Error('Error en la solicitud');
        })
        .then(data => {
            // Manejar los datos recibidos
            console.log(data);
            res.json(data);
        })
        .catch(error => {
            // Manejar errores
            console.error('Error:', error);
            res.json(error);
        });
    } catch (error) {
        // Log and handle errors
        console.error('Error al consultar la propiedad:', error);
        res.status(500).json({ error: 'Hubo un problema al obtener la propiedad' });
    }
};

// Function to fetch property data by ID
bridgeController.averageCountController = async (req, res) => {
    try {
        const numPages = 100; // Número de páginas consecutivas a solicitar
        let totalCount = 0; // Variable para almacenar la suma total de @odata.count
        
        let page = req.params.page ? parseInt(req.params.page) : 1;
        if (isNaN(page) || page < 1) {
            throw new Error('Page parameter must be a positive number');
        }

        const interval = 5; // Intervalo de horas
        const currentDate = new Date();

        // Get access token
        const bridgeToken = process.env.API_BRIDGE_ACCESS_TOKEN;

        // Objeto params para los parámetros de la consulta
        const params = {
            $top: 2000,
            $select: 'ListingKey,BridgeModificationTimestamp'
        };
        // Construir la URL con los parámetros de consulta
        const url = new URL('https://api.bridgedataoutput.com/api/v2/OData/miamire/Property/replication');
        url.search = new URLSearchParams(params).toString();

        // Configure request headers
        const requestOptions = {
            headers: {
                'Authorization': `Bearer ${bridgeToken}`
            }
        }

        for (let i = page; i < page + numPages; i++) {
            // Calcular las fechas de inicio y fin basadas en el intervalo y la página actual
            const startDate = new Date(currentDate.getTime() - interval * 60 * 60 * 1000 * i);
            const endDate = new Date(currentDate.getTime() - interval * 60 * 60 * 1000 * (i - 1));

            // Formatear las fechas en formato ISO 8601
            const formattedStartDate = startDate.toISOString();
            const formattedEndDate = endDate.toISOString();

            // Actualizar el filtro de la consulta en el objeto params
            params.$filter = `BridgeModificationTimestamp gt ${formattedStartDate} and BridgeModificationTimestamp lt ${formattedEndDate}`;
            
            // Perform HTTP request using fetch
            await fetch(url, requestOptions)
            .then(response => {
                if (response.ok)
                    return response.json(); // Analizar la respuesta como JSON
                throw new Error('Error en la solicitud');
            })
            .then(data => {
                // Manejar los datos recibidos
                console.log(data);
                res.json(data);
                // Sumar el valor de @odata.count a totalCount
                totalCount += data['@odata.count'];
                console.log(`${i}- cantidad : ${data['@odata.count']}`);
                // Calcular el promedio de totalCount
                const averageCount = totalCount / numPages;
                console.log("averageCount: ", averageCount);
                res.json({ averageCount });
            })
            .catch(error => {
                // Manejar errores
                console.error('Error:', error);
                res.json(error);
            });
            
        }

    } catch (error) {
        console.error('Error en la consulta:', error);
        res.status(500).json({ error: 'Hubo un problema en la consulta' });
    }
};

export default bridgeController