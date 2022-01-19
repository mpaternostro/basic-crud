/**
 * @type {import('@nestjs/typeorm').TypeOrmModuleOptions}
 */
module.exports = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: false,
  ssl: {
    rejectUnauthorized: false,
  },
  useUTC: true,
  migrations: ['dist/migration/*.ts'],
  cli: {
    migrationsDir: 'dist/migration',
  },
};
