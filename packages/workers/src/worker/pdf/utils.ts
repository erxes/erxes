import { getEnv, getSubdomain } from '@erxes/api-utils/src/core';

import { isImage } from '@erxes/api-utils/src/commonUtils';
import redis from '@erxes/api-utils/src/redis';
import { execSync } from 'child_process';
import rateLimit from 'express-rate-limit';
import * as fs from 'fs';
import * as multer from 'multer';
import { nanoid } from 'nanoid';
import * as path from 'path';
import * as tmp from 'tmp';

import { randomAlphanumeric } from '@erxes/api-utils/src/random';
import sanitizeFilename from '@erxes/api-utils/src/sanitize-filename';
import * as AWS from 'aws-sdk';
import * as FormData from 'form-data';
import fetch from 'node-fetch';

const tmpDir = tmp.dirSync({ unsafeCleanup: true });
const config = {
  uploadServiceType: getEnv({ name: 'UPLOAD_SERVICE_TYPE' }),
  bucketName: getEnv({ name: 'CLOUDFLARE_BUCKET_NAME' }),
  accountId: getEnv({ name: 'CLOUDFLARE_ACCOUNT_ID' }),
  accessKeyId: getEnv({ name: 'CLOUDFLARE_ACCESS_KEY_ID' }),
  secretAccessKey: getEnv({ name: 'CLOUDFLARE_SECRET_ACCESS_KEY' }),
  apiToken: getEnv({ name: 'CLOUDFLARE_API_TOKEN' }),
  useCdn: getEnv({ name: 'CLOUDFLARE_USE_CDN' }),
  isPublic: getEnv({ name: 'FILE_SYSTEM_PUBLIC' }),
};

export const uploadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // limit to 5 requests per IP
  message: 'Too many upload requests, please try again later',
  legacyHeaders: false,
});

const upload = multer({
  dest: tmpDir.name,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter: (_req, file, cb) => {
    // Check the file type (MIME type)
    if (
      ['application/pdf', 'application/octet-stream'].includes(file.mimetype)
    ) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Only PDF files are allowed!')); // Reject other file types
    }
  },
});

export const pdfUploader = [
  upload.single('file'),
  async (req, res) => {
    if (!req.user) {
      return res.status(401).send('Unauthorized');
    }

    const subdomain = getSubdomain(req);

    const { file, body } = req;
    const filename = sanitizeFilename(body.filename);
    if (!file) {
      return res.status(200).json({ error: 'File is required' });
    }

    const taskId = body.taskId || nanoid();

    const taskData = {
      taskId,
      subdomain,
      filePath: file.path,
      name: filename,
      type: 'application/pdf',
      status: 'pending',
      createdAt: new Date(),
    };

    const fileDir = path.join(tmpDir.name, taskId);
    console.debug('pdf directory', fileDir);
    if (!fs.existsSync(fileDir)) {
      console.debug("Creating directory", fileDir);
      fs.mkdirSync(fileDir);
    }

    if (body.totalChunks && body.chunkIndex) {
      const chunkIndex = Number(body.chunkIndex);
      const totalChunks = Number(body.totalChunks);

      const chunkPath = path.join(fileDir, `pdf_chunk.part_${chunkIndex}`);

      try {
        const fileBuffer = await fs.promises.readFile(req.file.path);
        await fs.promises.writeFile(chunkPath, fileBuffer);

        if (chunkIndex === totalChunks - 1) {
          await handleChunks(taskId, fileDir, totalChunks);

          // create task data in redis
          taskData.filePath = path.join(fileDir, `${taskId}.pdf`);
          await redis.set(
            `pdf_upload_task_${taskId}`,
            JSON.stringify(taskData)
          );
          // await redis.lpush('pdf_upload_queue', taskId);

          processPdf(taskId);
          return res.status(202).send({ status: 'processing' });
        }
        return res.status(200).send({ status: 'uploading', taskId });
      } catch (error) {
        console.error(error);
        return res.status(500).send('Error uploading chunk');
      }
    } else {
      try {
        await redis.set(`pdf_upload_task_${taskId}`, JSON.stringify(taskData));
        processPdf(taskId);
        return res.status(202).send({ status: 'processing', taskId });
      } catch (e) {
        console.error(e.message);
        return res.status(500).json({ error: 'Something went wrong' });
      }
    }
  },
];

