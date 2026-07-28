import bcrypt from "bcryptjs";

/**
 * Password hashing helpers.
 *
 * We use bcryptjs (pure-JS, works on Node and Edge runtimes without native
 * bindings). Cost factor 10 is the standard sweet spot: strong enough to
 * make brute-force expensive, fast enough to not add noticeable login lag.
 */

const SALT_ROUNDS = 10;

/**
 * Recognise a bcrypt hash so we can tell hashed passwords from legacy
 * plain-text ones (which we transparently upgrade on next login).
 */
export function isBcryptHash(value: string): boolean {
  return /^\$2[aby]\$\d{2}\$.{53}$/.test(value);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  stored: string
): Promise<boolean> {
  if (isBcryptHash(stored)) {
    return bcrypt.compare(plain, stored);
  }
  // Legacy plain-text row (pre-hashing rollout). Constant-time compare.
  if (plain.length !== stored.length) return false;
  let mismatch = 0;
  for (let i = 0; i < plain.length; i++) {
    mismatch |= plain.charCodeAt(i) ^ stored.charCodeAt(i);
  }
  return mismatch === 0;
}
