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

class PromptArtifactError(Exception):
    """Raised when the prompt bundle is invalid or unreadable."""


class PromptNotFoundError(Exception):
    """Raised when a prompt id does not exist in the bundle."""

    def __init__(self, prompt_id: str) -> None:
        super().__init__(f"Unknown prompt id: {prompt_id}")
