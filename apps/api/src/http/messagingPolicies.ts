import { MEMBER, needs, PUBLIC } from './policyRules';

/** Email sending, broadcasts and suppressions: their part of the access map (`ACCESS` in `./policies`). */
export const MESSAGING_ACCESS = {
  'emails.send': { plugin: 'emails:write' },
  'sms.send': { plugin: 'sms:write' },
  'emails.settings': needs('integrations.manage'),
  'emails.saveSettings': needs('integrations.manage'),
  'emails.removeSettings': needs('integrations.manage'),
  'emails.sendTest': needs('integrations.manage'),
  'emails.checkDomains': needs('integrations.manage'),
  // Read by the broadcast and automation editors, for the From and the Reply-To picker.
  'emails.sender': MEMBER,
  'emails.replyTos': MEMBER,
  'emails.addReplyTo': needs('integrations.manage'),
  'emails.removeReplyTo': needs('integrations.manage'),
  'emails.confirmReplyTo': PUBLIC,
  // Who was emailed what: for those who manage how the organisation sends.
  'emails.deliveries': needs('integrations.manage'),
  'emails.addresses': needs('integrations.manage'),
  'emails.limits': needs('integrations.manage'),
  'emails.resumeSending': needs('integrations.manage'),
  'emails.setRamp': needs('integrations.manage'),
  // A broadcast's page says when its emails are held.
  'emails.pacing': MEMBER,

  // Templates are what broadcasts are written from: their readers use them, their writers keep them.
  'emailTemplates.list': needs('broadcasts.view'),
  'emailTemplates.get': needs('broadcasts.view'),
  'emailTemplates.create': needs('broadcasts.manage'),
  'emailTemplates.update': needs('broadcasts.manage'),
  'emailTemplates.remove': needs('broadcasts.manage'),

  'broadcasts.list': needs('broadcasts.view'),
  'broadcasts.get': needs('broadcasts.view'),
  'broadcasts.recipients': needs('broadcasts.view'),
  // An estimate and a preview read customers through the audience, like the list does.
  'broadcasts.audience': needs('broadcasts.view'),
  'broadcasts.preview': needs('broadcasts.view'),
  'broadcasts.create': needs('broadcasts.manage'),
  'broadcasts.update': needs('broadcasts.manage'),
  'broadcasts.remove': needs('broadcasts.manage'),
  'broadcasts.duplicate': needs('broadcasts.manage'),
  'broadcasts.test': needs('broadcasts.manage'),
  'broadcasts.send': needs('broadcasts.send'),
  'broadcasts.schedule': needs('broadcasts.send'),
  'broadcasts.unschedule': needs('broadcasts.send'),
  'broadcasts.pause': needs('broadcasts.send'),
  'broadcasts.resume': needs('broadcasts.send'),
  'broadcasts.cancel': needs('broadcasts.send'),
  'broadcastSchedules.get': needs('broadcasts.view'),
  'broadcastSchedules.preview': needs('broadcasts.view'),
  'broadcastSchedules.upcoming': needs('broadcasts.view'),
  'broadcastSchedules.save': needs('broadcasts.manage'),
  'broadcastSchedules.start': needs('broadcasts.send'),
  'broadcastSchedules.pause': needs('broadcasts.send'),
  'broadcastSchedules.resume': needs('broadcasts.send'),
  'broadcastSchedules.stop': needs('broadcasts.send'),
  'suppressions.list': needs('broadcasts.view'),
  'suppressions.add': needs('broadcasts.manage'),
  'suppressions.remove': needs('broadcasts.manage'),
} as const;
