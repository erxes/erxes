import { z } from 'zod';

export const parseViberMediaHostnames = (text: string): string[] => [
  ...new Set(
    text
      .split(/[,\n]/)
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
  ),
];

// Mirrors Frontline API validation for immediate feedback. The API is authoritative.
export const viberMediaSettingsSchema = z.object({
  hostnames: z
    .string()
    .max(8192, 'Enter at most 32 media hostnames.')
    .superRefine((text, context) => {
      const hostnames = parseViberMediaHostnames(text);
      if (hostnames.length > 32) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter at most 32 media hostnames.',
        });
        return;
      }
      if (
        hostnames.some((hostname) => {
          const labels = hostname.split('.');
          return (
            hostname.length > 253 ||
            labels.length < 2 ||
            !labels.every((label) =>
              /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label),
            ) ||
            !/^[a-z][a-z0-9-]*$/.test(labels[labels.length - 1]) ||
            /\.(localhost|local|internal|lan|home|arpa)$/.test(hostname)
          );
        })
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter exact public hostnames, without URLs or wildcards.',
        });
      }
    }),
});
