// Post-publish TypeScript consumer smoke.
//
// Loads the bundled `translate` prompt via the package's
// PackageResourcePromptSource and asserts the payload matches
// fixtures/prompt-bundle/prompts/text/translate/promptlm.json.
//
// The install of `@promptlm/client@<version>` is done by the wrapper
// smoke.sh; this script just imports the installed package and runs the
// assertions.

import { JsonPromptLoader, PackageResourcePromptSource } from '@promptlm/client';

const prompt = await new JsonPromptLoader(new PackageResourcePromptSource()).loadPrompt('translate');

if (prompt.prompt !== 'Translate the following text.\n') {
  throw new Error(`Unexpected prompt payload: ${JSON.stringify(prompt.prompt)}`);
}
if (prompt.name !== 'Text Translator') {
  throw new Error(`Unexpected prompt name: ${prompt.name}`);
}
console.log('consumer-smoke OK:', prompt.id, prompt.version);
