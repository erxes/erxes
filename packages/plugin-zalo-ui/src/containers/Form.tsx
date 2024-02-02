import * as React from 'react';

import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';
// import { withRouter } from 'react-router-dom';
import {
  mutations,
  queries,
} from '@erxes/ui-inbox/src/settings/integrations/graphql';

import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import Form from '../components/Form';
import { gql } from '@apollo/client';

type Props = {} & IRouterProps;

const ZaloContainer = (props: Props) => {
  const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
    const { history } = props;

    const callback = () => {
      history.push('/settings/integrations');
    };

    return (
      <ButtonMutate
        mutation={mutations.integrationsCreateExternalIntegration}
        variables={values}
        callback={callback}
        isSubmitted={isSubmitted}
        refetchQueries={getRefetchQueries('zalo')}
        type="submit"
        successMessage={`You successfully added a zalo`}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton: renderButton,
  };

  return <Form {...updatedProps} />;
};

const getRefetchQueries = (kind: string) => {
  return [
    {
      query: gql(queries.integrations),
      variables: {
        kind,
      },
    },
    {
      query: gql(queries.integrationTotalCount),
      variables: {
        kind,
      },
    },
  ];
};

export default ZaloContainer;
