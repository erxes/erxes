import { z } from 'zod';

/**
 * A JSON string that decodes to `schema`: `jsonOf(schema).safeParse(text)` fails
 * on text that isn't JSON the same way it fails on JSON of the wrong shape.
 */
export const jsonOf = <S extends z.ZodType>(schema: S) =>
  z
    .string()
    .transform((text, ctx) => {
      try {
        const value: unknown = JSON.parse(text);

        return value;
      } catch {
        ctx.addIssue({ code: 'custom', message: 'Not JSON' });

        return z.NEVER;
      }
    })
    .pipe(schema);
