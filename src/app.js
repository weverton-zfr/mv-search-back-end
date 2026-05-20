import express from 'express'
import cors from 'cors'
import searchRoutes from './routes/search.routes.js'
import meRoutes from './routes/me.routes.js'
import register from './routes/register.routes.js'
import updateProfile from './routes/profile.routes.js'
import updatePassword from './routes/profile.routes.js'
import paymentRoutes from './routes/payment.routes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', searchRoutes, meRoutes, register, updateProfile, updatePassword)
app.use('/payments', paymentRoutes)

export default app