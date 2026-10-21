/**
 * Cryptographic security utilities for VCinema
 * Computes salted SHA-256 hashes using the browser's native Web Crypto API.
 * Ensures passwords and confidential secrets are never transmitted or stored in plain text.
 */

export async function hashRoomPassword(password: string, roomId: string): Promise<string> {
  const cleanPass = password.trim();
  if (!cleanPass) return '';

  const enc = new TextEncoder();
  // Salt with room ID to prevent cross-room collision and rainbow table lookup
  const data = enc.encode(`vcinema_salt:${roomId}:${cleanPass}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyRoomPassword(
  enteredPassword: string,
  roomId: string,
  storedHash?: string | null,
  legacyPlaintextPassword?: string | null
): Promise<boolean> {
  if (!enteredPassword.trim()) return false;

  if (storedHash) {
    const computed = await hashRoomPassword(enteredPassword, roomId);
    return computed === storedHash;
  }

  // Graceful fallback for legacy rooms created before hashing upgrade
  if (legacyPlaintextPassword) {
    return enteredPassword.trim() === legacyPlaintextPassword.trim();
  }

  return false;
}
