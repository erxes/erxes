import { useState } from 'react';
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import type {
  AdminApp,
  AdminConversationItem,
  AdminMessage,
  AdminParticipant,
  MessagingKind,
} from '../types';
import { MessagingPage } from '../components/MessagingPage';

const apps: AdminApp[] = [
  {
    key: 'preview-mobile',
    tenant: 'demo',
    appId: 'Customer app',
    attachments: false,
  },
  {
    key: 'preview-portal',
    tenant: 'demo',
    appId: 'Client portal',
    attachments: false,
  },
];

const members: AdminParticipant['member'][] = [
  {
    id: 'preview-anar',
    displayName: 'Anar Bat',
    subject: 'anar@example.com',
    active: true,
  },
  {
    id: 'preview-saraa',
    displayName: 'Saraa Bold',
    subject: 'saraa@example.com',
    active: true,
  },
  {
    id: 'preview-temuulen',
    displayName: 'Temuulen Dorj',
    subject: 'temuulen@example.com',
    active: true,
  },
  {
    id: 'preview-nomin',
    displayName: 'Nomin Enkh',
    subject: 'nomin@example.com',
    active: true,
  },
];

const minutesAgo = (minutes: number): string =>
  new Date(Date.now() - minutes * 60_000).toISOString();

type SampleConversation = {
  conversation: AdminConversationItem;
  messages: AdminMessage[];
  participants: AdminParticipant[];
};

const createConversation = (
  id: string,
  kind: MessagingKind,
  title: string | null,
  app: AdminApp,
  people: AdminParticipant['member'][],
  texts: string[],
  activityMinutes: number,
): SampleConversation => ({
  conversation: {
    id,
    appKey: app.key,
    appId: app.appId,
    kind,
    title,
    lastActivityAt: minutesAgo(activityMinutes),
    messageCount: texts.length,
    memberCount: people.length,
    participants: people.map(({ id, displayName }) => ({ id, displayName })),
  },
  messages: texts.map((text, index) => ({
    id: `${id}-message-${index}`,
    sequence: index + 1,
    text,
    createdAt: minutesAgo(activityMinutes + (texts.length - index - 1) * 4),
    sender: people[index % people.length],
    mentions: kind === 'GROUP' && index === 2 ? [people[0]] : [],
    attachments:
      index === 1
        ? [
            {
              id: `${id}-attachment`,
              name: 'Project brief.pdf',
              mimeType: 'application/pdf',
              size: 245_760,
              downloadPath: null,
            },
          ]
        : [],
  })),
  participants: people.map((member, index) => ({
    member,
    role: kind === 'GROUP' && index === 0 ? 'OWNER' : 'MEMBER',
    active: true,
    joinedSequence: 1,
    lastReadSequence: Math.max(0, texts.length - index),
    unreadCount: index,
  })),
});

const samples: SampleConversation[] = [
  createConversation(
    'preview-direct-1',
    'DIRECT',
    null,
    apps[0],
    [members[0], members[1]],
    [
      'Сайн уу, шинэ хувилбарын загварыг харж амжсан уу?',
      'Сайн, харсан. Ярианы жагсаалт болон оролцогчдын хэсэг цэгцтэй харагдаж байна.',
      'Хавсаргасан brief дээр дэлгэрэнгүй саналуудаа оруулсан байгаа.',
      'Баярлалаа! Өнөөдөр багтаад шалгаад хариу өгье.',
      'Тэгье. Маргааш 10:00 цагт багтайгаа ярилцъя.',
    ],
    3,
  ),
  createConversation(
    'preview-direct-2',
    'DIRECT',
    null,
    apps[0],
    [members[2], members[3]],
    [
      'Hi Nomin, is the onboarding flow ready to review?',
      'Yes, I added the updated screens and notes to the brief.',
      'Looks good. The empty states are much clearer now.',
    ],
    26,
  ),
  createConversation(
    'preview-direct-3',
    'DIRECT',
    null,
    apps[1],
    [members[0], members[3]],
    [
      'Can we move our check-in to tomorrow morning?',
      'Of course. Does 10:30 work for you?',
      'Perfect, see you then!',
    ],
    95,
  ),
  createConversation(
    'preview-group-1',
    'GROUP',
    'Product & Design',
    apps[0],
    members,
    [
      'Өглөөний мэнд! Энэ долоо хоногийн загварын шинэчлэлтүүдийг энд нэгтгэе.',
      'Мессежийн дэлгэцийн шинэ хувилбар бэлэн болсон. Brief-ээ хавсаргалаа.',
      '@Anar Bat, жагсаалтын зай болон урт нэрүүдийг шалгаад өгөөч.',
      'Шалгалаа. Гар утасны хувилбар дээр ч ойлгомжтой харагдаж байна.',
      'Thanks everyone! Let’s review the final changes at 15:00.',
      'Тэгье, уулзалтын өмнө үлдсэн саналаа оруулна.',
    ],
    8,
  ),
  createConversation(
    'preview-group-2',
    'GROUP',
    'Customer success',
    apps[1],
    [members[1], members[2], members[3]],
    [
      'The new help center articles are ready.',
      'Great! I will share them with the team after review.',
      'I checked the links. Everything is working.',
    ],
    42,
  ),
  createConversation(
    'preview-group-3',
    'GROUP',
    'Release planning',
    apps[0],
    [members[0], members[2], members[3]],
    [
      'Release checklist is updated for Friday.',
      'QA is complete. No blocking issues found.',
      'Thank you, I will prepare the release notes.',
    ],
    180,
  ),
];

