import bcrypt from 'bcryptjs'
import { pool } from './config/db.js'

const crearAdmin = async () => {
  try {
    const nombre = 'admin'
    const clave = '123456'
    const rol_id = 1
    const status = 1

    const [exists] = await pool.query(
      'SELECT id FROM usuarios WHERE nombre = ? LIMIT 1',
      [nombre]
    )

    if (exists.length) {
      console.log('El usuario admin ya existe')
      process.exit()
    }

    const hash = await bcrypt.hash(clave, 10)

    await pool.query(
      `INSERT INTO usuarios (nombre, clave, rol_id, status)
       VALUES (?, ?, ?, ?)`,
      [nombre, hash, rol_id, status]
    )

    console.log('Admin creado correctamente')
    process.exit()
  } catch (error) {
    console.error('Error al crear admin:', error.message)
    process.exit(1)
  }
}

crearAdmin()