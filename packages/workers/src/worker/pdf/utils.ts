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
    if ( ['application/pdf', 'application/octet-stream'].includes(file.mimetype)) {
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
    const filename = body.filename;
    if (!file) {
      return res.status(200).json({ error: 'File is required' });
    }

    const taskId = body.taskId || nanoid();

    const taskData = {
      taskId,
      subdomain,
      filePath: file.path,
      name: file.filename,
      type: 'application/pdf',
      status: 'pending',
      createdAt: new Date(),
    };

    if (body.totalChunks && body.chunkIndex) {
      const chunkIndex = Number(body.chunkIndex);
      const totalChunks = Number(body.totalChunks);
      const chunkDir = path.join(tmpDir.name, taskId);

      const chunkPath = path.join(chunkDir, `pdf_chunk.part_${chunkIndex}`);

      if (!fs.existsSync(chunkDir)) {
        fs.mkdirSync(chunkDir);
      }

      if (chunkIndex === 0) {
        // store task data in redis
        taskData.filePath = path.join(chunkDir, `${taskId}.pdf`);
        await redis.set(`pdf_upload_task_${taskId}`, JSON.stringify(taskData));
      }

      try {
        const fileBuffer = await fs.promises.readFile(req.file.path);

        await fs.promises.writeFile(chunkPath, fileBuffer);
        if (chunkIndex === totalChunks - 1) {
          await handleChunks(taskId, chunkDir, totalChunks);
        }
        return res.status(202).send({ status: 'inprogress', taskId });
      } catch (error) {
        console.error(error);
        return res.status(500).send('Error uploading chunk');
      }
    } else {
      try {
        await redis.set(`pdf_upload_task_${taskId}`, JSON.stringify(taskData));
        await redis.lpush('pdf_upload_queue', taskId);

        res.status(202).json({ success: true, taskId });
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
  writeStream.end();

  // check pdf file is harmful or not

  // push to redis
  await redis.lpush('pdf_upload_queue', taskId);
  console.debug('File chunks merged successfully');
};


export const processPdfTasks = async () => {
  tmp.setGracefulCleanup(); // Call once, outside of the loop

  while (true) {
    const taskId = await redis.rpop('pdf_upload_queue');
    if (!taskId) {
      // If no tasks, wait and continue checking
      await new Promise((resolve) => setTimeout(resolve, 1000)); 
      continue;
    }

    let taskData: any = JSON.parse(
      (await redis.get(`pdf_upload_task_${taskId}`)) || '{}'
    );
    
    taskData.status = 'processing';
    const taskAge = new Date().getTime() - new Date(taskData.createdAt).getTime();

    // Check if task is older than 2 hours, if so, delete it
    if (taskAge > 2 * 60 * 60 * 1000) {
      await redis.del(`pdf_upload_task_${taskId}`);

      if (fs.existsSync(taskData.filePath)) {
        fs.unlinkSync(taskData.filePath); // Delete file if exists
      }

      console.log(`Task ${taskId} is orphaned and deleted.`);
      continue;
    }

    // Save task with updated status back to Redis
    await redis.set(`pdf_upload_task_${taskId}`, JSON.stringify(taskData));

    try {
      // Step 1: Validate Cloudflare config
      await validateCloudflareConfig(taskData.subdomain);

      // Step 2: Upload PDF to Cloudflare
      const pdfUrl = await uploadToCloudflare(
        {
          path: taskData.filePath,
          filename: taskData.name,
          type: taskData.type,
        },
        taskData.subdomain
      );

      // Step 3: Convert images and upload
      const imageDir = tmp.dirSync({ unsafeCleanup: true });
      const imageUrls = await convertAndUploadImages(
        taskData.subdomain,
        taskData.filePath,
        imageDir.name
      );

      // Update task data with result
      taskData.status = 'completed';
      taskData.result = { pdf: pdfUrl, pages: imageUrls };

    } catch (e) {
      console.error(`Error processing task ${taskId}:`, e.message);
      taskData.status = 'failed';
      taskData.error = e.message;
    } finally {
      // Cleanup file after processing
      if (fs.existsSync(taskData.filePath)) {
        fs.unlinkSync(taskData.filePath);
        console.log(`Deleted file for task ${taskId}`);
      }

      // Save final task status to Redis
      await redis.set(`pdf_upload_task_${taskId}`, JSON.stringify(taskData));
    }
  }
};


async function validateCloudflareConfig(subdomain: string) {
  const { uploadServiceType } = config;

  if (!['CLOUDFLARE', 'cloudflare'].includes(uploadServiceType)) {
    throw new Error('Cloudflare not configured');
  }
}

async function convertAndUploadImages(
  subdomain: string,
  pdfPath: string,
  tmpDir: string
) {
  const { useCdn } = config;
  const imagePaths: any = await convertPdfToImage(pdfPath, tmpDir);

  if (!imagePaths.length) {
    throw new Error('No images found');
  }

  const uploadImage = useCdn === 'true' ? uploadToCFImages : uploadToCloudflare;
  return Promise.all(
    imagePaths.map((imagePath) => uploadImage(imagePath, subdomain))
  );
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

  console.debug("******** data ******* ",data);

  if (!data.success) {
    throw new Error('Error uploading file to Cloudflare Images');
  }

  if (data.result.variants.length === 0) {
    throw new Error('Error uploading file to Cloudflare Images');
  }

  return (isPublic && isPublic !== 'false') || VERSION === 'saas'
    ? data.result.variants[0]
    : `${bucketName}/${fileName}`;
};
