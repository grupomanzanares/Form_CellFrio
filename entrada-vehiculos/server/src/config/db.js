import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
})

// Mensaje de conexión exitosa (se ejecuta al importar)
pool.getConnection()
  .then(conn => {
    console.log('✅ Conexión a MySQL exitosa')
    console.log(`📦 Base de datos: ${process.env.DB_NAME}`)
    conn.release()
  })
  .catch(err => {
    console.error('❌ Error de conexión a MySQL:', err.message)
  })

export default pool