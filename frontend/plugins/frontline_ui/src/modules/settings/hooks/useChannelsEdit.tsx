import React from 'react';

import { OperationVariables, useMutation } from '@apollo/client';
import { EDIT_CHANNELS } from '../graphql';

export const useChannelsEdit = () => {
  const [_channelsEdit, { loading }] = useMutation(EDIT_CHANNELS);

  const channelsEdit = (
    operationVariables: OperationVariables,
    fields: string[],
  ) => {
    const variables = operationVariables?.variables || {};
    const fieldsToUpdate: Record<string, () => any> = {};
    fields.forEach((field) => {
      fieldsToUpdate[field] = () => variables[field];
    });
    return _channelsEdit({
      ...operationVariables,
      variables,
      update: (cache, { data: { channelsEdit } }) => {
        cache.modify({
          id: cache.identify(channelsEdit),
          fields: fieldsToUpdate,
        });
      },
    });
  };

  return { channelsEdit, loading };
};
