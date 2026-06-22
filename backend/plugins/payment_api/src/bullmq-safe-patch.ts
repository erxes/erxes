import { Queue } from 'bullmq';

const originalAdd = Queue.prototype.add;

(Queue.prototype as any).add = function (name: string, data: any, opts?: any) {
  // Only sanitize log jobs — they carry the dangerous payload
  if (this.name === 'logs-put_log' && data && data.payload) {
    try {
      // Use JSON.stringify with a replacer that removes circulars and Node.js internals
      const safePayload = JSON.parse(
        JSON.stringify(data.payload, (key, value) => {
          if (typeof value === 'object' && value !== null) {
            // Node.js internal objects that cause circulars
            if (
              value.constructor?.name === 'Socket' ||
              value.constructor?.name === 'IncomingMessage' ||
              value.constructor?.name === 'ServerResponse'
            ) {
              return '[Node.js internal object]';
            }
            // Break known circular paths: req.res, res.req, socket.parser, etc.
            if (key === 'req' || key === 'res' || key === 'socket' || key === 'parser') {
              return '[Circular]';
            }
          }
          return value;
        })
      );
      data = { ...data, payload: safePayload };
    } catch {
      // If sanitising fails, send the original data — the earlier bullmq patch will still catch it
    }
  }
  return originalAdd.call(this, name, data, opts);
};

