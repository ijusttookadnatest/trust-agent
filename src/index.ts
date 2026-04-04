import 'dotenv/config'
import express from 'express'
import { registerRouter } from './routes/register.js'

const app = express()
app.use(express.json())

app.use('/register', registerRouter)

app.listen(3000, () => {
  console.log('Trust Layer API running on http://localhost:3000')
})
