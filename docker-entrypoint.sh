#!/bin/sh
# Writes the runtime configuration (window.__ENV__) from the container
# environment, then starts Apache. Only whitelisted variables are exposed.
set -eu

HTDOCS=/usr/local/apache2/htdocs
TARGET="$HTDOCS/config.js"
TMP="$(mktemp "$HTDOCS/.config.js.XXXXXX")"

# jq does the JSON escaping; unset or empty variables are left out.
{
  printf 'window.__ENV__ = '
  jq -cn '{
    VITE_API_URL: env.VITE_API_URL
  } | with_entries(select(.value != null and .value != ""))'
  printf ';\n'
} > "$TMP"
chmod 644 "$TMP"
mv -f "$TMP" "$TARGET"

exec "$@"
