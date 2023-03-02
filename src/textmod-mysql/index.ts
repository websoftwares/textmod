import mysql from 'mysql2/promise';

class MySQLConnectionManager {
  private readonly pool: mysql.Pool;

  constructor(config: mysql.PoolOptions) {
    this.pool = mysql.createPool(config);
  }

  async getConnection(): Promise<mysql.PoolConnection> {
    return await this.pool.getConnection();
  }

  async executeQuery<T extends mysql.RowDataPacket>(query: string, params: any[] = []): Promise<T[]> {
    const connection = await this.pool.getConnection();

    try {
      const [rows] = await connection.query<T[]>(query, params);
      return rows;
    } finally {
      connection.release();
    }
  }

  async end(): Promise<void> {
    return await this.pool.end();
  }
}

export default MySQLConnectionManager;
