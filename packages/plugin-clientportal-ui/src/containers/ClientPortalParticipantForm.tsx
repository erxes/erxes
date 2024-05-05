import { AppConsumer, ButtonMutate, withProps } from '@erxes/ui/src';
import { IUser, UsersQueryResponse } from '@erxes/ui/src/auth/types';
import {
  IButtonMutateProps,
  IQueryParams,
} from '@erxes/ui/src/types';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';

import ClientPortalParticipantForm from '../components/forms/ClientPortalParticipantForm';
import { mutations, queries } from '../graphql';
import {
  ClientPortalParticipantDetailQueryResponse,
  ClientPortalConfigsQueryResponse,
  IClientPortalParticipant,
  IClientPortalUser,
} from '../types';

type Props = {
  clientPortalUser: IClientPortalUser;
  closeModal: () => void;
  queryParams: IQueryParams;
  kind: 'client' | 'vendor';
  mainType: string;
  mainTypeId: string;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;
  clientPortalConfigsQuery: ClientPortalConfigsQueryResponse;
  clientPortalParticipantDetail: ClientPortalParticipantDetailQueryResponse;
} & Props;

class ClientPortalParticipantFormContainer extends React.Component<FinalProps> {
  render() {
    const { clientPortalConfigsQuery } = this.props;

    if (
      clientPortalConfigsQuery.loading ||
      this.props?.clientPortalParticipantDetail.loading
    ) {
      return null;
    }

    const renderButton = ({
      name,
      values,
      isSubmitted,
      object,
    }: IButtonMutateProps) => {
      const { closeModal } = this.props;

      const cleanValues = (obj) => {
        const newObj = { ...obj };

        Object.keys(newObj).forEach((key) => {
          const val = newObj[key];
          if (val === null || val === undefined || val === '') {
            delete newObj[key];
          }
        });

        return newObj;
      };

      const afterSave = (_data) => {
        closeModal();
      };

      return (
        <ButtonMutate
          mutation={mutations.clientPortalParticipantEdit}
          variables={cleanValues(values)}
          callback={afterSave}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        >
          Save
        </ButtonMutate>
      );
    };

    const clientPortalGetConfigs =
      clientPortalConfigsQuery.clientPortalGetConfigs || [];

    const updatedProps = {
      ...this.props,
      clientPortalGetConfigs,
      participant:
        this.props?.clientPortalParticipantDetail
          ?.clientPortalParticipantDetail,
      renderButton,
    };

    return (
      <AppConsumer>
        {({ currentUser }) => (
          <ClientPortalParticipantForm
            {...updatedProps}
            currentUser={currentUser || ({} as IUser)}
          />
        )}
      </AppConsumer>
    );
  }
}

const getRefetchQueries = () => {
  return ['clientPortalUsers', 'clientPortalUserCounts'];
};

export default withProps<Props>(
  compose(
    graphql<Props, ClientPortalConfigsQueryResponse>(gql(queries.getConfigs), {
      name: 'clientPortalConfigsQuery',
      options: ({ kind }) => ({
        fetchPolicy: 'network-only',
        variables: { kind },
      }),
    }),
    graphql<Props, ClientPortalParticipantDetailQueryResponse>(
      gql(queries.clientPortalParticipantDetail),
      {
        name: 'clientPortalParticipantDetail',
        options: ({ clientPortalUser, mainType, mainTypeId }) => ({
          fetchPolicy: 'network-only',
          variables: {
            contentTypeId: mainTypeId,
            contentType: mainType,
            cpUserId: clientPortalUser._id,
          },
        }),
      },
    ),
  )(ClientPortalParticipantFormContainer),
);
