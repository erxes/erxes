import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';
import {
  PayDatesQueryResponse,
  ScheduleConfigQueryResponse
} from '../../types';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';
import { queries } from '../../graphql';
import ScheduleForm from '../../components/schedule/ScheduleForm';
import { IBranch, IDepartment } from '@erxes/ui/src/team/types';

type Props = {
  currentUser: IUser;
  isCurrentUserAdmin: boolean;

  branches: IBranch[];
  departments: IDepartment[];

  scheduleOfMembers: any;
  queryParams: any;
  history: any;
  modalContentType: string;

  checkDuplicateScheduleShifts: (values: any) => any;

  closeModal: any;
};

type FinalProps = {
  listScheduleConfigsQuery: ScheduleConfigQueryResponse;
} & Props;

const ScheduleFormContainer = (props: FinalProps) => {
  const { listScheduleConfigsQuery } = props;

  if (listScheduleConfigsQuery.loading) {
    return <Spinner />;
  }

  const { scheduleConfigs = [] } = listScheduleConfigsQuery;

  return <ScheduleForm scheduleConfigs={scheduleConfigs} {...props} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, PayDatesQueryResponse>(gql(queries.scheduleConfigs), {
      name: 'listScheduleConfigsQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    })
  )(withCurrentUser(ScheduleFormContainer))
);
