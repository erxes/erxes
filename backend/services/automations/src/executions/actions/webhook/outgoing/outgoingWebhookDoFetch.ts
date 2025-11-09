export const outgoingWebhookDoFetch = async ({
  currentUrl,
  method,
  headersObj,
  requestBody,
  followRedirect,
  maxRedirects,
  agent,
  controller,
}: {
  currentUrl: URL;
  method: string;
  headersObj: Record<string, string>;
  requestBody: any;
  followRedirect: boolean;
  maxRedirects: number;
  agent: any;
  controller: AbortController;
}): Promise<Response> => {
  const res = await fetch(currentUrl.toString(), {
    method,
    headers: headersObj,
    body: method === 'GET' || method === 'HEAD' ? undefined : requestBody,
    redirect: followRedirect ? 'follow' : 'manual',
    // @ts-ignore
    agent,
    signal: controller.signal,
  }).catch((e) => {
    console.log('error', e);
    throw e;
  });

  // Manual redirect handling when follow disabled but maxRedirects > 0
  let redirects = 0;
  let response = res;
  while (
    !followRedirect &&
    response.status >= 300 &&
    response.status < 400 &&
    redirects < maxRedirects
  ) {
    const loc = response.headers.get('location');
    if (!loc) break;
    currentUrl = new URL(loc, currentUrl);
    response = await fetch(currentUrl.toString(), {
      method,
      headers: headersObj,
      body: method === 'GET' || method === 'HEAD' ? undefined : requestBody,
      // @ts-ignore
      agent,
      signal: controller.signal,
    });
    redirects += 1;
  }

  return response;
};
