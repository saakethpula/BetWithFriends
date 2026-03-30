import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH0_DOMAIN: z.string().min(1),
  AUTH0_AUDIENCE: z.string().min(1),
  AUTH0_ISSUER_BASE_URL: z.string().url(),
  FRONTEND_ORIGIN: z.string().url(),
  PORT: z.coerce.number().int().positive().default(4000)
});

export const env = envSchema.parse(process.env);
