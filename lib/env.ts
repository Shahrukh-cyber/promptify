import "server-only";

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". ` +
        `Copy .env.example to .env.local and set it.`
    );
  }

  return value;
}

/** Base URL of the model server, without a trailing slash. */
export const API_BASE_URL = requireEnv("API_BASE_URL").replace(/\/+$/, "");
