#!/usr/bin/env bash
#
# Copyright 2025 promptLM
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Post-publish Python consumer smoke.
#
# Installs `promptlm==<version>` from PyPI into a throwaway venv and
# runs smoke.py to load the bundled `translate` prompt fixture and assert its
# payload.
#
# Usage:
#   tools/consumer-smoke/python/smoke.sh <version>
#   VERSION=<version> tools/consumer-smoke/python/smoke.sh
set -euo pipefail

VERSION="${1:-${VERSION:-}}"
if [ -z "${VERSION}" ]; then
  echo "usage: $0 <version> (or set VERSION env var)" >&2
  exit 2
fi

VENV_DIR="${VENV_DIR:-/tmp/smoke-venv}"
HERE="$(cd "$(dirname "$0")" && pwd)"

echo "Creating venv at ${VENV_DIR}"
python -m venv "${VENV_DIR}"

# PyPI propagates fast but the just-published index can lag a few
# seconds. Retry up to ~5 min (10 attempts * 30s).
installed=0
for attempt in $(seq 1 10); do
  echo "Attempt ${attempt}: installing promptlm==${VERSION}"
  if "${VENV_DIR}/bin/pip" install --no-cache-dir "promptlm==${VERSION}"; then
    echo "Installed promptlm==${VERSION}"
    installed=1
    break
  fi
  echo "Install failed; sleeping 30s before retry."
  sleep 30
done

if [ "${installed}" -ne 1 ]; then
  echo "promptlm==${VERSION} not installable from PyPI after retries." >&2
  exit 1
fi

echo "Running consumer (smoke.py)"
"${VENV_DIR}/bin/python" "${HERE}/smoke.py"
