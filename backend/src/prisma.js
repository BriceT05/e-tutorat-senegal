// Singleton Prisma — un seul client partagé dans toute l'application.
// Instancier plusieurs PrismaClient ouvrirait trop de connexions PostgreSQL.
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  // On ne loggue que les erreurs pour éviter le bruit en dev/prod
  log: ['error'],
});

module.exports = prisma;
