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
export type Prompt = {
  id: string;
  version: string;
  name: string;
  path: string;
  prompt: string;
};

export type PromptIndexEntry = {
  id: string;
  version: string;
  name: string;
  path: string;
};

export interface PromptLoader {
  loadPrompt(id: string): Promise<Prompt>;
}

export interface PromptSource {
  readText(relativePath: string): Promise<string>;
}
