import Imap from 'node-imap';
import { IIntegrationImapDocument } from '@/integrations/imap/models';

export const toUpper = (thing: any): any => {
  return thing && thing.toUpperCase ? thing.toUpperCase() : thing;
};

export const findAttachmentParts = (
  struct: any[],
  attachments: any[] = [],
): any[] => {
  for (let i = 0, len = struct.length, _r: any; i < len; ++i) {
    if (Array.isArray(struct[i])) {
      findAttachmentParts(struct[i], attachments);
    } else {
      if (
        struct[i].disposition &&
        ['INLINE', 'ATTACHMENT'].indexOf(toUpper(struct[i].disposition.type)) >
          -1
      ) {
        attachments.push(struct[i]);
      }
    }
  }
  return attachments;
};

export const createImap = (integration: IIntegrationImapDocument): Imap => {
  return new Imap({
    user: integration.mainUser || integration.user,
    password: integration.password,
    host: integration.host,
    keepalive: { forceNoop: true },
    port: 993,
    tls: true,
  });
};
