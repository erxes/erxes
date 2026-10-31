import { graphqlPubsub } from 'erxes-api-shared/utils';
import debug from 'debug';

const debugReportError = debug('erxes:reports:error');

export const REPORT_SCOPES = [
  'inbox',
  'ticket',
  'facebook',
  'call',
  'charts',
] as const;
export type ReportScope = (typeof REPORT_SCOPES)[number];
const PUBLISH_TIMEOUT_MS = 1000;

export const publishReportUpdate = async (
  subdomain: string,
  scopes: readonly ReportScope[] = REPORT_SCOPES,
): Promise<void> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      graphqlPubsub.publish(`frontlineReportsChanged:${subdomain}`, {
        frontlineReportsChanged: { scopes: [...new Set(scopes)] },
      }),
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(
          () => reject(new Error('Report update publish timed out')),
          PUBLISH_TIMEOUT_MS,
        );
      }),
    ]);
  } catch (error) {
    debugReportError(`Failed to publish report update: ${String(error)}`);
  } finally {
    if (timer) clearTimeout(timer);
  }
};
