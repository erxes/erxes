/*
 * we will use this to call graphql subscripton. After we replace methods with
 * mutations this temp mutations will be deleted
*/

import { mutate } from '../../server/utils';

export const conversationsChanged = (conversationIds, type) =>
  mutate(
    `
    mutation {
      conversationsChanged(_ids: "${conversationIds}", type: "${type}")
    }
  `,
  );
