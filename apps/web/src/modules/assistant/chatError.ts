import { isApiError } from '@erxes/core-contract/client';
import { createORPCErrorFromJson, isORPCErrorJson } from '@orpc/client';
import { jsonOf } from 'erxes-ui';
import { z } from 'zod';

const Body = jsonOf(z.unknown());

export const chatErrorOf = (error: Error) => {
  const body = Body.safeParse(error.message).data;

  return isORPCErrorJson(body) ? createORPCErrorFromJson(body) : error;
};

export const needsKey = (error: unknown) =>
  isApiError(error, 'ASSISTANT_NO_CONNECTION') || isApiError(error, 'ASSISTANT_KEY_UNREADABLE');