const handleChunks = async (taskId, chunkDir, totalChunks) => {
  const writeStream = fs.createWriteStream(
    path.join(chunkDir, `${taskId}.pdf`)
  );

  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = path.join(chunkDir, `pdf_chunk.part_${i}`);
    const chunk = await fs.promises.readFile(chunkPath);
    writeStream.write(chunk);
    fs.unlinkSync(chunkPath);
  }

  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
    writeStream.end();
  });

  console.debug('Chunks merged successfully', chunkDir);
};

const processPdf = async (taskId) => {
  // const taskData = await redis.get(`pdf_upload_task_${taskId}`);
  let taskData: any = JSON.parse(
    (await redis.get(`pdf_upload_task_${taskId}`)) || '{}'
  );
  if (!taskData || !taskData.taskId) {
    return;
  }

  console.debug('Processing task', taskData);

  const taskAge = new Date().getTime() - new Date(taskData.createdAt).getTime();

  // Check if task is older than 2 hours, if so, delete it
  if (taskAge > 2 * 60 * 60 * 1000) {
    await redis.del(`pdf_upload_task_${taskId}`);

    if (fs.existsSync(taskData.filePath)) {
      fs.unlinkSync(taskData.filePath); // Delete file if exists
    }

    console.debug(`Task ${taskId} is orphaned and deleted.`);
    return;
  }

  const imageDir = tmp.dirSync({ unsafeCleanup: true });
  console.debug('Creating directory for images', imageDir.name);

  const imagePaths: any = await convertPdfToImage(
    taskData.filePath,
    imageDir.name
  );

  if (!imagePaths.length) {
    throw new Error('No images found');
  }

  validateCloudflareConfig();

  const uploadImage =
    config.useCdn === 'true' ? uploadToCFImages : uploadToCloudflare;

  const imageUrls: any = [];
  taskData.status = 'uploading';
  taskData.progress = 0; // Initialize progress
  await redis.set(`pdf_upload_task_${taskId}`, JSON.stringify(taskData));

  for (let i = 0; i < imagePaths.length; i++) {
    const imagePath = imagePaths[i];
    try {
      const imageUrl = await uploadImage(imagePath, taskData.subdomain);
      imageUrls.push(imageUrl);

      // Update progress
      taskData.progress = Math.round(((i + 1) / imagePaths.length) * 100);
      taskData.pdfAttachment = { pages: imageUrls };
      await redis.set(`pdf_upload_task_${taskId}`, JSON.stringify(taskData));
    } catch (error) {
      console.error(`Error uploading image ${i + 1}:`, error.message);
    }
  }

  taskData.status = 'completed';
  taskData.progress = 100;
  taskData.result = { pdf: undefined, pages: imageUrls };
  await redis.set(`pdf_upload_task_${taskId}`, JSON.stringify(taskData));

  console.debug('Task completed', taskData);
  if (fs.existsSync(taskData.filePath)) {
    fs.unlinkSync(taskData.filePath); // Delete file if exists
  }
};

function validateCloudflareConfig() {
  const { uploadServiceType } = config;

  if (!['CLOUDFLARE', 'cloudflare'].includes(uploadServiceType)) {
    throw new Error('Cloudflare not configured');
  }
}

const convertPdfToImage = async (pdfFilePath: string, directory: string) => {
  const options = {
    format: 'jpeg',
    out_dir: directory,
    out_prefix: 'page',
    page: null,
  };

  try {
    // Convert PDF to images (Poppler automatically handles this)
    execSync(
      `pdftoppm -jpeg -r 150 ${pdfFilePath} ${path.join(
        options.out_dir,
        options.out_prefix
      )}`
    );
    // Collect all images from the directory
    const files = await fs.readdirSync(directory).map((fileName) => {
      if (!isImage(fileName)) {
        return;
      }

      const filePath = path.join(directory, fileName);
      const size = fs.statSync(`${directory}/${fileName}`).size;

      return {
        type: 'image/jpeg',
        filename: fileName,
        originalname: fileName,
        encoding: '7bit',
        path: filePath,
        size,
        mimetype: 'image/jpeg',
        destination: directory,
        name: fileName,
      };
    });

    return files.filter((f) => !!f);
  } catch (error) {
    console.error('Error during PDF to image conversion:', error);
    throw error;
  }
};

