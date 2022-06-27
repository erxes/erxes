import * as compose from 'lodash.flowright';

import {
  BranchesQueryResponse,
  DepartmentsQueryResponse,
  UnitsQueryResponse
} from '@erxes/ui/src/team/types';

import { ChannelsQueryResponse } from '@erxes/ui-inbox/src/settings/channels/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import { IUserGroup } from '@erxes/ui-settings/src/permissions/types';
import React from 'react';
import UserInvitationForm from '../components/UserInvitationForm';
import { queries as channelQueries } from '@erxes/ui-inbox/src/settings/channels/graphql';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries } from '@erxes/ui/src/team/graphql';
import { withProps } from '@erxes/ui/src/utils';

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
