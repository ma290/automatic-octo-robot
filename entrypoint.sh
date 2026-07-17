#!/bin/sh
set -e

echo "🔧 Running Prisma schema push..."
npx prisma db push --accept-data-loss

echo "🌱 Checking if database needs seeding..."
# Seed only if the Owner table is empty
OWNER_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.owner.count().then(n => { console.log(n); p.\$disconnect(); }).catch(() => { console.log(0); p.\$disconnect(); });
" 2>/dev/null || echo "0")

if [ "$OWNER_COUNT" = "0" ]; then
  echo "🌱 Seeding database..."
  npx tsx prisma/seed.ts || true
else
  echo "✅ Database already seeded ($OWNER_COUNT owners found), skipping."
fi

echo "🚀 Starting Estate Plus CRM..."
exec node server.js
