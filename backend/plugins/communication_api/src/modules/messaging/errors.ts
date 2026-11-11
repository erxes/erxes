import { GraphQLError } from 'graphql';

export const messagingError = (message: string, code = 'BAD_USER_INPUT') =>
  new GraphQLError(message, { extensions: { code } });

export const messagingNotFound = () =>
  messagingError('Messaging record not found', 'NOT_FOUND');
