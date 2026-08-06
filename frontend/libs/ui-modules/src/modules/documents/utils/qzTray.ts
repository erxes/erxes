import qz from 'qz-tray';

let connectingPromise: Promise<void> | null = null;

const isBrowser = () => typeof globalThis.window !== 'undefined';

export const isQzActive = () => {
  if (!isBrowser()) {
    return false;
  }

  try {
    return qz.websocket.isActive();
  } catch {
    return false;
  }
};

export const connectQz = async (): Promise<void> => {
  if (!isBrowser()) {
    throw new Error('QZ Tray can only be used in the browser');
  }

  if (isQzActive()) {
    return;
  }

  if (connectingPromise) {
    return connectingPromise;
  }

  connectingPromise = qz.websocket
    .connect({ retries: 1, delay: 1 })
    .then(() => undefined)
    .finally(() => {
      connectingPromise = null;
    });

  return connectingPromise;
};

export const ensureQzConnected = async () => {
  try {
    await connectQz();
    return true;
  } catch {
    return false;
  }
};

export const findQzPrinters = async (): Promise<string[]> => {
  if (!isBrowser()) {
    return [];
  }

  if (!isQzActive()) {
    await connectQz();
  }

  const result = await qz.printers.find();

  if (Array.isArray(result)) {
    return result;
  }

  return typeof result === 'string' ? [result] : [];
};

export const printPagesToQz = async ({
  printer,
  pages,
}: {
  printer: string;
  pages: string[];
}) => {
  if (!printer) {
    throw new Error('Printer is not selected');
  }

  if (!pages.length) {
    throw new Error('Nothing to print');
  }

  if (!isQzActive()) {
    await connectQz();
  }

  const config = qz.configs.create(printer);

  await qz.print(
    config,
    pages.map((data) => ({
      type: 'pixel',
      format: 'html',
      flavor: 'plain',
      data,
    })),
  );
};

export const QZ_NOT_RUNNING_MESSAGE =
  'QZ Tray is not running. Falling back to the browser print dialog.';
