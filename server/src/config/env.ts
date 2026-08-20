import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  serpApiKey: required("SERPAPI_KEY"),
  port: Number(process.env.PORT ?? 4000),
  allowedOrigin: process.env.ALLOWED_ORIGIN ?? "http://localhost:8081",
};
