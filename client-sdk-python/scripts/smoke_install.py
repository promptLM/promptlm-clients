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

from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

PACKAGE_ROOT = Path(__file__).resolve().parents[1]


def run(*args: str, cwd: Path) -> None:
    subprocess.run(args, cwd=cwd, check=True)


def main() -> None:
    temp_root = Path(tempfile.mkdtemp(prefix="promptlm-py-smoke-"))
    try:
        venv_dir = temp_root / "venv"
        wheelhouse = temp_root / "wheelhouse"

        run(
            sys.executable,
            "-m",
            "pip",
            "wheel",
            ".",
            "-w",
            str(wheelhouse),
            "--no-deps",
            cwd=PACKAGE_ROOT,
        )
        wheel = next(wheelhouse.glob("promptlm-*.whl"))

        run(sys.executable, "-m", "venv", str(venv_dir), cwd=PACKAGE_ROOT)
        venv_python = venv_dir / (
            "Scripts/python.exe" if sys.platform == "win32" else "bin/python"
        )
        run(str(venv_python), "-m", "pip", "install", str(wheel), cwd=PACKAGE_ROOT)
        run(
            str(venv_python),
            "-c",
            (
                "from promptlm import JsonPromptLoader, "
                "PackageResourcePromptSource; "
                "prompt = JsonPromptLoader("
                "PackageResourcePromptSource()).load_prompt('translate'); "
                "assert prompt.prompt == 'Translate the following text.\\n'"
            ),
            cwd=PACKAGE_ROOT,
        )
    finally:
        shutil.rmtree(temp_root, ignore_errors=True)


if __name__ == "__main__":
    main()
