/** One example person: a customer, or a lead when `stage` is set. */
interface Person {
  first: string;
  last: string;
  email: string;
  phone: string;
  position: string;
  /** A customer, or a lead at stage N (0 = the first open one). */
  stage?: number;
  company?: number;
  role?: string;
  mainContact?: boolean;
  vip?: boolean;
  plan?: number;
  renewalInDays?: number;
  birthDate?: string;
  source?: string;
  /** Why a disqualified lead was let go. */
  reason?: string;
  note?: string;
}

/** The example data's text in one language. */
export interface ExampleCopy {
  tags: { example: string; vip: string; partner: string };
  plan: { label: string; options: string[] };
  renewal: string;
  vipView: string;
  automation: { name: string; description: string };
  companies: { name: string; industry: string; website: string; size: number; partner?: boolean }[];
  people: Person[];
}
