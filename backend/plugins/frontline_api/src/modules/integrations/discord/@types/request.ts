export type TDiscordRequestArgs = {
  token: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  form?: FormData;
};

export type TDiscordErrorBody = {
  message?: string;
  code?: number;
  retry_after?: number;
};
