import {
  mutations as PipelineMutations,
  queries as PipelineQuery,
  types as PipelineTypes,
} from '@/ticket/graphql/schemas/pipeline';

import {
  mutations as StatusMutations,
  queries as StatusQuery,
  types as StatusTypes,
} from '@/ticket/graphql/schemas/status';

import {
  mutations as TicketMutations,
  queries as TicketQuery,
  types as TicketTypes,
} from '@/ticket/graphql/schemas/ticket';

import {
  queries as ActivityQueries,
  types as ActivityTypes,
} from '@/ticket/graphql/schemas/activity';

import {
  mutations as NoteMutations,
  queries as NoteQueries,
  types as NoteTypes,
} from '@/ticket/graphql/schemas/note';

import {
  mutations as TicketConfigMutations,
  queries as TicketConfigQueries,
  types as TicketConfigTypes,
} from '@/ticket/graphql/schemas/ticketConfig';


export const types = `
  ${PipelineTypes}
  ${StatusTypes}
  ${TicketTypes}
  ${ActivityTypes}
  ${NoteTypes}
  ${TicketConfigTypes}
`;

export const queries = `
  ${PipelineQuery}
  ${StatusQuery}
  ${TicketQuery}
  ${ActivityQueries}
  ${NoteQueries}
  ${TicketConfigQueries}
`;

export const mutations = `
  ${PipelineMutations}
  ${StatusMutations}
  ${TicketMutations}
  ${NoteMutations}
  ${TicketConfigMutations}
`;
