echo "`jo \`env | grep type\``" >> /erxes-api/google_cred.json
echo "`jo \`env | grep project_id\``" >> /erxes-api/google_cred.json
echo "`jo \`env | grep private_key_id\``" >> /erxes-api/google_cred.json
echo "`jo private_key="$private_key"`" >> /erxes-api/google_cred.json
echo "`jo \`env | grep client_email\``" >> /erxes-api/google_cred.json
echo "`jo \`env | grep client_id\``" >> /erxes-api/google_cred.json
echo "`jo \`env | grep auth_uri\``" >> /erxes-api/google_cred.json
echo "`jo \`env | grep token_uri\``" >> /erxes-api/google_cred.json
echo "`jo \`env | grep auth_provider_x509_cert_url\``" >> /erxes-api/google_cred.json
echo "`jo \`env | grep client_x509_cert_url\``" >> /erxes-api/google_cred.json
yarn start
