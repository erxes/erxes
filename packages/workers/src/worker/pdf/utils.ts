import { getSubdomain } from '@erxes/api-utils/src/core';

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as multer from 'multer';
import * as path from 'path';
import * as tmp from 'tmp';
import { nanoid } from 'nanoid';
import redis from '@erxes/api-utils/src/redis';
import rateLimit from 'express-rate-limit';
import { isImage } from '@erxes/api-utils/src/commonUtils';
import { getFileUploadConfigs } from '../../messageBroker';
import { createCFR2 } from '../../data/utils';
import { randomAlphanumeric } from '@erxes/api-utils/src/random';
import sanitizeFilename from '@erxes/api-utils/src/sanitize-filename';
import * as FormData from 'form-data';


const tmpDir = tmp.dirSync({ unsafeCleanup: true });

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
    if (file.mimetype === 'application/pdf') {
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

    const { file } = req;

    if (!file) {
      return res.status(200).json({ error: 'File is required' });
    }

    const taskId = nanoid();
    console.log('file ', file);
    const taskData = {
      taskId,
      subdomain,
      filePath: file.path,
      name: file.filename,
      type: 'application/pdf',
      status: 'pending',
    };
    console.log(taskData);

    try {
      await redis.set(`pdf_upload_task_${taskId}`, JSON.stringify(taskData));
      await redis.lpush('pdf_upload_queue', taskId);

      res.status(202).json({ success: true, taskId });
    } catch (e) {
      console.error(e.message);

      return res.status(500).json({ error: 'Something went wrong' });
    }
  },
];

export const processPdfTasks = async () => {
  while (true) {
    const taskId = await redis.rpop('pdf_upload_queue');
    if (!taskId) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait if no tasks
      continue;
    }

    const taskData: any = JSON.parse(
      (await redis.get(`pdf_upload_task_${taskId}`)) || '{}'
    );
    taskData.status = 'processing';

    await redis.set(`pdf_upload_task_${taskId}`, JSON.stringify(taskData));

    try {
      await validateCloudflareConfig(taskData.subdomain);

      const pdfUrl = await uploadToCloudflare(
        {
          path: taskData.filePath,
          filename: taskData.name,
          type: taskData.type,
        },
        taskData.subdomain
      );

      const imageDir = tmp.dirSync({ unsafeCleanup: true });

      const imageUrls = await convertAndUploadImages(
        taskData.subdomain,
        taskData.filePath,
        imageDir.name
      );

      taskData.status = 'completed';
      taskData.result = { pdf: pdfUrl, pages: imageUrls };
    } catch (e) {
      console.error(e.message);
      taskData.status = 'failed';
      taskData.error = e.message;
    }

    fs.unlinkSync(taskData.filePath);
    await redis.set(`pdf_upload_task_${taskId}`, JSON.stringify(taskData));
    tmp.setGracefulCleanup();
  }
};

async function validateCloudflareConfig(subdomain: string) {
  const { UPLOAD_SERVICE_TYPE } = await getFileUploadConfigs(subdomain);

  if (UPLOAD_SERVICE_TYPE !== 'CLOUDFLARE') {
    throw new Error('Cloudflare not configured');
  }
}

async function convertAndUploadImages(
  subdomain: string,
  pdfPath: string,
  tmpDir: string
) {
  const { CLOUDFLARE_USE_CDN } = await getFileUploadConfigs(subdomain);
  const imagePaths: any = await convertPdfToImage(pdfPath, tmpDir);
  console.log('imagePaths', imagePaths);
  if (!imagePaths.length) {
    throw new Error('No images found');
  }

  console.log('CLOUDFLARE_USE_CDN', CLOUDFLARE_USE_CDN);

  console.log('imagePaths', imagePaths);

  const uploadImage =
    CLOUDFLARE_USE_CDN === 'true' || CLOUDFLARE_USE_CDN === true
      ? uploadToCFImages
      : uploadToCloudflare;
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

      return {
        type: 'image/jpeg',
        filename: fileName,
        originalname: fileName,
        encoding: '7bit',
        path: `${directory}/${fileName}`,
        size: fs.statSync(`${directory}/${fileName}`).size,
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

  if (taskData.status !== 'completed' && taskData.status !== 'failed') {
    await redis.del(`pdf_upload_task_${taskId}`);
  }

  return res.json({ status: 'removed' });
};

export const uploadToCloudflare = async (
  file: any,
  subdomain
): Promise<string> => {
  const { CLOUDFLARE_BUCKET_NAME, FILE_SYSTEM_PUBLIC } =
    await getFileUploadConfigs(subdomain);
  const fileObj = file;
  console.log('fileObj', fileObj);

  const sanitizedFilename = sanitizeFilename(fileObj.filename);

  if (path.extname(fileObj.filename).toLowerCase() === `.jfif`) {
    fileObj.filename = fileObj.filename.replace('.jfif', '.jpeg');
  }

  // generate unique name
  const fileName = `${randomAlphanumeric()}${sanitizedFilename}`;

  // read fileObj
  const buffer = await fs.readFileSync(fileObj.path);

  // initialize r2
  const r2 = await createCFR2(subdomain);

  // upload to r2

  try {
    const response = await r2
      .upload({
        ContentType: fileObj.type,
        Bucket: CLOUDFLARE_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ACL: FILE_SYSTEM_PUBLIC === 'true' ? 'public-read' : undefined,
      })
      .promise();

    return FILE_SYSTEM_PUBLIC === 'true' ? response.Location : fileName;
  } catch (err) {
    throw new Error('Failed to upload to R2: ' + err.message);
  }
};

const uploadToCFImages = async (file: any, subdomain: string) => {
  console.log('uploadToCFImages', file);
  const sanitizedFilename = sanitizeFilename(file.filename);
  const {
    CLOUDFLARE_BUCKET_NAME,
    FILE_SYSTEM_PUBLIC,
    CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_API_TOKEN,
  } = await getFileUploadConfigs(subdomain);

  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`;

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

  formData.append('id', `${CLOUDFLARE_BUCKET_NAME}/${fileName}`);

  const headers = {
    Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
    ...formData.getHeaders(),
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data: any = await response.json();
  console.log('data', data);

  if (!data.success) {
    throw new Error('Error uploading file to Cloudflare Images');
  }

  if (data.result.variants.length === 0) {
    throw new Error('Error uploading file to Cloudflare Images');
  }

  try {
    fs.unlinkSync(file.path);
    console.debug('file deleted', file.path);
  } catch (err) {
    console.error('error while deleting file', err);
  }
  tmp.setGracefulCleanup();

  return FILE_SYSTEM_PUBLIC && FILE_SYSTEM_PUBLIC !== 'false'
    ? data.result.variants[0]
    : `${CLOUDFLARE_BUCKET_NAME}/${fileName}`;
};
