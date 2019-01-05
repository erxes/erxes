echo "`jo \`env | grep type\` \
          \`env | grep project_id\` \
          \`env | grep private_key_id\` \
          \`env | grep client_email\` \
          \`env | grep client_id\` \
          \`env | grep auth_uri\` \
          \`env | grep token_uri\` \
          \`env | grep auth_provider_x509_cert_url\` \
          \`env | grep client_x509_cert_url\` \
          private_key="$private_key" \
          `" > google_cred.json
yarn start
