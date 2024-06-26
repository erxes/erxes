import AWS from 'aws-sdk';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const bucketName = 'your-s3-bucket-name';
const downloadDir = './downloads';

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_KEY = process.env.CLOUDFLARE_API_KEY;
const CLOUDFLARE_EMAIL = process.env.CLOUDFLARE_EMAIL;

async function listFiles(): Promise<AWS.S3.ObjectList> {
  const params = {
    Bucket: bucketName,
  };

  try {
    const data = await s3.listObjectsV2(params).promise();
    return data.Contents || [];
  } catch (err) {
    console.error('Error listing S3 objects:', err);
    throw err;
  }
}

async function downloadFile(key: string): Promise<string> {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  const filePath = path.join(downloadDir, key);
  const file = fs.createWriteStream(filePath);

  return new Promise((resolve, reject) => {
    s3.getObject(params).createReadStream()
      .on('end', () => resolve(filePath))
      .on('error', err => reject(err))
      .pipe(file);
  });
}

async function uploadFileToCloudflare(filePath: string) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/media`;
  const fileStream = fs.createReadStream(filePath);

  try {
    const response = await axios.post(url, fileStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Authorization': `Bearer ${CLOUDFLARE_API_KEY}`,
        'X-Auth-Email': CLOUDFLARE_EMAIL,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    console.log('Upload successful:', response.data);
  } catch (err) {
    console.error('Error uploading to Cloudflare:', err);
    throw err;
  }
}

async function moveFiles() {
  try {
    const files = await listFiles();

    for (const file of files) {
      if (file.Key && file.Key.endsWith('.pdf')) {
        console.log(`Processing file: ${file.Key}`);
        const filePath = await downloadFile(file.Key);
        await uploadFileToCloudflare(filePath);
        fs.unlinkSync(filePath); // Delete file after upload
      }
    }
  } catch (err) {
    console.error('Error moving files:', err);
  }
}

moveFiles();
