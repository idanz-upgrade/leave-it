#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export PATH="$PATH:/usr/local/bin:/opt/homebrew/bin"
cd "/Users/messergalili/IM Project"

# Export static web build
npx expo export --platform web --output-dir /tmp/shlita-web 2>&1 | grep -v "^$"

# Patch: add type="module" to entry script (required for import.meta)
if [ -f /tmp/shlita-web/index.html ]; then
  ENTRY=$(grep -o 'entry-[a-f0-9]*\.js' /tmp/shlita-web/index.html | head -1)
  if [ -n "$ENTRY" ]; then
    sed -i '' "s|<script src=\"/_expo/static/js/web/${ENTRY}\" defer></script>|<script type=\"module\" src=\"/_expo/static/js/web/${ENTRY}\"></script>|" /tmp/shlita-web/index.html
    echo "Patched: $ENTRY with type=module"
  fi
fi

# Serve static build
cd /tmp/shlita-web
npx serve . --listen ${PORT:-8081} --no-clipboard --single