export const taskChecker = async (req, res) => {
  const taskId = req.params.taskId;
  const taskData = JSON.parse(
    (await redis.get(`pdf_upload_task_${taskId}`)) || '{}'
  );

  const result = {
    status: taskData.status,
    progress: taskData.progress,
    data: taskData.result,
    error: taskData.error,
    filename: taskData.name,
  };

  return res.json(result);
};

export const taskRemover = async (req, res) => {
  if (!req.user) {
    return res.status(401).send('Unauthorized');
  }
  const taskId = req.params.taskId;
  const taskData = JSON.parse(
    (await redis.get(`pdf_upload_task_${taskId}`)) || '{}'
  );

  if (taskData.status === 'completed' && taskData.status === 'failed') {
    await redis.del(`pdf_upload_task_${taskId}`);
  }

  return res.json({ status: 'removed' });
};

export const uploadToCloudflare = async (
  file: any,
  subdomain
): Promise<string> => {
  const { bucketName, isPublic } = config;
  const fileObj = file;

  const sanitizedFilename = sanitizeFilename(fileObj.filename);

  if (path.extname(fileObj.filename).toLowerCase() === `.jfif`) {
    fileObj.filename = fileObj.filename.replace('.jfif', '.jpeg');
  }

  // generate unique name
  const fileName = `${randomAlphanumeric()}${sanitizedFilename}`;

  // read fileObj
  const buffer = await fs.readFileSync(fileObj.path);

  // initialize r2
  const endpoint = `https://${config.accountId}.r2.cloudflarestorage.com`;
  const r2Config = {
    endpoint,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    signatureVersion: 'v4',
    region: 'auto',
  };

  const r2 = new AWS.S3(r2Config);

  // upload to r2

  try {
    const response = await r2
      .upload({
        ContentType: fileObj.type,
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ACL: isPublic === 'true' ? 'public-read' : undefined,
      })
      .promise();

    fs.unlinkSync(fileObj.path);

    return isPublic === 'true' ? response.Location : fileName;
  } catch (err) {
    throw new Error('Failed to upload to R2: ' + err.message);
  }
};

export const uploadToCFImages = async (file: any, subdomain?: string) => {
  const sanitizedFilename = sanitizeFilename(file.filename);
  const { bucketName, isPublic, accountId, apiToken } = config;

  const VERSION = getEnv({ name: 'VERSION' });

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`;

  let fileName = `${randomAlphanumeric()}${sanitizedFilename}`;
  const extension = fileName.split('.').pop();

  if (extension && ['JPEG', 'JPG', 'PNG'].includes(extension)) {
    const baseName = fileName.slice(0, -(extension.length + 1));
    fileName = `${baseName}.${extension.toLowerCase()}`;
  }

  if (!fs.existsSync(file.path)) {
    console.error(`File not found: ${file.path}`);
    throw new Error('File not found');
  }

  const formData = new FormData();

  formData.append('file', fs.createReadStream(file.path));

  formData.append('id', `${bucketName}/${fileName}`);

  const headers = {
    Authorization: `Bearer ${apiToken}`,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data: any = await response.json();

  console.debug('******** data ******* ', data);

  if (!data.success) {
    throw new Error('Error uploading file to Cloudflare Images');
  }

  if (data.result.variants.length === 0) {
    throw new Error('Error uploading file to Cloudflare Images');
  }

  fs.unlinkSync(file.path);

  return (isPublic && isPublic !== 'false') || VERSION === 'saas'
    ? data.result.variants[0]
    : `${bucketName}/${fileName}`;
};
