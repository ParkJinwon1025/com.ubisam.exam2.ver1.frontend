cat <<EOF > /usr/share/nginx/html/config.json
{
  "VITE_OAUTH2_SERVER": "${VITE_OAUTH2_SERVER:-http://localhost:9020}",
  "VITE_STOMP_SERVER": "${VITE_STOMP_SERVER:-http://localhost:9030}",
  "VITE_STOMP_DESTINATION": "${VITE_STOMP_DESTINATION:-/topic/sessions}",
  "VITE_EXAMPLE_SERVER": "${VITE_EXAMPLE_SERVER:-http://localhost:8080}",
  "apiUrl": "${API_URL:-http://localhost:3000}",
  "appTitle": "${APP_TITLE:-My Vue App}"
}
EOF

nginx -g "daemon off;"