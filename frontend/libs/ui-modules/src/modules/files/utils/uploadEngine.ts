import { ApolloClient } from '@apollo/client';
import {
  FILES_UPLOAD_ABORT,
  FILES_UPLOAD_COMPLETE,
  FILES_UPLOAD_RESUME,
  FILES_UPLOAD_SIGN_PARTS,
  FILES_UPLOAD_START,
} from '../graphql/mutations';
import { IFile, IFilesSignedPart, IFilesUploadSession } from '../types';
import { uploadStore } from './uploadStore';

const MAX_PARALLEL_FILES = 3;
const PARTS_PER_FILE = 4;
const PART_ATTEMPTS = 3;
const SIGN_BATCH = 50;
const RESUME_KEY = 'erxes-files-uploads';

type TJob = {
  file: File;
  client: ApolloClient<object>;
  onDone: (file: IFile) => void;
  uploadId?: string;
  requests: Set<XMLHttpRequest>;
  stopped: boolean;
  // A paused run may still be awaiting a mutation; a resume waits for it to settle.
  active: boolean;
};

class UploadStoppedError extends Error {}

const jobs = new Map<string, TJob>();
let running = 0;

// Survives a reload: picking the same file again resumes its session.
const fingerprint = (file: File, target?: string) =>
  `${target || ''}|${file.name}|${file.size}|${file.lastModified}`;

const readResumable = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(RESUME_KEY) || '{}');
  } catch {
    return {};
  }
};

const writeResumable = (key: string, uploadId?: string) => {
  try {
    const saved = readResumable();

    if (uploadId) {
      saved[key] = uploadId;
    } else {
      delete saved[key];
    }

    localStorage.setItem(RESUME_KEY, JSON.stringify(saved));
  } catch {
    // Storage blocked: uploads work but can't resume after a reload.
  }
};

const putBlob = (
  job: TJob,
  url: string,
  body: Blob,
  onProgress: (loaded: number) => void,
  contentType?: string,
) =>
  new Promise<void>((resolve, reject) => {
    if (job.stopped) {
      reject(new UploadStoppedError());
      return;
    }

    const xhr = new XMLHttpRequest();
    job.requests.add(xhr);

    xhr.open('PUT', url);

    if (contentType) {
      xhr.setRequestHeader('Content-Type', contentType);
    }

    xhr.upload.onprogress = (event) => onProgress(event.loaded);
    xhr.onload = () => {
      job.requests.delete(xhr);

      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(body.size);
        resolve();
      } else {
        reject(
          Object.assign(
            new Error(`Storage rejected the upload (${xhr.status})`),
            { status: xhr.status },
          ),
        );
      }
    };
    xhr.onerror = () => {
      job.requests.delete(xhr);
      reject(new Error('Network error while uploading'));
    };
    xhr.onabort = () => {
      job.requests.delete(xhr);
      reject(new UploadStoppedError());
    };

    xhr.send(body);
  });

const signParts = async (job: TJob, uploadId: string, from: number) => {
  const { data } = await job.client.mutate<{
    filesUploadSignParts: IFilesSignedPart[];
  }>({
    mutation: FILES_UPLOAD_SIGN_PARTS,
    variables: { uploadId, from, to: from + SIGN_BATCH - 1 },
  });

  return data?.filesUploadSignParts || [];
};

