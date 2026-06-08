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

/*
 * Post-publish Java consumer smoke.
 *
 * Loads the bundled `translate` prompt via ClasspathPromptLoader and asserts
 * the payload matches fixtures/prompt-bundle/prompts/text/translate/promptlm.json.
 *
 * The install/resolve of `dev.promptlm:promptlm-client:<version>` from Maven
 * Central is driven by the wrapper `smoke.sh`; this class just imports the
 * installed library and runs the assertions.
 */
package dev.promptlm.smoke;

import dev.promptlm.client.ClasspathPromptLoader;
import dev.promptlm.client.Prompt;

public class Smoke {
    public static void main(String[] args) {
        Prompt p = new ClasspathPromptLoader().loadPrompt("translate");
        if (!"Translate the following text.\n".equals(p.getPrompt())) {
            throw new AssertionError("Unexpected prompt body: " + p.getPrompt());
        }
        if (!"Text Translator".equals(p.getName())) {
            throw new AssertionError("Unexpected prompt name: " + p.getName());
        }
        System.out.println("consumer-smoke OK: " + p.getId() + " " + p.getVersion());
    }
}
