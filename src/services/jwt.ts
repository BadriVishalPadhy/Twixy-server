import JWT from "jsonwebtoken"
import { prismaClient } from "../client/db";
import { User } from "@prisma/client";
import dotenv from 'dotenv'

dotenv.config();
class JWTService {
  public static generateTokenForUser(user: User) {
    const secret = process.env.JWTSecret
    if (!secret) {
      throw new Error('JWT secret he hi nahi')
    }
    const payLoad = {
      id: user?.id,
      email: user?.email
    };
    const token = JWT.sign(payLoad, secret)
    return token;

  }
}

export default JWTService;