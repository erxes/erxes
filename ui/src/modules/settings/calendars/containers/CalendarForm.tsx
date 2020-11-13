import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { IButtonMutateProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import CalendarForm from '../components/CalendarForm';
import { queries } from '../graphql';
import { GroupsQueryResponse, ICalendar } from '../types';

type Props = {
  calendar?: ICalendar;
  groupId?: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  show: boolean;
};

type FinalProps = {
  groupsQuery: GroupsQueryResponse;
} & Props;

class CalendarFormContainer extends React.Component<FinalProps> {
  render() {
    const { groupsQuery, groupId, renderButton } = this.props;

    if (groupsQuery.loading) {
      return <Spinner />;
    }

    const groups = groupsQuery.calendarGroups || [];

    const extendedProps = {
      ...this.props,
      groups,
      groupId,
      renderButton
    };

    return <CalendarForm {...extendedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, GroupsQueryResponse, {}>(gql(queries.groups), {
      name: 'groupsQuery',
      options: () => ({
        variables: {}
      })
    })
  )(CalendarFormContainer)
);
