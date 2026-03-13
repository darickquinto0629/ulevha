import dotenv from 'dotenv';
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRE = process.env.JWT_EXPIRE || '24h';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
