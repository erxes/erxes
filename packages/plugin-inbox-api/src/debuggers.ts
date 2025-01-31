import * as debug from "debug";

export const debugExternalRequests = debug(
  "erxes-integrations:external-requests"
);
export const debugBase = debug("erxes-integrations:base");
export const debugError = debug("erxes-integrations:error");

export const debugRequest = (debugInstance, req) =>
  debugInstance(`
        Receiving ${req.path} request from ${req.headers.origin}
        body: ${JSON.stringify(req.body || {})}
        queryParams: ${JSON.stringify(req.query)}
      `);

export const debugResponse = (debugInstance, req, data = "success") =>
  debugInstance(
    `Responding ${req.path} request to ${req.headers.origin} with ${data}`
  );
