import { sendWorkerQueue } from '../mq-worker';

export const sendLogMessage = async ({
  subdomain,
  source,
  status,
  contentType,
  payload,
}: {
  subdomain: string;
  source: string;
  status: string;
  contentType: string;
  payload: any;
}) => {
  sendWorkerQueue('logs', 'put_log').add('put_log', {
    subdomain,
    source,
    status,
    contentType,
    payload,
  });

  if (source === 'mongo') {
    sendWorkerQueue('logs', 'activity_log').add('process', {
      subdomain,
      source,
      status,
      contentType,
      payload,
    });
  }
};
