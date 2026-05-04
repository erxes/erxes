import { splitType } from 'erxes-api-shared/core-modules';
import { generateModels, IModels } from '~/connectionResolvers';
import { debugError } from '@/inbox/utils';
import { AfterProcessModules } from 'erxes-api-shared/utils';

function getModuleAndCollectionType(contentType: string): {
  moduleName: string;
  collectionType: string;
} | null {
  const [_, moduleName, collectionType] = splitType(contentType);
  if (!moduleName || !collectionType) {
    return null;
  }
  return { moduleName, collectionType };
}

async function executeHandler(
  handler: (...args: any[]) => Promise<void>,
  args: any[],
  contentType: string,
): Promise<void> {
  try {
    await handler(...args);
  } catch (error) {
    debugError(
      `Error in afterProcess handler for ${contentType}:`,
      error instanceof Error ? error : new Error(String(error)),
    );
  }
}

export function createAfterDocumentCreatedHandler(
  afterProcessModules: AfterProcessModules<IModels>,
) {
  return async ({ subdomain }: { subdomain: string }, { contentType, ...data }: any) => {
    const parsed = getModuleAndCollectionType(contentType);
    if (!parsed) {
      debugError(`Invalid contentType format: ${contentType}`);
      return;
    }

    const { moduleName, collectionType } = parsed;
    const module = afterProcessModules[moduleName];
    const handler = module?.createdDocument?.[collectionType];

    if (!handler) {
      return;
    }

    const models = await generateModels(subdomain);
    await executeHandler(handler, [models, data], contentType);
  };
}

export function createAfterDocumentUpdatedHandler(
  afterProcessModules: AfterProcessModules<IModels>,
) {
  return async ({ subdomain }: { subdomain: string }, { contentType, ...data }: any) => {
    const parsed = getModuleAndCollectionType(contentType);
    if (!parsed) {
      debugError(`Invalid contentType format: ${contentType}`);
      return;
    }

    const { moduleName, collectionType } = parsed;
    const module = afterProcessModules[moduleName];
    const handler = module?.updatedDocument?.[collectionType];

    if (!handler) {
      debugError(`No afterProcess handler found for ${contentType}`);
      return;
    }

    try {
      const models = await generateModels(subdomain);
      await executeHandler(handler, [subdomain, models, data], contentType);
    } catch (error) {
      debugError(
        error instanceof Error ? error.message : String(error),
      );
    }
  };
}

