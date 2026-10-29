import { z } from 'zod';

export const LDAP_CONFIG_SCHEMA = z
  .object({
    enabled: z.boolean(),
    serverType: z.enum(['activeDirectory', 'openLdap']),
    url: z.string().trim(),
    startTls: z.boolean(),
    bindDn: z.string().trim(),
    bindPassword: z.string(),
    hasBindPassword: z.boolean(),
    baseDn: z.string().trim(),
    loginAttribute: z.string().trim(),
    userFilter: z.string().trim(),
    allowedGroupDns: z.array(z.string()),
    linkEmailDomains: z.array(z.string()),
    groupMappings: z.array(
      z.object({
        groupDn: z.string().trim().min(1, 'Group DN is required'),
        permissionGroupIds: z.array(z.string()),
      }),
    ),
  })
  .superRefine((values, ctx) => {
    if (values.url && !/^ldaps?:\/\//.test(values.url)) {
      ctx.addIssue({
        code: 'custom',
        path: ['url'],
        message: 'Url must start with ldaps:// or ldap://',
      });
    }

    if (values.url.startsWith('ldap://') && !values.startTls) {
      ctx.addIssue({
        code: 'custom',
        path: ['startTls'],
        message: 'Enable StartTLS or use an ldaps:// url',
      });
    }

    if (!values.enabled) return;

    (['url', 'bindDn', 'baseDn', 'loginAttribute'] as const).forEach((key) => {
      if (!values[key]) {
        ctx.addIssue({ code: 'custom', path: [key], message: 'Required' });
      }
    });

    if (!values.bindPassword && !values.hasBindPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['bindPassword'],
        message: 'Required',
      });
    }
  });

export type TLdapConfigForm = z.infer<typeof LDAP_CONFIG_SCHEMA>;
