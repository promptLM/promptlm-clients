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
