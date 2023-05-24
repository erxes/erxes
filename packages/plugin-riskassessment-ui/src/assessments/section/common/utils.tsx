import { queries as dealQueries } from '@erxes/ui-cards/src/deals/graphql';
import { queries as taskQueries } from '@erxes/ui-cards/src/tasks/graphql';
import { queries as ticketQueries } from '@erxes/ui-cards/src/tickets/graphql';
import {
  CollapseContent,
  ControlLabel,
  EmptyState,
  FormGroup,
  SelectTeamMembers,
  Spinner
} from '@erxes/ui/src';
import { withProps } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql, useQuery } from 'react-apollo';
import { ListItem } from '../../../styles';
import { queries } from '../graphql';
import { GroupsQueryResponse } from './types';

type SelectGroupsAssignedUsersProps = {
  groups: any[];
  cardId: string;
  cardType: string;
  riskAssessmentId: string;
  handleSelect: (
    groupsAssignedUsers: { groupId: string; assignedUserIds: string[] }[]
  ) => void;
};

type SelectGroupsAssignedUsersFinalProps = {
  cardDetailQuery: any;
  groupsQueryResponse: GroupsQueryResponse;
} & SelectGroupsAssignedUsersProps;

function SelectGroupAssignedUsers({
  index,
  group,
  assignedUserIds,
  groupAssignedUserIds,
  handleSelect
}: {
  index: any;
  riskAssessmentId: string;
  group: any;
  assignedUserIds: string[];
  groupAssignedUserIds: string[];
  handleSelect: (groupAssignedUsers: {
    groupId: string;
    assignedUserIds: string[];
  }) => void;
}) {
  return (
    <ListItem key={index}>
      <h5 style={{ marginBottom: 10 }}>{group.name || `Group ${index + 1}`}</h5>
      <FormGroup>
        <SelectTeamMembers
          name="groupTeamMembers"
          label="Assign Team Members"
          initialValue={groupAssignedUserIds || []}
          filterParams={{ status: '', ids: assignedUserIds, excludeIds: false }}
          onSelect={values =>
            handleSelect({
              groupId: group._id,
              assignedUserIds: [...values]
            })
          }
        />
      </FormGroup>
    </ListItem>
  );
}

class SelectGroupsAssignedUsersComponent extends React.Component<
  SelectGroupsAssignedUsersFinalProps,
  { groupsAssignedUsers: { groupId: string; assignedUserIds: string[] }[] }
> {
  constructor(props) {
    super(props);
    this.state = {
      groupsAssignedUsers: []
    };
  }

  componentDidUpdate(prevProps) {
    const { groupsQueryResponse, handleSelect } = this.props;

    if (
      JSON.stringify(groupsQueryResponse) !==
      JSON.stringify(prevProps?.groupsQueryResponse)
    ) {
      if (!groupsQueryResponse.loading && !groupsQueryResponse.error) {
        const groups = groupsQueryResponse.riskAssessmentGroups;

        const groupsAssignedUsers = groups.map(group => ({
          groupId: group.groupId,
          assignedUserIds: group.assignedUserIds
        }));

        this.setState({
          groupsAssignedUsers
        });
        handleSelect(groupsAssignedUsers);
      }
    }
  }
  render() {
    const {
      cardDetailQuery,
      cardType,
      handleSelect,
      riskAssessmentId,
      groups,
      groupsQueryResponse
    } = this.props;
    const { groupsAssignedUsers } = this.state;

    if (groupsQueryResponse?.loading) {
      return <Spinner />;
    }

    const cardDetail = cardDetailQuery[`${cardType}Detail`] || {};

    const riskAssessmentGroups =
      groupsQueryResponse?.riskAssessmentGroups || [];

    const assignedUserIds = (cardDetail.assignedUsers || []).map(
      user => user._id
    );

    if (!assignedUserIds.length) {
      return <EmptyState text="You should assign some users in card" />;
    }

    const handleItems = (groupAssignedUsers: {
      groupId: string;
      assignedUserIds: string[];
    }) => {
      const { groupId } = groupAssignedUsers;

      if (groupsAssignedUsers.find(group => group.groupId === groupId)) {
        this.setState(
          {
            groupsAssignedUsers: groupsAssignedUsers.map(group =>
              group.groupId === groupId ? { ...groupAssignedUsers } : group
            )
          },
          () => handleSelect(this.state.groupsAssignedUsers)
        );
      } else {
        this.setState(
          { groupsAssignedUsers: [...groupsAssignedUsers, groupAssignedUsers] },
          () => handleSelect(this.state.groupsAssignedUsers)
        );
      }

      handleSelect(this.state.groupsAssignedUsers);
    };

    return (
      <CollapseContent
        title=""
        beforeTitle={
          <ControlLabel>
            {'Split assigned team members to groups of indicators'}
          </ControlLabel>
        }
      >
        {groups.map((group, index) => {
          const groupAssignedUserIds =
            (
              riskAssessmentGroups.find(
                assessmentGroup => assessmentGroup.groupId === group._id
              ) || {}
            ).assignedUserIds || [];

          return (
            <SelectGroupAssignedUsers
              key={index}
              index={index}
              group={group}
              riskAssessmentId={riskAssessmentId}
              handleSelect={handleItems}
              assignedUserIds={assignedUserIds}
              groupAssignedUserIds={groupAssignedUserIds}
            />
          );
        })}
      </CollapseContent>
    );
  }
}

export const SelectGroupsAssignedUsers = withProps<
  SelectGroupsAssignedUsersProps
>(
  compose(
    graphql<SelectGroupsAssignedUsersProps>(gql(dealQueries.dealDetail), {
      skip: ({ cardType }) => cardType !== 'deal',
      name: 'cardDetailQuery',
      options: ({ cardId }) => ({
        variables: {
          _id: cardId
        }
      })
    }),
    graphql<SelectGroupsAssignedUsersProps>(gql(ticketQueries.ticketDetail), {
      skip: ({ cardType }) => cardType !== 'ticket',
      name: 'cardDetailQuery',
      options: ({ cardId }) => ({
        variables: {
          _id: cardId
        }
      })
    }),
    graphql<SelectGroupsAssignedUsersProps>(gql(taskQueries.taskDetail), {
      skip: ({ cardType }) => cardType !== 'task',
      name: 'cardDetailQuery',
      options: ({ cardId }) => ({
        variables: {
          _id: cardId
        }
      })
    }),
    graphql<SelectGroupsAssignedUsersProps>(gql(queries.riskAssessmentGroups), {
      skip: ({ groups }) => !groups.length,
      name: 'groupsQueryResponse',
      options: ({ riskAssessmentId, groups }) => ({
        variables: {
          riskAssessmentId,
          groupIds: groups.map(group => group._id)
        },
        fetchPolicy: 'network-only'
      })
    })
  )(SelectGroupsAssignedUsersComponent)
);

export function SelectGroupsAssignedUsersWrapper({
  _id,
  cardId,
  cardType,
  handleSelect
}) {
  if (!_id) {
    return <></>;
  }
  const { data, loading } = useQuery(gql(queries.riskIndicatorsGroup), {
    variables: {
      _id
    }
  });

  if (loading) {
    return <Spinner />;
  }
  const { riskIndicatorsGroup } = data;
  return (
    <SelectGroupsAssignedUsers
      cardId={cardId}
      cardType={cardType}
      handleSelect={handleSelect}
      riskAssessmentId=""
      groups={riskIndicatorsGroup?.groups || []}
    />
  );
}
