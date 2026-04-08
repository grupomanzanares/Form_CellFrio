import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import app from './app.js'

// Obtener la ruta actual (para ES modules)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Cargar .env con ruta explícita
dotenv.config({ path: path.join(__dirname, '.env') })

console.log('📦 PORT desde .env:', process.env.PORT)

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})