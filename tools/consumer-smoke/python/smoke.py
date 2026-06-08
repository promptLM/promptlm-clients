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
