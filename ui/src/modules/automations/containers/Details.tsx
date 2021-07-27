import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import EmptyState from 'modules/common/components/EmptyState';
import Spinner from 'modules/common/components/Spinner';
import { IButtonMutateProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { IUser } from '../../auth/types';
import Detail from '../components/Detail';
import { queries, mutations } from '../graphql';
import { DetailQueryResponse } from '../types';

type Props = {
  id: string;
};

type FinalProps = {
  automationDetailQuery: DetailQueryResponse;
  currentUser: IUser;
} & Props;

const AutomationDetailsContainer = (props: FinalProps) => {
  const { automationDetailQuery, currentUser } = props;

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.automationsEdit}
        variables={values}
        callback={callback}
        refetchQueries={['automations', 'automationsMain', 'automationDetail']}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully updated a ${name}`}
      />
    );
  };

  if (automationDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (!automationDetailQuery.automationDetail) {
    return (
      <EmptyState text="Automation not found" image="/images/actions/24.svg" />
    );
  }

  const automationDetail = automationDetailQuery.automationDetail || {};

  const updatedProps = {
    ...props,
    loading: automationDetailQuery.loading,
    automation: automationDetail,
    currentUser,
    renderButton
  };

  return <Detail {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, DetailQueryResponse, { _id: string }>(
      gql(queries.automationDetail),
      {
        name: 'automationDetailQuery',
        options: ({ id }) => ({
          variables: {
            _id: id
          }
        })
      }
    )
  )(AutomationDetailsContainer)
);
