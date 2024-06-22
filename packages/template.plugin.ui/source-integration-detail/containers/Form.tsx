import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { gql } from '@apollo/client';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import Form from '../components/Form';
import * as React from 'react';
import { mutations, queries } from '@erxes/ui-inbox/src/settings/integrations/graphql';
import { useNavigate } from 'react-router-dom';

type Props = {};

const {Name}Container =(props: Props)=> {
  const navigate = useNavigate();

  const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
    const callback = () => {
      navigate('/settings/integrations');
    };

    return (
      <ButtonMutate
        mutation={mutations.integrationsCreateExternalIntegration}
        variables={values}
        callback={callback}
        isSubmitted={isSubmitted}
        refetchQueries={getRefetchQueries('{name}')}
        type="submit"
        successMessage={`You successfully added a {name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton: renderButton
  };

  return <Form {...updatedProps} />;
}

const getRefetchQueries = (kind: string) => {
  return [
    {
      query: gql(queries.integrations),
      variables: {
        kind
      }
    },
    {
      query: gql(queries.integrationTotalCount),
      variables: {
        kind
      }
    }
  ];
};

export default ({Name}Container);
