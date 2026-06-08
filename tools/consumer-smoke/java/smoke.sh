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

# Post-publish Java consumer smoke.
#
# Polls Maven Central until `dev.promptlm:promptlm-client:<version>` is
# resolvable, then builds and runs the Smoke consumer (which loads the
# bundled `translate` prompt via ClasspathPromptLoader and asserts the
# payload).
#
# Usage:
#   tools/consumer-smoke/java/smoke.sh <version>
#   VERSION=<version> tools/consumer-smoke/java/smoke.sh
set -euo pipefail

VERSION="${1:-${VERSION:-}}"
if [ -z "${VERSION}" ]; then
  echo "usage: $0 <version> (or set VERSION env var)" >&2
  exit 2
fi

HERE="$(cd "$(dirname "$0")" && pwd)"
cd "${HERE}"

# Maven Central sync (Sonatype Central Portal -> Maven Central index ->
# repo1.maven.org) can take ~30 min after a Portal promotion. Poll up
# to ~40 min (40 attempts * 60s); the surrounding job timeout (45 min)
# backstops.
resolved=0
for attempt in $(seq 1 40); do
  echo "Attempt ${attempt}: resolving dev.promptlm:promptlm-client:${VERSION} from Maven Central"
  if mvn -B -q -U \
      org.apache.maven.plugins:maven-dependency-plugin:3.6.1:get \
      -DremoteRepositories=central::default::https://repo1.maven.org/maven2 \
      -Dartifact="dev.promptlm:promptlm-client:${VERSION}"; then
    echo "Artifact resolved."
    resolved=1
    break
  fi
  echo "Not yet resolvable; sleeping 60s before retry."
  sleep 60
done

if [ "${resolved}" -ne 1 ]; then
  echo "dev.promptlm:promptlm-client:${VERSION} not on Maven Central after polling." >&2
  exit 1
fi

echo "Building consumer project"
mvn -B -q -Dpromptlm.version="${VERSION}" package

echo "Running consumer"
mvn -B -q -Dpromptlm.version="${VERSION}" exec:java
