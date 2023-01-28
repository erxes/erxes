import {
  ControlLabel,
  Label,
  NameCard,
  Tabs,
  TabTitle,
  __
} from '@erxes/ui/src';
import { withProps } from '@erxes/ui/src/utils/core';
import React from 'react';
import {
  ColorBox,
  FormContainer,
  FormContent,
  TriggerTabs
} from '../../styles';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { queries } from '../graphql';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
type Props = {
  riskAssessment: any;
  detail: any;
};

type State = {
  currentTabId: string;
};
class Detail extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentTabId: ''
    };
  }

  renderUsers() {
    const { detail } = this.props;
    const { currentTabId } = this.state;

    const handleClick = id => {
      this.setState({ currentTabId: id });
    };

    return (
      <>
        <TriggerTabs>
          <Tabs full>
            {(detail?.assignedUsers || []).map(({ _id, ...user }) => (
              <TabTitle
                key={_id}
                className={currentTabId === _id ? 'active' : ''}
                onClick={handleClick.bind(this, _id)}
              >
                <NameCard user={user} />
              </TabTitle>
            ))}
          </Tabs>
        </TriggerTabs>
        <FormContent>shit</FormContent>
      </>
    );
  }

  render() {
    const { riskAssessment } = this.props;
    const {
      status,
      statusColor,
      conformityDetail,
      branches,
      departments,
      operations
    } = riskAssessment;

    return (
      <FormContainer column gap>
        <FormContainer row gapBetween={5} align="center">
          <ControlLabel>{`Status : ${status}`}</ControlLabel>
          <ColorBox color={statusColor} />
        </FormContainer>
        <ControlLabel>{`${conformityDetail.cardType.toUpperCase()} Name: ${
          conformityDetail?.cardName
        }`}</ControlLabel>
        <FormContainer row gapBetween={5}>
          <ControlLabel>{__('Branches:')}</ControlLabel>
          {branches.map(branch => (
            <Label>{__(branch.title)}</Label>
          ))}
        </FormContainer>
        <FormContainer row gapBetween={5}>
          <ControlLabel>{__('Departments:')}</ControlLabel>
          {departments.map(department => (
            <Label>{__(department.title)}</Label>
          ))}
        </FormContainer>
        <FormContainer row gapBetween={5}>
          <ControlLabel>{__('Operations:')}</ControlLabel>
          {operations.map(operation => (
            <Label>{__(operation.name)}</Label>
          ))}
        </FormContainer>
        <LeftSidebar></LeftSidebar>
      </FormContainer>
    );
  }
}

export default Detail;
