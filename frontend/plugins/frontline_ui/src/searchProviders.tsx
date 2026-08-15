import {
  IconForms,
  IconInbox,
  IconMail,
  IconTicket,
} from '@tabler/icons-react';
import {
  defineSearchProvider,
  getPersonName,
  ISearchProvider,
  readCursorList,
  stripHtml,
} from 'erxes-ui';

const UNNAMED = 'Unnamed';

type TConversationNode = {
  _id: string;
  content?: string | null;
  customer?: {
    _id: string;
    firstName?: string | null;
    lastName?: string | null;
    primaryEmail?: string | null;
  } | null;
};

const conversationsSearchProvider = defineSearchProvider<TConversationNode>({
  key: 'frontline-conversations',
  label: 'Conversations',
  labelKey: 'conversations',
  labelNamespace: 'common',
  icon: IconMail,
  order: 110,
  selections: [
    {
      alias: 'gs_frontline_conversations',
      field: 'frontlineGlobalSearchConversations',
      args: 'searchValue: $searchValue, limit: $limit, cursor: $cursor, direction: forward',
      body: '{ list { _id content customer { _id firstName lastName primaryEmail } } totalCount pageInfo { hasNextPage endCursor } }',
    },
  ],
  select: (payload) =>
    readCursorList<TConversationNode>(payload, 'gs_frontline_conversations'),
  toItem: (conversation) => ({
    id: conversation._id,
    title: getPersonName(
      conversation.customer ?? null,
      conversation.customer?.primaryEmail || UNNAMED,
    ),
    description: stripHtml(conversation.content),
    path: `/frontline/inbox?conversationId=${conversation._id}`,
  }),
});

type TTicketNode = {
  _id: string;
  name?: string | null;
  number?: string | null;
};

const ticketsSearchProvider = defineSearchProvider<TTicketNode>({
  key: 'frontline-tickets',
  label: 'Tickets',
  labelKey: 'tickets',
  labelNamespace: 'common',
  icon: IconTicket,
  order: 120,
  selections: [
    {
      alias: 'gs_frontline_tickets',
      field: 'getTickets',
      args: 'filter: { searchValue: $searchValue, limit: $limit, cursor: $cursor, direction: forward, orderBy: { createdAt: -1 } }',
      body: '{ list { _id name number } totalCount pageInfo { hasNextPage endCursor } }',
    },
  ],
  select: (payload) =>
    readCursorList<TTicketNode>(payload, 'gs_frontline_tickets'),
  toItem: (ticket) => ({
    id: ticket._id,
    title: ticket.name || UNNAMED,
    description: ticket.number ? `#${ticket.number}` : undefined,
    path: `/frontline/tickets?ticketId=${ticket._id}`,
  }),
});

type TChannelNode = {
  _id: string;
  name?: string | null;
  description?: string | null;
};

const channelsSearchProvider = defineSearchProvider<TChannelNode>({
  key: 'frontline-channels',
  label: 'Channels',
  labelKey: 'channels',
  labelNamespace: 'common',
  icon: IconInbox,
  order: 130,
  selections: [
    {
      alias: 'gs_frontline_channels',
      field: 'frontlineGlobalSearchChannels',
      args: 'searchValue: $searchValue, limit: $limit, cursor: $cursor, direction: forward',
      body: '{ list { _id name description } totalCount pageInfo { hasNextPage endCursor } }',
    },
  ],
  select: (payload) =>
    readCursorList<TChannelNode>(payload, 'gs_frontline_channels'),
  toItem: (channel) => ({
    id: channel._id,
    title: channel.name || UNNAMED,
    description: channel.description || undefined,
    path: `/frontline/inbox?channelId=${channel._id}`,
  }),
});

type TFormNode = {
  _id: string;
  name?: string | null;
  title?: string | null;
  code?: string | null;
};

const formsSearchProvider = defineSearchProvider<TFormNode>({
  key: 'frontline-forms',
  label: 'Forms',
  labelKey: 'forms',
  labelNamespace: 'common',
  icon: IconForms,
  order: 140,
  selections: [
    {
      alias: 'gs_frontline_forms',
      field: 'forms',
      args: 'searchValue: $searchValue, limit: $limit, cursor: $cursor, direction: forward',
      body: '{ list { _id name title code } totalCount pageInfo { hasNextPage endCursor } }',
    },
  ],
  select: (payload) => readCursorList<TFormNode>(payload, 'gs_frontline_forms'),
  toItem: (form) => ({
    id: form._id,
    title: form.name || form.title || UNNAMED,
    description: form.code || undefined,
    path: `/frontline/forms/${form._id}`,
  }),
});

export const SEARCH_PROVIDERS: ISearchProvider[] = [
  conversationsSearchProvider,
  ticketsSearchProvider,
  channelsSearchProvider,
  formsSearchProvider,
];
