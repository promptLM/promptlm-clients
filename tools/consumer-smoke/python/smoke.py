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

"""Post-publish Python consumer smoke.

Loads the bundled `translate` prompt via the package's
`PackageResourcePromptSource` and asserts the payload matches
`fixtures/prompt-bundle/prompts/text/translate/promptlm.json`.

The install of `promptlm-client==<version>` is done by the wrapper
`smoke.sh`; this script just imports the installed package and runs the
assertions.
"""

from promptlm_client import JsonPromptLoader, PackageResourcePromptSource


def main() -> None:
    prompt = JsonPromptLoader(PackageResourcePromptSource()).load_prompt("translate")
    assert prompt.prompt == "Translate the following text.\n", repr(prompt.prompt)
    assert prompt.name == "Text Translator", repr(prompt.name)
    print("consumer-smoke OK:", prompt.id, prompt.version)


if __name__ == "__main__":
    main()
