import { cookies } from 'next/headers';
import { getAdminSettings } from './db';

const ADMIN_COOKIE_NAME = 'admin_session_token';
const SESSION_SECRET_PREFIX = 'sec_session_adm_';

export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;

  const settings = await getAdminSettings();
  const expectedToken = `${SESSION_SECRET_PREFIX}${Buffer.from(settings.adminPin).toString('base64')}`;
  return token === expectedToken;
}

export function createAdminToken(pin: string): string {
  return `${SESSION_SECRET_PREFIX}${Buffer.from(pin).toString('base64')}`;
}

export { ADMIN_COOKIE_NAME };
