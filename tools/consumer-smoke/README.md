# Consumer smokes

Post-publish "outside consumer" smoke tests for each language SDK. Each
script:

1. Polls the relevant package registry until the just-published version
   is resolvable.
2. Installs / resolves it as an external dependency (NOT from this
   workspace).
3. Runs a tiny consumer program that loads the bundled `translate`
   prompt via the public loader API and asserts the payload matches
   `fixtures/prompt-bundle/prompts/text/translate/promptlm.json`.

These are exercised by the release workflows
(`.github/workflows/release-{python,typescript,java}.yml`) after the
publish step. They live as normal source files (not YAML heredocs) so
you can edit, lint, and debug them in your IDE, and reproduce CI
failures locally.

## Run locally

Pick a version that has actually been published to the relevant
registry, then:

```sh
# Python (PyPI)
tools/consumer-smoke/python/smoke.sh 0.1.0

# TypeScript (npm)
tools/consumer-smoke/ts/smoke.sh 0.1.0

# Java (Maven Central)
tools/consumer-smoke/java/smoke.sh 0.1.0
```

You can also pass the version via the `VERSION` env var:

```sh
VERSION=0.1.0 tools/consumer-smoke/python/smoke.sh
```

## Poll/retry windows

Identical to the previous inline CI logic:

- **Python (PyPI)**: 10 attempts * 30s = ~5 min
- **TypeScript (npm)**: 10 attempts * 30s = ~5 min
- **Java (Maven Central)**: 40 attempts * 60s = ~40 min (the CI job
  timeout of 45 min backstops)

## Layout

```
tools/consumer-smoke/
  python/
    smoke.sh      poll-install promptlm==<version> from PyPI
    smoke.py      consumer: loads translate prompt and asserts payload
  ts/
    smoke.sh      poll-install @promptlm/client@<version> from npm
    smoke.mjs     consumer: loads translate prompt and asserts payload
  java/
    smoke.sh      poll-resolve dev.promptlm:promptlm-client:<version>
    pom.xml       standalone consumer pom (NOT parented on the repo pom)
    src/main/java/dev/promptlm/smoke/Smoke.java
    src/main/resources/prompts/...
```
