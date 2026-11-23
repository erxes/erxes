import type { AgentTemplate, ApiKeyActions, ApiKeyPlugins } from '@erxes/core-contract';
import type { Icon } from '@tabler/icons-react';
import { IconBed, IconFile, IconHeadset, IconMap2, IconShoppingBag } from '@tabler/icons-react';
import type { KeyPlugin } from '../developer/keys/useKeyPlugins';

/** What an admin starts an agent from: its words, the plugin it sells through, what it may read. */
export interface Template {
  id: AgentTemplate | null;
  icon: Icon;
  title: string;
  description: string;
  /** The plugin it needs installed; none for a blank agent. */
  plugin: string | null;
  /** The plugin's actions it may use, by name: what members see, never other customers' records. */
  actions: RegExp | null;
  /** It serves the plugin's website's customers: the new agent starts on its first website. */
  customers: boolean;
  name: string;
  instructions: string;
}

const SELLER = `Answer in the customer's language, in short messages. Never invent prices, stock or dates: look them up, and say so when a lookup fails. Ask one question at a time.`;

export const TEMPLATES: Template[] = [
  {
    id: 'shop',
    icon: IconShoppingBag,
    title: 'Shop sales',
    description: 'Finds products, answers stock and price questions, and takes orders.',
    plugin: 'ecommerce',
    actions: /(^|\.)products\.view$/,
    customers: true,
    name: 'Shop assistant',
    instructions: `You sell for our online shop.

- Find products by what the customer describes, with price and stock.
- Suggest one or two alternatives when an item is out of stock.
- When the customer is signed in, show their orders and place new ones for them. Confirm the items, quantities and total before you place an order.
- For returns and complaints, collect the order number and the problem, then say a person will follow up.

${SELLER}`,
  },
  {
    id: 'hotel',
    icon: IconBed,
    title: 'Hotel booking',
    description: 'Checks rooms and dates, quotes stays, and books them for guests.',
    plugin: 'pms',
    actions: /\.(property|service)\.view$/,
    customers: true,
    name: 'Booking assistant',
    instructions: `You take bookings for our hotel.

- Ask for the dates and the number of guests, then offer the rooms that are free, with the price for the whole stay.
- Describe the room and its services from the property's own details.
- When the guest is signed in, show their bookings and make or cancel one for them. Read back the dates, room and total before you book.

${SELLER}`,
  },
  {
    id: 'tours',
    icon: IconMap2,
    title: 'Tour booking',
    description: 'Matches travellers to tours and departures, and books seats.',
    plugin: 'tms',
    actions: /\.tour\.view$/,
    customers: true,
    name: 'Tour assistant',
    instructions: `You sell our tours.

- Ask where and when the traveller wants to go and how many people come, then offer tours with departures that fit.
- Give the itinerary, what the price includes and the seats left.
- When the traveller is signed in, show their bookings and book seats for them. Read back the tour, date, people and total before you book.

${SELLER}`,
  },
  {
    id: 'support',
    icon: IconHeadset,
    title: 'Support',
    description: 'Answers from the knowledge base and hands the rest to a person.',
    plugin: 'frontline',
    actions: /\.(knowledgebase|help_center)\.view$/,
    customers: false,
    name: 'Support assistant',
    instructions: `You answer customers' questions for our support team.

- Search the knowledge base first and answer from its articles, with a link when there is one.
- When no article answers it, say so plainly and tell the customer a person will reply.
- Never promise refunds, discounts or dates.

Answer in the customer's language, in short messages.`,
  },
  {
    id: null,
    icon: IconFile,
    title: 'Blank',
    description: 'Your own instructions, and the access you choose.',
    plugin: null,
    actions: null,
    customers: false,
    name: '',
    instructions: '',
  },
];

/** The template's access: only the plugin's matching actions, so it reads no one's orders. */
export const templateAccess = (template: Template, plugin: KeyPlugin | undefined) => {
  const plugins: ApiKeyPlugins = {};
  const actions: ApiKeyActions = {};
  const pattern = template.actions;

  const picked = pattern
    ? (plugin?.actions ?? []).filter(({ action }) => pattern.test(action))
    : [];

  if (plugin && picked.length) {
    plugins[plugin.name] = 'write';
    actions[plugin.name] = picked.map(({ action }) => action);
  }

  return { areas: {}, plugins, actions };
};
