import React from 'react';
import { gql, useQuery } from '@apollo/client';

import { IWebhook } from '../types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { ButtonMutate } from '@erxes/ui/src';
import { mutations, queries } from '../graphql';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import WebhookForm from '../components/WebhookForm';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';

type Props = {
  object?: IWebhook;
  webhookActions: any;
} & ICommonFormProps;

const WebhookFormContainer = (props: Props) => {
  const webhooksGetActionsQuery = useQuery(gql(queries.webhooksGetActions));

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object,
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.webhooksEdit : mutations.webhooksAdd}
        variables={values}
        callback={callback}
        isSubmitted={isSubmitted}
        refetchQueries={['webhooks', 'webhooksTotalCount']}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    webhookActions: webhooksGetActionsQuery?.data?.webhooksGetActions || [],
    renderButton,
  };

  return <WebhookForm {...updatedProps} />;
};

export default WebhookFormContainer;
