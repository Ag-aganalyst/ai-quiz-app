#!/usr/bin/env bash
# Builds a static, backend-free demo of the Brainy Medic UI prototype into ./out.
# The API routes and the Supabase-backed quiz page are set aside during the build
# (they cannot be statically exported) and restored afterwards, even on failure.
set -euo pipefail
cd "$(dirname "$0")/.."
HOLD="$(mktemp -d)"
restore() {
  [ -d "$HOLD/api" ] && mv "$HOLD/api" app/api
  [ -d "$HOLD/quiz" ] && mv "$HOLD/quiz" app/student/quiz
  rmdir "$HOLD" 2>/dev/null || true
}
trap restore EXIT
mv app/api "$HOLD/api"
mv app/student/quiz "$HOLD/quiz"
rm -rf out .next
STATIC_EXPORT=1 npx next build
echo "Static demo written to ./out ($(find out -type f | wc -l) files, $(du -sh out | cut -f1))"
