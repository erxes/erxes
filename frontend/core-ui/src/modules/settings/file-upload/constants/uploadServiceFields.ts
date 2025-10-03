export const SERVICE_FIELDS = {
  local: {
    name: "local",
    fields: []
  },
  AWS: {
    name: "AWS",
    fields: [
      { label: 'AWS Access Key Id', name: 'AWS_ACCESS_KEY_ID', type: 'text' },
      { label: 'AWS Secret Access Key', name: 'AWS_SECRET_ACCESS_KEY', type: 'text' },
      { label: 'AWS Bucket', name: 'AWS_BUCKET', type: 'text' },
      { label: 'AWS Prefix', name: 'AWS_PREFIX', type: 'text' },
      { label: 'AWS Compatible Service Endpoint', name: 'AWS_COMPATIBLE_SERVICE_ENDPOINT', type: 'text' },
      { label: 'AWS Force Path Style', name: 'AWS_FORCE_PATH_STYLE', type: 'text' },
    ],
  },
  GCS: {
    name: "GCS",
    fields: [
      { label: 'Google Bucket Name', name: 'GCS_BUCKET', type: 'text' },
    ]
  },
  CLOUDFLARE: {
    name: "CLOUDFLARE",
    fields: [
      { label: 'Cloudflare Account id', name: 'CLOUDFLARE_ACCOUNT_ID', type: 'text' },
      { label: 'Cloudflare API Token', name: 'CLOUDFLARE_API_TOKEN', type: 'text' },
      { label: 'Cloudflare Access Key id', name: 'CLOUDFLARE_ACCESS_KEY_ID', type: 'text' },
      { label: 'Cloudflare Secret Access Key', name: 'CLOUDFLARE_SECRET_ACCESS_KEY', type: 'text' },
      { label: 'Cloudflare R2 Bucket Name', name: 'CLOUDFLARE_BUCKET_NAME', type: 'text' },
      { label: 'Cloudflare Account Hash', name: 'CLOUDFLARE_ACCOUNT_HASH', type: 'text' },
      { label: 'Use Cloudflare Images and Stream', name: 'CLOUDFLARE_USE_CDN', type: 'checkbox' },
    ]
  },
  AZURE: {
    name: "AZURE",
    fields: [
      { label: 'Container Name', name: 'ABS_CONTAINER_NAME', type: 'text' },
      { label: 'Connection String', name: 'AB_CONNECTION_STRING', type: 'text' },
    ]
  },
};