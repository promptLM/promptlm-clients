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
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "vitest";

import {
  DirectoryPromptSource,
  JsonPromptLoader,
  PackageResourcePromptSource,
  PromptArtifactError,
  PromptNotFoundError
} from "../src/index.js";

const sharedFixtureRoot = fileURLToPath(new URL("../../fixtures/prompt-bundle", import.meta.url));

async function createBundle(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "promptlm-ts-"));
  for (const [relativePath, content] of Object.entries(files)) {
    const filePath = path.join(root, relativePath);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, content, "utf8");
  }
  return root;
}

test("loads a prompt from the shared fixture bundle", async () => {
  const loader = new JsonPromptLoader(new DirectoryPromptSource(sharedFixtureRoot));

  const prompt = await loader.loadPrompt("translate");

  assert.deepEqual(prompt, {
    id: "translate",
    version: "1.0.0",
    name: "Text Translator",
    path: "prompts/text/translate/promptlm.json",
    prompt: "Translate the following text.\n"
  });
});

test("loads a prompt from packaged resources", async () => {
  const loader = new JsonPromptLoader(new PackageResourcePromptSource());

  const prompt = await loader.loadPrompt("translate");

  assert.equal(prompt.prompt, "Translate the following text.\n");
});

test("throws for unknown prompt ids", async () => {
  const loader = new JsonPromptLoader(new DirectoryPromptSource(sharedFixtureRoot));

  await assert.rejects(() => loader.loadPrompt("missing"), PromptNotFoundError);
});

test("rejects duplicate ids in the index", async () => {
  const root = await createBundle({
    "prompts/prompt-index.json": JSON.stringify(
      [
        {
          id: "translate",
          version: "1.0.0",
          name: "A",
          path: "prompts/a/promptlm.json"
        },
        {
          id: "translate",
          version: "1.0.0",
          name: "B",
          path: "prompts/b/promptlm.json"
        }
      ],
      null,
      2
    )
  });

  const loader = new JsonPromptLoader(new DirectoryPromptSource(root));
  await assert.rejects(() => loader.loadPrompt("translate"), PromptArtifactError);
});

test("rejects missing prompt files", async () => {
  const root = await createBundle({
    "prompts/prompt-index.json": JSON.stringify(
      [
        {
          id: "translate",
          version: "1.0.0",
          name: "Text Translator",
          path: "prompts/text/translate/promptlm.json"
        }
      ],
      null,
      2
    )
  });

  const loader = new JsonPromptLoader(new DirectoryPromptSource(root));
  await assert.rejects(() => loader.loadPrompt("translate"), PromptArtifactError);
});

test("rejects malformed prompt json", async () => {
  const root = await createBundle({
    "prompts/prompt-index.json": JSON.stringify(
      [
        {
          id: "translate",
          version: "1.0.0",
          name: "Text Translator",
          path: "prompts/text/translate/promptlm.json"
        }
      ],
      null,
      2
    ),
    "prompts/text/translate/promptlm.json": "{not valid json"
  });

  const loader = new JsonPromptLoader(new DirectoryPromptSource(root));
  await assert.rejects(() => loader.loadPrompt("translate"), PromptArtifactError);
});

test("rejects prompt files without prompt content", async () => {
  const root = await createBundle({
    "prompts/prompt-index.json": JSON.stringify(
      [
        {
          id: "translate",
          version: "1.0.0",
          name: "Text Translator",
          path: "prompts/text/translate/promptlm.json"
        }
      ],
      null,
      2
    ),
    "prompts/text/translate/promptlm.json": JSON.stringify(
      {
        id: "translate",
        version: "1.0.0",
        name: "Text Translator"
      },
      null,
      2
    )
  });

  const loader = new JsonPromptLoader(new DirectoryPromptSource(root));
  await assert.rejects(() => loader.loadPrompt("translate"), PromptArtifactError);
});

test("ignores extra fields in prompt json", async () => {
  const root = await createBundle({
    "prompts/prompt-index.json": JSON.stringify(
      [
        {
          id: "translate",
          version: "1.0.0",
          name: "Text Translator",
          path: "prompts/text/translate/promptlm.json"
        }
      ],
      null,
      2
    ),
    "prompts/text/translate/promptlm.json": JSON.stringify(
      {
        id: "translate",
        version: "1.0.0",
        name: "Text Translator",
        prompt: "Translate the following text.\n",
        description: "ignored"
      },
      null,
      2
    )
  });

  const loader = new JsonPromptLoader(new DirectoryPromptSource(root));
  const prompt = await loader.loadPrompt("translate");

  assert.equal(prompt.prompt, "Translate the following text.\n");
});
