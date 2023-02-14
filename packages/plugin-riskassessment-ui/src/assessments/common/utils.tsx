import {
  Button,
  CollapseContent,
  ControlLabel,
  dimensions,
  FormGroup,
  Icon,
  Label,
  SelectTeamMembers,
  __
} from '@erxes/ui/src';
import React from 'react';
import Popover from 'react-bootstrap/Popover';
import styled from 'styled-components';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { FormContainer, ListItem } from '../../styles';
import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { queries as dealQueries } from '@erxes/ui-cards/src/deals/graphql';
import { queries as taskQueries } from '@erxes/ui-cards/src/tasks/graphql';
import { queries as ticketQueries } from '@erxes/ui-cards/src/tickets/graphql';

type Props = {
  title: string;
  withoutPopoverTitle?: boolean;
  icon?: string;
};

const PopoverContent = styled.div`
  padding: ${dimensions.coreSpacing}px;
  line-height: 24px;

  h5 {
    margin-top: 0;
    line-height: 20px;
  }

  ol {
    padding-left: 20px;
  }
`;

export class DetailPopOver extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  renderContent() {
    const { title, withoutPopoverTitle } = this.props;
    return (
      <Popover id="help-popover">
        <PopoverContent>
          {!withoutPopoverTitle && title && <h5>{title}</h5>}
          {this.props.children}
        </PopoverContent>
      </Popover>
    );
  }

  render() {
    const { icon, title } = this.props;
    return (
      <OverlayTrigger
        trigger={'click'}
        placement="auto"
        overlay={this.renderContent()}
        rootClose={true}
      >
        <FormContainer row flex gapBetween={5} align="center">
          <div>
            <ControlLabel>{__(title)}</ControlLabel>
          </div>
          <div>
            <Button
              style={{ padding: '7px 0' }}
              btnStyle="link"
              icon={icon ? icon : 'question-circle'}
            ></Button>
          </div>
        </FormContainer>
      </OverlayTrigger>
    );
  }
}

type SelectGroupsAssignedUsersProps = {
  selectedItems: any[];
  cardId: string;
  cardType: string;
  handleSelect: (values, groupId) => void;
};

type SelectGroupsAssignedUsersFinalProps = {
  cardDetailQuery: any;
} & SelectGroupsAssignedUsersProps;

class SelectGroupsAssignedUsersComponent extends React.Component<
  SelectGroupsAssignedUsersFinalProps
> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      cardDetailQuery,
      cardType,
      selectedItems,
      handleSelect
    } = this.props;

    const cardDetail = cardDetailQuery[`${cardType}Detail`] || {};

    const assignedUserIds = (cardDetail.assignedUsers || []).map(
      user => user._id
    );

    return (
      <CollapseContent
        title=""
        beforeTitle={
          <ControlLabel>
            {'Split assigned team members to groups of indicators'}
            <Label lblStyle="simple">{__('Optional')}</Label>
          </ControlLabel>
        }
      >
        {selectedItems.map(item =>
          item.groups.map((group, index) => (
            <ListItem key={index}>
              <h5 style={{ marginBottom: 10 }}>
                {group.name || `Group ${index + 1}`}
              </h5>
              <FormGroup>
                <SelectTeamMembers
                  name="groupTeamMembers"
                  label="Assign Team Members"
                  filterParams={{ ids: assignedUserIds }}
                  onSelect={values => handleSelect(values, group._id)}
                />
              </FormGroup>
            </ListItem>
          ))
        )}
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
    })
  )(SelectGroupsAssignedUsersComponent)
);
