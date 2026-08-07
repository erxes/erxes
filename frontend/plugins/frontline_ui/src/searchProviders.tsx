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
  readArray,
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
      alias: 'gs_frontline_conversations_open',
      field: 'conversations',
      args: 'searchValue: $searchValue, limit: $limit',
      body: '{ list { _id content customer { _id firstName lastName primaryEmail } } totalCount }',
    },
    {
      alias: 'gs_frontline_conversations_closed',
      field: 'conversations',
      args: 'searchValue: $searchValue, limit: $limit, status: "closed"',
      body: '{ list { _id content customer { _id firstName lastName primaryEmail } } totalCount }',
    },
  ],
  select: (payload) => {
    const open = readCursorList<TConversationNode>(
      payload,
      'gs_frontline_conversations_open',
    );
    const closed = readCursorList<TConversationNode>(
      payload,
      'gs_frontline_conversations_closed',
    );

    return {
      nodes: [...open.nodes, ...closed.nodes],
      totalCount: open.totalCount + closed.totalCount,
    };
  },
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
      args:
        'filter: { searchValue: $searchValue, limit: $limit, cursor: "", direction: forward, orderBy: { createdAt: -1 } }',
      body: '{ list { _id name number } totalCount }',
    },
  ],
  select: (payload) => readCursorList<TTicketNode>(payload, 'gs_frontline_tickets'),
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
      field: 'getChannels',
      args: 'name: $searchValue',
      body: '{ _id name description }',
    },
  ],
  select: (payload) => ({
    nodes: readArray<TChannelNode>(payload, 'gs_frontline_channels'),
  }),
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
      args: 'searchValue: $searchValue, limit: $limit',
      body: '{ list { _id name title code } totalCount }',
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
