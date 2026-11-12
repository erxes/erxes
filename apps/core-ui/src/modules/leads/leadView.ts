import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type LeadView = "table" | "board";

/** Table or board for the lead lists, remembered in this browser. */
const leadViewAtom = atomWithStorage<LeadView>("erxes_leads_view", "table");

export const useLeadView = () => useAtom(leadViewAtom);
