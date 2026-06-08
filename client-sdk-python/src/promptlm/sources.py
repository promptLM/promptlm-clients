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

from importlib import resources
from pathlib import Path, PurePosixPath

from .errors import PromptArtifactError


def _normalize_relative_path(relative_path: str) -> PurePosixPath:
    if not relative_path:
        raise PromptArtifactError("Prompt path must not be empty")

    path = PurePosixPath(relative_path)
    if path.is_absolute() or ".." in path.parts:
        raise PromptArtifactError(f"Prompt path escapes source root: {relative_path}")
    return path


class DirectoryPromptSource:
    def __init__(self, root_dir: str | Path) -> None:
        self._root_dir = Path(root_dir).resolve()

    def read_text(self, relative_path: str) -> str:
        normalized = _normalize_relative_path(relative_path)
        target = (self._root_dir / normalized).resolve()
        try:
            target.relative_to(self._root_dir)
        except ValueError as error:
            raise PromptArtifactError(
                f"Prompt path escapes source root: {relative_path}"
            ) from error

        try:
            return target.read_text(encoding="utf-8")
        except OSError as error:
            raise PromptArtifactError(
                f"Could not read prompt bundle file {relative_path}: {error}"
            ) from error


class PackageResourcePromptSource:
    def __init__(self, package: str = "promptlm.resources") -> None:
        self._root = resources.files(package)

    def read_text(self, relative_path: str) -> str:
        resource = self._root
        for part in _normalize_relative_path(relative_path).parts:
            resource = resource.joinpath(part)

        if not resource.is_file():
            raise PromptArtifactError(
                f"Could not read prompt bundle file {relative_path}: file not found"
            )
        return resource.read_text(encoding="utf-8")
