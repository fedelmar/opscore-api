import jwt, { Secret } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { StringValue } from 'ms'

const JWT_SECRET = process.env.JWT_SECRET! as Secret
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? '8h') as StringValue

export interface JWTPayload {
  userId: string
  username: string
  role: string
}

export const signToken = (payload: JWTPayload): string =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

export const verifyToken = (token: string): JWTPayload =>
  jwt.verify(token, JWT_SECRET) as JWTPayload

export const hashPassword = (password: string): Promise<string> =>
  bcrypt.hash(password, 12)

export const comparePassword = (password: string, hash: string): Promise<boolean> =>
  bcrypt.compare(password, hash)
