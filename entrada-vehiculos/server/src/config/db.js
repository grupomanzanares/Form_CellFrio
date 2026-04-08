import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envPath = path.join(__dirname, '..', '..', '.env')
dotenv.config({ path: envPath })

console.log('🔍 Ruta del .env:', envPath)
console.log('📦 DB_USER:', process.env.DB_USER)
console.log('📦 DB_HOST:', process.env.DB_HOST)
console.log('📦 PORT:', process.env.PORT)

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
})

pool.getConnection()
  .then(conn => {
    console.log('✅ Conexión a MySQL exitosa')
    console.log(`📦 Base de datos: ${process.env.DB_NAME}`)
    conn.release()
  })
  .catch(err => {
    console.error('❌ Error de conexión a MySQL:', err.message)
  })
