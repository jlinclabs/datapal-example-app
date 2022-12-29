import { fileURLToPath } from 'url'
import Path from 'path'
import dotenv from 'dotenv'
dotenv.config()
process.env.APP_PATH = Path.dirname(fileURLToPath(import.meta.url))
