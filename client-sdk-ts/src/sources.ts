/*
 * Copyright 2025 promptLM
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { PromptArtifactError } from "./errors.js";
import type { PromptSource } from "./types.js";

function resolveSafePath(rootDir: string, relativePath: string): string {
  if (!relativePath) {
    throw new PromptArtifactError("Prompt path must not be empty");
  }

  const normalized = path.posix.normalize(relativePath);
  if (normalized.startsWith("../") || normalized === ".." || path.posix.isAbsolute(normalized)) {
    throw new PromptArtifactError(`Prompt path escapes source root: ${relativePath}`);
  }

  const resolvedRoot = path.resolve(rootDir);
  const resolvedPath = path.resolve(resolvedRoot, normalized);
  const relative = path.relative(resolvedRoot, resolvedPath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new PromptArtifactError(`Prompt path escapes source root: ${relativePath}`);
  }

  return resolvedPath;
}

export class DirectoryPromptSource implements PromptSource {
  constructor(private readonly rootDir: string) {}

  async readText(relativePath: string): Promise<string> {
    const filePath = resolveSafePath(this.rootDir, relativePath);
    try {
      return await readFile(filePath, "utf8");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new PromptArtifactError(`Could not read prompt bundle file ${relativePath}: ${message}`);
    }
  }
}

export class PackageResourcePromptSource extends DirectoryPromptSource {
  constructor(rootDir = fileURLToPath(new URL("../resources", import.meta.url))) {
    super(rootDir);
  }
}
