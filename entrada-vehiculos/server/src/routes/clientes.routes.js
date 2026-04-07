import { Router } from 'express'
import { pool } from '../config/db.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { allowRoles } from '../middlewares/roleMiddleware.js'

const router = Router()

router.use(authMiddleware)

// Listar clientes activos, con búsqueda por nombre para autocomplete
router.get('/', async (req, res) => {
  try {
    const { search = '' } = req.query

    const [rows] = await pool.query(
      `SELECT id, nit, nombre, status
       FROM clientes
       WHERE status = 1
         AND nombre LIKE ?
       ORDER BY nombre ASC
       LIMIT 20`,
      [`${search}%`]
    )

    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Crear cliente: permitido para cualquier usuario autenticado
router.post('/', async (req, res) => {
  try {
    const { nit, nombre } = req.body

    if (!nit || !nombre) {
      return res.status(400).json({ message: 'Nit y nombre son obligatorios' })
    }

    const [exists] = await pool.query(
      `SELECT id FROM clientes WHERE nit = ? LIMIT 1`,
      [nit]
    )

    if (exists.length) {
      return res.status(400).json({ message: 'Ya existe un cliente con ese nit' })
    }

    await pool.query(
      `INSERT INTO clientes (nit, nombre, status)
       VALUES (?, ?, 1)`,
      [nit, nombre]
    )

    res.status(201).json({ message: 'Cliente creado correctamente' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Editar cliente: solo admin
router.put('/:id', allowRoles('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params
    const { nit, nombre, status } = req.body

    if (!nit || !nombre) {
      return res.status(400).json({ message: 'Nit y nombre son obligatorios' })
    }

    await pool.query(
      `UPDATE clientes
       SET nit = ?, nombre = ?, status = ?
       WHERE id = ?`,
      [nit, nombre, status ?? 1, id]
    )

    res.json({ message: 'Cliente actualizado correctamente' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Inactivar cliente: solo admin
router.delete('/:id', allowRoles('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params

    await pool.query(
      `UPDATE clientes SET status = 0 WHERE id = ?`,
      [id]
    )

    res.json({ message: 'Cliente inactivado correctamente' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router