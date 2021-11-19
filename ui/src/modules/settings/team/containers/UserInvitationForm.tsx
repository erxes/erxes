import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IButtonMutateProps } from 'modules/common/types';
import { ICommonFormProps } from 'modules/settings/common/types';
import { IUserGroup } from 'modules/settings/permissions/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { queries as channelQueries } from '../../channels/graphql';
import { queries } from '../graphql';
import { ChannelsQueryResponse } from '../../channels/types';
import UserInvitationForm from '../components/UserInvitationForm';
import {
  BranchesQueryResponse,
  DepartmentsQueryResponse,
  UnitsQueryResponse
} from '../types';

type WrapperProps = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  usersGroups: IUserGroup[];
} & ICommonFormProps;

type Props = {
  channelsQuery: ChannelsQueryResponse;
  unitsQuery: UnitsQueryResponse;
  departmentsQuery: DepartmentsQueryResponse;
  branchesQuery: BranchesQueryResponse;
} & WrapperProps;

const UserInviteFormContainer = (props: Props & ICommonFormProps) => {
  const { branchesQuery, channelsQuery, unitsQuery, departmentsQuery } = props;

  const channels = channelsQuery.channels || [];
  const units = unitsQuery.units || [];
  const departments = departmentsQuery.departments || [];
  const branches = branchesQuery.branches || [];

  const updatedProps = Object.assign({}, props, {
    channels,
    units,
    departments,
    branches
  });

  return <UserInvitationForm {...updatedProps} />;
};

export default withProps<WrapperProps>(
  compose(
    graphql<{}, ChannelsQueryResponse>(gql(channelQueries.channels), {
      name: 'channelsQuery'
    }),
    graphql<{}, UnitsQueryResponse>(gql(queries.units), {
      name: 'unitsQuery'
    }),
    graphql<{}, DepartmentsQueryResponse>(gql(queries.departments), {
      name: 'departmentsQuery'
    }),
    graphql<{}, BranchesQueryResponse>(gql(queries.branches), {
      name: 'branchesQuery'
    })
  )(UserInviteFormContainer)
);
