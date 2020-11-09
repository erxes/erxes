import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { ICalendar, GroupsQueryResponse } from '../types';
import Spinner from 'modules/common/components/Spinner';
import { IButtonMutateProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import CalendarForm from '../components/CalendarForm';
import { queries } from '../graphql';
import { queries as integrationQuery } from '../../integrations/graphql';
import { IntegrationsQueryResponse } from '../../integrations/types';

type Props = {
  calendar?: ICalendar;
  groupId?: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  show: boolean;
};

type FinalProps = {
  integrationsQuery: IntegrationsQueryResponse;
  groupsQuery: GroupsQueryResponse;
} & Props;

class CalendarFormContainer extends React.Component<FinalProps> {
  render() {
    const {
      groupsQuery,
      groupId,
      renderButton,
      integrationsQuery
    } = this.props;

    if (groupsQuery.loading || integrationsQuery.loading) {
      return <Spinner />;
    }

    const groups = groupsQuery.calendarGroups || [];
    const integrations = integrationsQuery.integrations || [];

    const extendedProps = {
      ...this.props,
      groups,
      groupId,
      integrations,
      renderButton
    };

    return <CalendarForm {...extendedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, IntegrationsQueryResponse, {}>(
      gql(integrationQuery.integrations),
      {
        name: 'integrationsQuery',
        options: () => ({
          variables: { kind: 'calendar' }
        })
      }
    ),
    graphql<Props, GroupsQueryResponse, {}>(gql(queries.groups), {
      name: 'groupsQuery',
      options: () => ({
        variables: {}
      })
    })
  )(CalendarFormContainer)
);
