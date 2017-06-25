#!/bin/bash

set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

"$CHROME" --pack-extension="$PWD/chrome-extension" --pack-extension-key="$PWD/extension-key.pem"
