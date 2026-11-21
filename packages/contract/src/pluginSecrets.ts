import { oc } from '@orpc/contract';
import { z } from 'zod';
import { COMMON_ERRORS } from './errors';

export const PLUGIN_SECRET_JSON_MAX = 8192;

export const PLUGIN_SEALED_MAX = 33_000;

const Values = z.record(z.string(), z.unknown());

const base = oc.errors(COMMON_ERRORS);

export const pluginSecretsContract = {
  seal: base
    .route({
      method: 'POST',
      path: '/plugin/secrets/seal',
      summary: `Seals values (at most ${PLUGIN_SECRET_JSON_MAX} characters of JSON) with core's key for this organisation and plugin. Core stores nothing: the plugin keeps the sealed text and opens it with open`,
    })
    .input(
      z.object({
        values: Values.refine(
          (value) => JSON.stringify(value).length <= PLUGIN_SECRET_JSON_MAX,
          `at most ${PLUGIN_SECRET_JSON_MAX} characters of JSON`,
        ),
      }),
    )
    .output(z.object({ sealed: z.string() })),
  open: base
    .route({
      method: 'POST',
      path: '/plugin/secrets/open',
      summary:
        'Opens what seal answered. 400 INVALID_INPUT when it was sealed for another organisation or plugin, or changed',
    })
    .input(z.object({ sealed: z.string().max(PLUGIN_SEALED_MAX) }))
    .output(z.object({ values: Values })),
};
