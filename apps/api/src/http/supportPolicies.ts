import { MEMBER, needs } from './policyRules';

/**
 * erxes support's visits in the access map (`./policies`): owners turn support access on or
 * off, see each visit and end one (Settings › Support access); no plugin or API key reaches them.
 */
export const SUPPORT_ACCESS = {
  'supportAccess.settings': needs('support.manage'),
  'supportAccess.updateSettings': needs('support.manage'),
  'supportAccess.visits': needs('support.manage'),
  'supportAccess.endVisit': needs('support.manage'),
  // The banner: owners see every visit in progress, erxes support its own (`activeVisits`).
  'supportAccess.active': MEMBER,
} as const;
