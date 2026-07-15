#!/bin/sh
set -e

echo "🔧 Running Prisma schema push..."
npx prisma db push --accept-data-loss 2>/dev/null || true

echo "🌱 Checking if database needs seeding..."
# Only seed if the database is empty (no properties exist)
if [ ! -f /app/data/estate-plus.db ] || [ "$(stat -c%s /app/data/estate-plus.db 2>/dev/null || echo 0)" -lt 1000 ]; then
  echo "🌱 Seeding database..."
  npx tsx prisma/seed.ts 2>/dev/null || true
fi

echo "🚀 Starting Estate Plus CRM..."
exec node server.js
