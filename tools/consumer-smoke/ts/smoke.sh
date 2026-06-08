#!/usr/bin/env bash
# Post-publish TypeScript consumer smoke.
#
# Installs `@promptlm/client@<version>` from npm into a throwaway project and
# runs smoke.mjs to load the bundled `translate` prompt fixture and assert
# its payload.
#
# Usage:
#   tools/consumer-smoke/ts/smoke.sh <version>
#   VERSION=<version> tools/consumer-smoke/ts/smoke.sh
set -euo pipefail

VERSION="${1:-${VERSION:-}}"
if [ -z "${VERSION}" ]; then
  echo "usage: $0 <version> (or set VERSION env var)" >&2
  exit 2
fi

SMOKE_DIR="${SMOKE_DIR:-/tmp/smoke}"
HERE="$(cd "$(dirname "$0")" && pwd)"

echo "Preparing throwaway project at ${SMOKE_DIR}"
mkdir -p "${SMOKE_DIR}"
cd "${SMOKE_DIR}"
npm init -y >/dev/null

# npm CDN can lag a couple of minutes after publish. Retry up to
# ~5 min (10 attempts * 30s).
installed=0
for attempt in $(seq 1 10); do
  echo "Attempt ${attempt}: installing @promptlm/client@${VERSION}"
  if npm install --no-audit --no-fund "@promptlm/client@${VERSION}"; then
    echo "Installed @promptlm/client@${VERSION}"
    installed=1
    break
  fi
  echo "Install failed; sleeping 30s before retry."
  sleep 30
done

if [ "${installed}" -ne 1 ]; then
  echo "@promptlm/client@${VERSION} not installable from npm after retries." >&2
  exit 1
fi

cp "${HERE}/smoke.mjs" "${SMOKE_DIR}/smoke.mjs"

echo "Running consumer (smoke.mjs)"
node "${SMOKE_DIR}/smoke.mjs"
