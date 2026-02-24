import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { COOKIE_NAME } from "@shared/const";
import { SignJWT, jwtVerify } from "jose";
import * as db from "../db";

const JWT_SECRET_KEY = process.env.JWT_SECRET || "dev-secret-change-me";
const secretKey = new TextEncoder().encode(JWT_SECRET_KEY);

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

// Try Manus SDK auth first (for dev environment), then fall back to standalone JWT
async function authenticateFromCookie(req: CreateExpressContextOptions["req"]): Promise<User | null> {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  // Parse cookies manually
  const cookies = new Map<string, string>();
  cookieHeader.split(";").forEach(pair => {
    const [key, ...vals] = pair.trim().split("=");
    if (key) cookies.set(key, vals.join("="));
  });

  const sessionCookie = cookies.get(COOKIE_NAME);
  if (!sessionCookie) return null;

  // Try standalone JWT verification
  try {
    const { payload } = await jwtVerify(sessionCookie, secretKey, {
      algorithms: ["HS256"],
    });
    const userId = payload.userId as number;
    if (userId) {
      const user = await db.getUserById(userId);
      return user ?? null;
    }
    // Fallback: check if it's a Manus-style JWT with openId
    const openId = payload.openId as string;
    if (openId) {
      const user = await db.getUserByOpenId(openId);
      return user ?? null;
    }
  } catch {
    // JWT verification failed
  }

  // Try Manus SDK as fallback (for dev environment)
  try {
    const { sdk } = await import("./sdk");
    const user = await sdk.authenticateRequest(req);
    return user;
  } catch {
    // Manus SDK not available or auth failed
  }

  return null;
}

// Create a standalone JWT session token
export async function createSessionToken(userId: number, name: string): Promise<string> {
  const token = await new SignJWT({ userId, name })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime("365d")
    .sign(secretKey);
  return token;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await authenticateFromCookie(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
