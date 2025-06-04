const SftpClient = require('ssh2-sftp-client');

export async function uploadCallRecordingToSftp({
  buffer,
  fileName,
  subdomain,
  getEnv,
}) {
  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

  if (!DOMAIN.includes('statebank')) return;

  const sftp = new SftpClient();
  const { SFTP_HOST, SFTP_PORT, SFTP_USERNAME, SFTP_PASSWORD } = process.env;
  console.log(SFTP_HOST, 'SFTP_HOST');
  const sftpConfig = {
    host: SFTP_HOST,
    port: Number(SFTP_PORT || 22),
    username: SFTP_USERNAME,
    password: SFTP_PASSWORD,
  };

  const remotePath = `/CallRecord/${fileName}.wav`;

  try {
    console.log('🔌 Connecting to SFTP server...');
    await sftp.connect(sftpConfig);
    console.log('✅ Connected to SFTP server');

    if (!Buffer.isBuffer(buffer)) {
      throw new Error('Invalid buffer input for upload');
    }

    console.log(`⬆️ Uploading file to: ${remotePath}`);
    await sftp.put(Buffer.from(buffer), remotePath);
    console.log(`✅ File uploaded successfully: ${remotePath}`);

    const uploadedFiles = await sftp.list('/uploads/');
    console.log('📂 Files in /uploads/:');
    uploadedFiles.forEach((f) => console.log(`- ${f.name}`));
  } catch (err) {
    console.error('❌ SFTP Upload Failed:', err.message);
    throw err; // rethrow for caller to handle if needed
  } finally {
    await sftp.end();
    console.log('🔒 SFTP connection closed');
  }
}