type PreviewVariables = {
  appKey?: string | null;
  kind?: MessagingKind;
  search?: string | null;
  id?: string;
  conversationId?: string;
};

const createPreviewClient = () =>
  new ApolloClient({
    cache: new InMemoryCache(),
    link: new ApolloLink(
      (operation) =>
        new Observable((observer) => {
          const variables: PreviewVariables = operation.variables;
          const selected = samples.find(
            ({ conversation }) =>
              conversation.appKey === variables.appKey &&
              conversation.id === (variables.id ?? variables.conversationId),
          );
          const search = (variables.search ?? '').trim().toLocaleLowerCase();

          switch (operation.operationName) {
            case 'communicationMessagingAdminAppList':
              observer.next({
                data: { communicationMessagingAdminApps: apps },
              });
              break;
            case 'communicationMessagingAdminConversationList':
              observer.next({
                data: {
                  communicationMessagingAdminConversations: {
                    items: samples
                      .map(({ conversation }) => conversation)
                      .filter(
                        (conversation) =>
                          (!variables.appKey ||
                            conversation.appKey === variables.appKey) &&
                          (!variables.kind ||
                            conversation.kind === variables.kind) &&
                          (!search ||
                            [
                              conversation.title ?? '',
                              ...conversation.participants.map(
                                (member) => member.displayName,
                              ),
                            ].some((text) =>
                              text.toLocaleLowerCase().includes(search),
                            )),
                      ),
                    nextCursor: null,
                  },
                },
              });
              break;
            case 'communicationMessagingAdminConversationDetail':
            case 'communicationMessagingAdminMessageList':
            case 'communicationMessagingAdminParticipantList':
              if (!selected) {
                observer.next({
                  errors: [
                    {
                      message: 'Sample conversation not found.',
                      extensions: { code: 'NOT_FOUND' },
                    },
                  ],
                });
                break;
              }
              observer.next({
                data: {
                  ...(operation.operationName ===
                    'communicationMessagingAdminConversationDetail' && {
                    communicationMessagingAdminConversation:
                      selected.conversation,
                  }),
                  ...(operation.operationName ===
                    'communicationMessagingAdminMessageList' && {
                    communicationMessagingAdminMessages: {
                      items: selected.messages,
                      nextCursor: null,
                    },
                  }),
                  ...(operation.operationName ===
                    'communicationMessagingAdminParticipantList' && {
                    communicationMessagingAdminParticipants:
                      selected.participants,
                  }),
                },
              });
              break;
            default:
              observer.error(new Error('Unsupported sample operation.'));
              return;
          }
          observer.complete();
        }),
    ),
  });

export const MessagingPreview = () => {
  const [client] = useState(createPreviewClient);
  return (
    <ApolloProvider client={client}>
      <MessagingPage sampleData />
    </ApolloProvider>
  );
};
