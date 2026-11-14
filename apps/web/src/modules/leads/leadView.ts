import { stored } from 'erxes-ui';
import { useAtom } from 'jotai';
import { z } from 'zod';

const LEAD_VIEWS = ['table', 'board'] as const;

const LeadView = z.enum(LEAD_VIEWS);

/** Table or board for the lead lists, remembered in this browser. */
const leadViewAtom = stored({ key: 'erxes:leads:view', schema: LeadView, initial: 'table' });

export const useLeadView = () => useAtom(leadViewAtom);
