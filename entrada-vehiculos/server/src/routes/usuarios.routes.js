import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { pool } from '../config/db.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { allowRoles } from '../middlewares/roleMiddleware.js'

const router = Router()

router.use(authMiddleware)
router.use(allowRoles('ADMIN'))

// Listar usuarios
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
          u.id,
          u.nombre,
          u.status,
          u.rol_id,
          r.nombre AS rol
       FROM usuarios u
       INNER JOIN roles r ON r.id = u.rol_id
       ORDER BY u.id DESC`
    )

    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Crear usuario
router.post('/', async (req, res) => {
  try {
    const { nombre, clave, rol_id, status } = req.body

    const [exists] = await pool.query(
      'SELECT id FROM usuarios WHERE nombre = ? LIMIT 1',
      [nombre]
    )

    if (exists.length) {
      return res.status(400).json({ message: 'El usuario ya existe' })
    }

    const hash = await bcrypt.hash(clave, 10)

    await pool.query(
      `INSERT INTO usuarios (nombre, clave, rol_id, status)
       VALUES (?, ?, ?, ?)`,
      [nombre, hash, rol_id, status ?? 1]
    )

    return res.status(201).json({ message: 'Usuario creado correctamente' })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

// Actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, rol_id, status } = req.body

    await pool.query(
      `UPDATE usuarios
       SET nombre = ?, rol_id = ?, status = ?
       WHERE id = ?`,
      [nombre, rol_id, status, id]
    )

    res.json({ message: 'Usuario actualizado correctamente' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router