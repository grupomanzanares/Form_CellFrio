import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../config/db.js'

const router = Router()

router.post('/login', async (req, res) => {
  try {
    const { nombre, clave } = req.body

    const [rows] = await pool.query(
      `SELECT u.id, u.nombre, u.clave, u.status, r.nombre AS rol
       FROM usuarios u
       INNER JOIN roles r ON r.id = u.rol_id
       WHERE u.nombre = ?
       LIMIT 1`,
      [nombre]
    )

    if (!rows.length) {
      return res.status(401).json({ message: 'Usuario o clave incorrectos' })
    }

    const user = rows[0]

    if (!user.status) {
      return res.status(403).json({ message: 'Usuario inactivo' })
    }

    const ok = await bcrypt.compare(clave, user.clave)

    if (!ok) {
      return res.status(401).json({ message: 'Usuario o clave incorrectos' })
    }

    const token = jwt.sign(
      {
        id: user.id,
        nombre: user.nombre,
        rol: user.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    return res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        rol: user.rol
      }
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

export default router