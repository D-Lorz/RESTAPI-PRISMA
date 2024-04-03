import express from 'express'
import dotenv from 'dotenv'
dotenv.config()

import bridgeRoutes from './routes/bridgeRoutes.js'
import propertyRoutes from './routes/propertyRoutes.js'

const app = express()
app.use(express.json())

app.use('/api', bridgeRoutes)
app.use(propertyRoutes)

const port = process.env.PORT || 3000

app.listen(port, () =>   console.log(`CORRIENDO DESDE http://localhost:${port}/`))

export default app