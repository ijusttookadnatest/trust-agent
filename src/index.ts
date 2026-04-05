import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { registerRouter } from './routes/register.js'
import { feedbackRouter } from './routes/feedback.js'
import { agentsRouter } from './routes/agents.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/register', registerRouter)
app.use('/feedback', feedbackRouter)
app.use('/agents', agentsRouter)

app.listen(3000, () => {
  console.log('Trust Layer API running on http://localhost:3000')
})