const uploadParts = async (
  localId: string,
  job: TJob,
  session: { uploadId: string; partSize: number; totalParts: number },
  initialUrls: IFilesSignedPart[],
  done: Set<number>,
) => {
  const urls = new Map(initialUrls.map((p) => [p.partNumber, p.url]));
  const loaded = new Map<number, number>();
  const pending: number[] = [];

  for (let n = 1; n <= session.totalParts; n++) {
    if (!done.has(n)) {
      pending.push(n);
    }
  }

  const partBytes = (n: number) =>
    Math.min(session.partSize, job.file.size - (n - 1) * session.partSize);
  const doneBytes = () => [...done].reduce((sum, n) => sum + partBytes(n), 0);
  const report = () =>
    uploadStore.update(localId, {
      uploadedBytes:
        doneBytes() + [...loaded.values()].reduce((sum, v) => sum + v, 0),
    });

  const urlFor = async (n: number, refresh = false) => {
    if (refresh || !urls.has(n)) {
      for (const part of await signParts(job, session.uploadId, n)) {
        urls.set(part.partNumber, part.url);
      }
    }

    const url = urls.get(n);

    if (!url) {
      throw new Error(`Could not sign part ${n}`);
    }

    return url;
  };

  const uploadOne = async (n: number) => {
    const start = (n - 1) * session.partSize;
    const blob = job.file.slice(start, start + partBytes(n));

    for (let attempt = 1; ; attempt++) {
      try {
        // A 403 usually means the signed URL expired while the part waited.
        const url = await urlFor(n, attempt > 1);

        await putBlob(job, url, blob, (bytes) => {
          loaded.set(n, bytes);
          report();
        });

        loaded.delete(n);
        done.add(n);
        report();
        return;
      } catch (e) {
        loaded.delete(n);

        if (e instanceof UploadStoppedError || attempt >= PART_ATTEMPTS) {
          throw e;
        }

        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
  };

  const worker = async () => {
    while (pending.length) {
      const n = pending.shift();

      if (n !== undefined) {
        await uploadOne(n);
      }
    }
  };

  report();
  await Promise.all(
    Array.from({ length: Math.min(PARTS_PER_FILE, pending.length) }, worker),
  );
};

const resumeSession = async (job: TJob, uploadId: string) => {
  try {
    const { data } = await job.client.mutate<{
      filesUploadResume: {
        uploadId: string;
        partSize: number;
        totalParts: number;
        uploadedPartNumbers: number[];
      };
    }>({ mutation: FILES_UPLOAD_RESUME, variables: { uploadId } });

    return data?.filesUploadResume || null;
  } catch {
    // Expired or already gone: start over.
    return null;
  }
};

const runUpload = async (localId: string, job: TJob) => {
  const item = uploadStore.get(localId);

  if (!item) {
    return;
  }

  const key = fingerprint(job.file, item.replaceFileId || item.folderId);
  uploadStore.update(localId, { status: 'uploading', error: undefined });

  const savedId = job.uploadId || readResumable()[key];
  const resumed = savedId ? await resumeSession(job, savedId) : null;

  if (resumed && resumed.totalParts > 1) {
    job.uploadId = resumed.uploadId;
    await uploadParts(
      localId,
      job,
      resumed,
      [],
      new Set(resumed.uploadedPartNumbers),
    );
  } else {
    if (savedId) {
      writeResumable(key);
    }

    // A single PUT can't resume; abort it so its quota reservation frees now.
    if (resumed) {
      await job.client
        .mutate({
          mutation: FILES_UPLOAD_ABORT,
          variables: { uploadId: resumed.uploadId },
        })
        .catch(() => undefined);
    }

    const contentType = job.file.type || 'application/octet-stream';
    const { data } = await job.client.mutate<{
      filesUploadStart: IFilesUploadSession;
    }>({
      mutation: FILES_UPLOAD_START,
      variables: {
        name: job.file.name,
        size: job.file.size,
        mimeType: contentType,
        folderId: item.folderId,
        replaceFileId: item.replaceFileId,
      },
    });
    const session = data?.filesUploadStart;

    if (!session) {
      throw new Error('Upload could not be started');
    }

    job.uploadId = session.uploadId;
    writeResumable(key, session.uploadId);

    if (session.singleUploadUrl) {
      await putBlob(
        job,
        session.singleUploadUrl,
        job.file,
        (bytes) => uploadStore.update(localId, { uploadedBytes: bytes }),
        contentType,
      );
    } else {
      await uploadParts(localId, job, session, session.parts, new Set());
    }
  }

  uploadStore.update(localId, { status: 'completing' });

  const { data } = await job.client.mutate<{ filesUploadComplete: IFile }>({
    mutation: FILES_UPLOAD_COMPLETE,
    variables: { uploadId: job.uploadId },
  });
  const file = data?.filesUploadComplete;

  if (!file) {
    throw new Error('Upload could not be completed');
  }

  writeResumable(key);
  uploadStore.update(localId, {
    status: 'done',
    uploadedBytes: job.file.size,
    fileId: file._id,
  });
  jobs.delete(localId);
  job.onDone(file);
};

const pump = () => {
  while (running < MAX_PARALLEL_FILES) {
    const next = uploadStore
      .getSnapshot()
      .find(
        (item) =>
          item.status === 'queued' && jobs.get(item.localId)?.active === false,
      );

    if (!next) {
      return;
    }

    const job = jobs.get(next.localId);

    if (!job) {
      return;
    }

    running++;
    job.stopped = false;
    job.active = true;

    runUpload(next.localId, job)
      .catch((e: Error) => {
        if (!(e instanceof UploadStoppedError)) {
          uploadStore.update(next.localId, {
            status: 'failed',
            error: e.message,
          });
        }
      })
      .finally(() => {
        running--;
        job.active = false;
        pump();
      });
  }
};

const stop = (job: TJob) => {
  job.stopped = true;
  job.requests.forEach((xhr) => xhr.abort());
  job.requests.clear();
};

export const uploadEngine = {
  enqueue(
    files: File[],
    {
      folderId,
      replaceFileId,
      client,
      onDone,
    }: {
      folderId?: string;
      replaceFileId?: string;
      client: ApolloClient<object>;
      onDone: (file: IFile) => void;
    },
  ) {
    for (const file of files) {
      const localId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      jobs.set(localId, {
        file,
        client,
        onDone,
        requests: new Set(),
        stopped: false,
        active: false,
      });
      uploadStore.add({
        localId,
        name: file.name,
        size: file.size,
        folderId,
        replaceFileId,
        status: 'queued',
        uploadedBytes: 0,
      });
    }

    pump();
  },

  pause(localId: string) {
    const job = jobs.get(localId);

    if (job) {
      stop(job);
      uploadStore.update(localId, { status: 'paused' });
    }
  },

  resume(localId: string) {
    if (jobs.has(localId)) {
      uploadStore.update(localId, { status: 'queued', error: undefined });
      pump();
    }
  },

  async cancel(localId: string) {
    const job = jobs.get(localId);
    const item = uploadStore.get(localId);

    if (job) {
      stop(job);
      jobs.delete(localId);

      if (item) {
        writeResumable(
          fingerprint(job.file, item.replaceFileId || item.folderId),
        );
      }

      if (job.uploadId) {
        await job.client
          .mutate({
            mutation: FILES_UPLOAD_ABORT,
            variables: { uploadId: job.uploadId },
          })
          .catch(() => undefined);
      }
    }

    uploadStore.remove(localId);
  },
};
