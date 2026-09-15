import { GraphQLError } from 'graphql';

export const viberSetupIncomplete = (integrationId: string): GraphQLError =>
  new GraphQLError(
    'Integration saved. Use Repair to finish connecting the Viber bot.',
    {
      extensions: { code: 'VIBER_SETUP_INCOMPLETE', integrationId },
    },
  );
