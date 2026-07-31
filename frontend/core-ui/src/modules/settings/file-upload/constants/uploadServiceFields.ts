export const SERVICE_FIELDS = {
  local: {
    name: "local",
    fields: []
  },
  AWS: {
    name: "AWS",
    fields: [
      { label: 'AWS Access Key Id', name: 'AWS_ACCESS_KEY_ID', type: 'password' },
      { label: 'AWS Secret Access Key', name: 'AWS_SECRET_ACCESS_KEY', type: 'password' },
      { label: 'AWS Bucket', name: 'AWS_BUCKET', type: 'password' },
      { label: 'AWS Prefix', name: 'AWS_PREFIX', type: 'password' },
      { label: 'AWS Compatible Service Endpoint', name: 'AWS_COMPATIBLE_SERVICE_ENDPOINT', type: 'password' },
      { label: 'AWS Force Path Style', name: 'AWS_FORCE_PATH_STYLE', type: 'password' },
    ],
  },
  GCS: {
    name: "GCS",
    fields: [
      { label: 'Google Bucket Name', name: 'GCS_BUCKET', type: 'password' },
    ]
  },
  CLOUDFLARE: {
    name: "CLOUDFLARE",
    fields: [
      { label: 'Cloudflare Account id', name: 'CLOUDFLARE_ACCOUNT_ID', type: 'password' },
      { label: 'Cloudflare API Token', name: 'CLOUDFLARE_API_TOKEN', type: 'password' },
      { label: 'Cloudflare Access Key id', name: 'CLOUDFLARE_ACCESS_KEY_ID', type: 'password' },
      { label: 'Cloudflare Secret Access Key', name: 'CLOUDFLARE_SECRET_ACCESS_KEY', type: 'password' },
      { label: 'Cloudflare R2 Bucket Name', name: 'CLOUDFLARE_BUCKET_NAME', type: 'text' },
      { label: 'Cloudflare Account Hash', name: 'CLOUDFLARE_ACCOUNT_HASH', type: 'password' },
      { label: 'Use Cloudflare Images and Stream', name: 'CLOUDFLARE_USE_CDN', type: 'checkbox' },
    ]
  },
  AZURE: {
    name: "AZURE",
    fields: [
      { label: 'Container Name', name: 'ABS_CONTAINER_NAME', type: 'text' },
      { label: 'Connection String', name: 'AB_CONNECTION_STRING', type: 'password' },
    ]
  },
};