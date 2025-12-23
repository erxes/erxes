import { sendTRPCMessage } from 'erxes-api-shared/utils';

/**
 * Get related content from other plugins via TRPC
 *
 * @param data - Contains contentType and other parameters
 * @param subdomain - Current subdomain
 * @returns Array of related content items
 *
 */
export const getRelatedContent = async (
  data: any,
  subdomain: string,
): Promise<any[]> => {
  const { contentType } = data;

  if (!contentType || typeof contentType !== 'string') {
    console.error('[getRelatedContent] Invalid contentType:', contentType);
    return [];
  }

  // Parse contentType (e.g., "sales:deal" -> ["sales", "deal"])
  const [serviceName, resourceType] = contentType.split(':');

  if (!serviceName || !resourceType) {
    console.error(
      '[getRelatedContent] Invalid contentType format. Expected "plugin:resource", got:',
      contentType,
    );
    return [];
  }

  try {
    // Send TRPC message to target plugin
    const result = await sendTRPCMessage({
      subdomain,
      pluginName: serviceName,
      method: 'query',
      module: 'templates',
      action: 'getRelatedContent',
      input: {
        contentType,
        resourceType,
        subdomain,
        ...data,
      },
      defaultValue: [],
    });

    return result || [];
  } catch (error) {
    console.error(`[getRelatedContent] Error fetching from ${serviceName}:`, {
      subdomain,
      contentType,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return [];
  }
};

/**
 * Get related content from multiple content types in batch
 *
 * @param contentTypes - Array of contentType strings (e.g., ["sales:deal", "content:article"])
 * @param subdomain - Current subdomain
 * @returns Flattened array of all related content
 *
 * @example
 * const allContent = await getRelatedContentsBatch(
 *   ['sales:deal', 'content:article', 'contacts:customer'],
 *   'tenant1'
 * );
 */
export const getRelatedContentsBatch = async (
  contentTypes: string[],
  subdomain: string,
): Promise<any[]> => {
  if (!Array.isArray(contentTypes) || contentTypes.length === 0) {
    console.warn(
      '[getRelatedContentsBatch] Empty or invalid contentTypes array',
    );
    return [];
  }

  try {
    // Fetch from all plugins in parallel
    const results = await Promise.all(
      contentTypes.map((contentType) =>
        getRelatedContent({ contentType }, subdomain),
      ),
    );

    // Flatten all results into single array
    const flattenedResults = results.flat();

    return flattenedResults;
  } catch (error) {
    console.error('[getRelatedContentsBatch] Error:', {
      subdomain,
      contentTypes,
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
};
