import { Router } from 'express'
import { pool } from '../config/db.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = Router()

router.use(authMiddleware)

// Crear entrada
router.post('/', async (req, res) => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const {
      fecha_hora,
      cliente_id,
      placa,
      nom_conductor,
      num_canastas,
      num_canastillas,
      sello,
      recibe,
      responsable,
      encargados
    } = req.body

    if (
      !fecha_hora ||
      !cliente_id ||
      !placa ||
      !nom_conductor ||
      num_canastas === undefined ||
      num_canastillas === undefined ||
      !sello
    ) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' })
    }

    const placaLimpia = placa.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)

    // 🔴 NUEVO: Obtener el último consecutivo para este cliente
    const [lastEntry] = await connection.query(
      'SELECT MAX(cliente_consecutivo) as max_consecutivo FROM entradas WHERE cliente_id = ?',
      [cliente_id]
    )
    
    const nextConsecutivo = (lastEntry[0].max_consecutivo || 0) + 1
    const numeroEntradaCliente = `${cliente_id}-${nextConsecutivo}`

    // 🔴 MODIFICADO: Insertar incluyendo las nuevas columnas
    const [result] = await connection.query(
      `INSERT INTO entradas (
        fecha_hora,
        cliente_id,
        cliente_consecutivo,
        numero_entrada_cliente,
        placa,
        nom_conductor,
        num_canastas,
        num_canastillas,
        sello,
        recibe,
        responsable,
        usuario_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fecha_hora,
        cliente_id,
        nextConsecutivo,
        numeroEntradaCliente,
        placaLimpia,
        nom_conductor,
        num_canastas,
        num_canastillas,
        sello,
        recibe || null,
        responsable || null,
        req.user.id
      ]
    )

    const entradaId = result.insertId

    if (Array.isArray(encargados)) {
      for (const nombre of encargados) {
        if (nombre && nombre.trim()) {
          await connection.query(
            `INSERT INTO entrada_encargados (entrada_id, nombre_encargado)
             VALUES (?, ?)`,
            [entradaId, nombre.trim()]
          )
        }
      }
    }

    await connection.commit()

    // 🔴 MODIFICADO: Devolver el número de entrada personalizado
    res.status(201).json({
      message: 'Entrada registrada correctamente',
      id: entradaId,
      numero_entrada_cliente: numeroEntradaCliente,
      cliente_consecutivo: nextConsecutivo
    })
  } catch (error) {
    await connection.rollback()
    res.status(500).json({ message: error.message })
  } finally {
    connection.release()
  }
})

// Historial de entradas con filtros
router.get('/', async (req, res) => {
  try {
    const { fechaInicio, fechaFin, placa = '', cliente = '' } = req.query

    // 🔴 MODIFICADO: Agregar numero_entrada_cliente a la consulta
    const [rows] = await pool.query(
      `SELECT
          e.id,
          e.fecha_hora,
          e.numero_entrada_cliente,
          c.nombre AS cliente,
          e.placa,
          e.nom_conductor,
          e.sello,
          u.nombre AS usuario
       FROM entradas e
       INNER JOIN clientes c ON c.id = e.cliente_id
       INNER JOIN usuarios u ON u.id = e.usuario_id
       WHERE (? IS NULL OR DATE(e.fecha_hora) >= ?)
         AND (? IS NULL OR DATE(e.fecha_hora) <= ?)
         AND e.placa LIKE ?
         AND c.nombre LIKE ?
       ORDER BY e.fecha_hora DESC`,
      [
        fechaInicio || null,
        fechaInicio || null,
        fechaFin || null,
        fechaFin || null,
        `%${placa.toUpperCase()}%`,
        `%${cliente}%`
      ]
    )

    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Ver detalle de una entrada
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // 🔴 MODIFICADO: Agregar las nuevas columnas a la consulta
    const [rows] = await pool.query(
      `SELECT
          e.*,
          e.numero_entrada_cliente,
          e.cliente_consecutivo,
          c.nombre AS cliente,
          c.nit,
          u.nombre AS usuario
       FROM entradas e
       INNER JOIN clientes c ON c.id = e.cliente_id
       INNER JOIN usuarios u ON u.id = e.usuario_id
       WHERE e.id = ?`,
      [id]
    )

    if (!rows.length) {
      return res.status(404).json({ message: 'Registro no encontrado' })
    }

    const [encargados] = await pool.query(
      `SELECT nombre_encargado
       FROM entrada_encargados
       WHERE entrada_id = ?`,
      [id]
    )

    res.json({
      ...rows[0],
      encargados
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router