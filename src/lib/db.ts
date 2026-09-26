import { Pool } from 'pg';

export interface Comment {
  id: string;
  name: string;
  message: string;
  category: 'Saran' | 'Kritik' | 'Pesan Rahasia' | 'Pertanyaan' | 'Apresiasi' | 'Lainnya';
  rating?: number;
  isAnonymous: boolean;
  isRead: boolean;
  isStarred: boolean;
  createdAt: string;
}

export interface AdminSettings {
  adminPin: string;
  updatedAt: string;
}

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL_UNPOOLED;

// Global singleton pool
const globalForPg = globalThis as unknown as {
  pgPool?: Pool;
  isInitialized?: boolean;
};

export const pool =
  globalForPg.pgPool ||
  new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPg.pgPool = pool;
}

let initPromise: Promise<void> | null = null;

export async function ensureDbInitialized(): Promise<void> {
  if (globalForPg.isInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const client = await pool.connect();
      try {
        // Create comments table
        await client.query(`
          CREATE TABLE IF NOT EXISTS comments (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            category VARCHAR(50) NOT NULL DEFAULT 'Saran',
            rating INT,
            is_anonymous BOOLEAN DEFAULT FALSE,
            is_read BOOLEAN DEFAULT FALSE,
            is_starred BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // Create settings table
        await client.query(`
          CREATE TABLE IF NOT EXISTS settings (
            key VARCHAR(50) PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // Seed default admin PIN if not exists
        await client.query(`
          INSERT INTO settings (key, value, updated_at)
          VALUES ('admin_pin', 'admin123', CURRENT_TIMESTAMP)
          ON CONFLICT (key) DO NOTHING;
        `);

        globalForPg.isInitialized = true;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Failed to initialize PostgreSQL tables:', err);
    }
  })();

  return initPromise;
}

export async function getComments(): Promise<Comment[]> {
  await ensureDbInitialized();
  try {
    const res = await pool.query(`
      SELECT 
        id, 
        name, 
        message, 
        category, 
        rating, 
        is_anonymous as "isAnonymous", 
        is_read as "isRead", 
        is_starred as "isStarred", 
        created_at as "createdAt"
      FROM comments
      ORDER BY created_at DESC
    `);

    return res.rows.map(row => ({
      ...row,
      createdAt: new Date(row.createdAt).toISOString(),
    }));
  } catch (error) {
    console.error('Error in getComments from PostgreSQL:', error);
    return [];
  }
}

export async function addComment(data: {
  name: string;
  message: string;
  category?: string;
  rating?: number;
  isAnonymous?: boolean;
}): Promise<Comment> {
  await ensureDbInitialized();

  const validCategories = ['Saran', 'Kritik', 'Pesan Rahasia', 'Pertanyaan', 'Apresiasi', 'Lainnya'] as const;
  const category = validCategories.includes(data.category as any)
    ? (data.category as Comment['category'])
    : 'Saran';

  const id = 'cmt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const name = data.isAnonymous ? 'Anonim' : (data.name?.trim() || 'Anonim');
  const message = data.message.trim();
  const rating = data.rating && data.rating >= 1 && data.rating <= 5 ? data.rating : null;
  const isAnonymous = Boolean(data.isAnonymous);

  const res = await pool.query(
    `
      INSERT INTO comments (id, name, message, category, rating, is_anonymous, is_read, is_starred, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, FALSE, FALSE, CURRENT_TIMESTAMP)
      RETURNING 
        id, 
        name, 
        message, 
        category, 
        rating, 
        is_anonymous as "isAnonymous", 
        is_read as "isRead", 
        is_starred as "isStarred", 
        created_at as "createdAt";
    `,
    [id, name, message, category, rating, isAnonymous]
  );

  const row = res.rows[0];
  return {
    ...row,
    createdAt: new Date(row.createdAt).toISOString(),
  };
}

export async function updateComment(
  id: string,
  updates: Partial<Pick<Comment, 'isRead' | 'isStarred'>>
): Promise<Comment | null> {
  await ensureDbInitialized();

  const fields: string[] = [];
  const values: any[] = [];
  let index = 1;

  if (typeof updates.isRead === 'boolean') {
    fields.push(`is_read = $${index++}`);
    values.push(updates.isRead);
  }

  if (typeof updates.isStarred === 'boolean') {
    fields.push(`is_starred = $${index++}`);
    values.push(updates.isStarred);
  }

  if (fields.length === 0) return null;

  values.push(id);
  const query = `
    UPDATE comments
    SET ${fields.join(', ')}
    WHERE id = $${index}
    RETURNING 
      id, 
      name, 
      message, 
      category, 
      rating, 
      is_anonymous as "isAnonymous", 
      is_read as "isRead", 
      is_starred as "isStarred", 
      created_at as "createdAt";
  `;

  const res = await pool.query(query, values);
  if (res.rows.length === 0) return null;

  const row = res.rows[0];
  return {
    ...row,
    createdAt: new Date(row.createdAt).toISOString(),
  };
}

export async function deleteComment(id: string): Promise<boolean> {
  await ensureDbInitialized();
  const res = await pool.query('DELETE FROM comments WHERE id = $1', [id]);
  return (res.rowCount ?? 0) > 0;
}

export async function getAdminSettings(): Promise<AdminSettings> {
  await ensureDbInitialized();
  try {
    const res = await pool.query("SELECT value, updated_at FROM settings WHERE key = 'admin_pin'");
    if (res.rows.length > 0) {
      return {
        adminPin: res.rows[0].value,
        updatedAt: new Date(res.rows[0].updated_at).toISOString(),
      };
    }
  } catch (error) {
    console.error('Error getAdminSettings from PostgreSQL:', error);
  }
  return { adminPin: 'admin123', updatedAt: new Date().toISOString() };
}

export async function updateAdminPin(newPin: string): Promise<boolean> {
  await ensureDbInitialized();
  try {
    await pool.query(
      `
        INSERT INTO settings (key, value, updated_at)
        VALUES ('admin_pin', $1, CURRENT_TIMESTAMP)
        ON CONFLICT (key)
        DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP;
      `,
      [newPin]
    );
    return true;
  } catch (error) {
    console.error('Error updating admin PIN in PostgreSQL:', error);
    return false;
  }
}
