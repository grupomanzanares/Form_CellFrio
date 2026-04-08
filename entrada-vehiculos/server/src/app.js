import express from 'express'
import cors from 'cors'
import { pool } from './config/db.js'
import authRoutes from './routes/auth.routes.js'
import usuariosRoutes from './routes/usuarios.routes.js'
import clientesRoutes from './routes/clientes.routes.js'
import entradasRoutes from './routes/entradas.routes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok')
    res.json({
      message: 'API y base de datos funcionando 🚀',
      db: rows[0]
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error de conexión a la base de datos',
      error: error.message
    })
  }
})

app.use('/cellfrio/auth', authRoutes)
app.use('/cellfrio/usuarios', usuariosRoutes)
app.use('/cellfrio/clientes', clientesRoutes)
app.use('/cellfrio/entradas', entradasRoutes)

export default app