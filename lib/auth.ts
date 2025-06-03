import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { executeQuery } from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: any) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function getUserFromToken(token: string) {
  try {
    const decoded = verifyToken(token) as any
    if (!decoded) return null

    const users = (await executeQuery(
      "SELECT id, employee_id, full_name, email, account_type FROM users WHERE id = ?",
      [decoded.userId],
    )) as any[]

    return users[0] || null
  } catch (error) {
    return null
  }
}
