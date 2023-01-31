import {
  CollapseContent,
  ControlLabel,
  Label,
  NameCard,
  Table,
  Tabs,
  TabTitle,
  __
} from '@erxes/ui/src';
import { FlexRow } from '@erxes/ui/src/components/filterableList/styles';
import React from 'react';
import {
  CardBox,
  ColorBox,
  FormContainer,
  FormContent,
  ListItem,
  TableRow,
  TriggerTabs
} from '../../styles';

import { DetailPopOver } from '../common/utils';

type Props = {
  riskAssessment: any;
  detail: any;
  assignedUsers: any;
  groupAssessment: any;
  indicatorAssessment: any;
};

type State = {
  currentGroupId: string;
  currentIndicatorId: string;
  currentUserId: string;
};
class Detail extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentGroupId: '',
      currentIndicatorId: '',
      currentUserId: ''
    };
  }

  renderUsers() {
    const { assignedUsers } = this.props;

    return (
      <DetailPopOver
        withoutPopoverTitle
        title="Assigned Members"
        icon="downarrow-2"
      >
        {assignedUsers.map(user => (
          <NameCard user={user} />
        ))}
      </DetailPopOver>
    );
  }

  renderCard({ title, content }) {
    return (
      <CardBox>
        <p>{title}</p>
        {content}
      </CardBox>
    );
  }

  renderTable({ score, status, color }) {
    return (
      <FormContent>
        <FormContainer column>
          <Table>
            <thead>
              <TableRow>
                <th>{__('Score')}</th>
                <th>{__('Result')}</th>
                <th>{__('Status Color')}</th>
              </TableRow>
            </thead>
            <tbody>
              <TableRow>
                <td>{score}</td>
                <td>{status}</td>
                <td>
                  <ColorBox color={color} style={{ marginRight: '30px' }} />
                </td>
              </TableRow>
            </tbody>
          </Table>
        </FormContainer>
      </FormContent>
    );
  }

  renderSubmission(fields) {
    return fields.map(field => (
      <CollapseContent
        key={field.fieldId}
        beforeTitle={
          <ControlLabel>{`${field?.text}: ${field?.value}`}</ControlLabel>
        }
        title=""
        compact
      >
        {(field?.optionsValues?.split('\n') || []).map(value => (
          <p key={Math.random()}>{__(value)}</p>
        ))}
      </CollapseContent>
    ));
  }

  renderAssignedUsers = submissions => {
    const { assignedUsers } = this.props;
    const { currentUserId } = this.state;

    const handleSelect = id => {
      this.setState({ currentUserId: id });
    };

    return (
      <>
        <TriggerTabs>
          <Tabs full>
            {(submissions || []).map(({ _id }) => {
              const assignedUser = assignedUsers.find(user => user._id === _id);
              if (!assignedUser) {
                return;
              }
              return (
                <TabTitle
                  key={_id}
                  className={currentUserId === _id ? 'active' : ''}
                  onClick={handleSelect.bind(this, _id)}
                >
                  <NameCard user={assignedUser} />
                </TabTitle>
              );
            })}
          </Tabs>
        </TriggerTabs>
        {currentUserId &&
          this.renderSubmission(
            (submissions.find(({ _id }) => _id === currentUserId) || {})
              .fields || []
          )}
      </>
    );
  };

  renderIndicator(indicator) {
    if (!indicator) {
      return;
    }

    return (
      <>
        {this.renderTable({
          score: indicator.resultScore,
          status: indicator.status,
          color: indicator.statusColor
        })}
        {this.renderAssignedUsers(indicator?.submissions)}
      </>
    );
  }

  renderIndicators(indicatorsAssessment) {
    const { currentIndicatorId } = this.state;

    const handleChangeTabs = id => {
      this.setState({ currentIndicatorId: id });
    };

    return (
      <>
        <TriggerTabs>
          <Tabs full>
            {(indicatorsAssessment || []).map(indicator => (
              <TabTitle
                key={indicator._id}
                onClick={handleChangeTabs.bind(this, indicator._id)}
                className={currentIndicatorId === indicator._id ? 'active' : ''}
              >{`${indicator?.name}`}</TabTitle>
            ))}
          </Tabs>
        </TriggerTabs>
        {currentIndicatorId &&
          this.renderIndicator(
            indicatorsAssessment.find(
              indicator => indicator._id === currentIndicatorId
            )
          )}
      </>
    );
  }

  renderGroup(groupId) {
    const { groupAssessment } = this.props;
    const group = groupAssessment.find(group => group._id === groupId);

    if (!group) {
      return;
    }

    return (
      <>
        {this.renderTable({
          score: group.resultScore,
          status: group.status,
          color: group.statusColor
        })}
        {this.renderIndicators(group?.indicatorsAssessments)}
      </>
    );
  }

  renderGroups() {
    const { groupAssessment } = this.props;
    const { currentGroupId } = this.state;

    const handleChangeTabs = id => {
      this.setState({ currentGroupId: id });
    };

    return (
      <>
        <TriggerTabs>
          <Tabs full>
            {(groupAssessment || []).map((group, i) => (
              <TabTitle
                key={group._id}
                onClick={handleChangeTabs.bind(this, group._id)}
                className={currentGroupId === group._id ? 'active' : ''}
              >{`Group ${i + 1}`}</TabTitle>
            ))}
          </Tabs>
        </TriggerTabs>
        {currentGroupId && this.renderGroup(currentGroupId)}
      </>
    );
  }

  render() {
    const { detail, groupAssessment, indicatorAssessment } = this.props;

    return (
      <FormContainer column gap>
        <FormContainer row gap spaceBetween>
          <FormContainer row gap>
            {this.renderCard({
              title: 'Score',
              content: <h4>{detail.resultScore}</h4>
            })}
            {this.renderCard({
              title: 'Status',
              content: (
                <h4
                  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  {detail?.status}
                  <ColorBox color={detail?.statusColor} />
                </h4>
              )
            })}
          </FormContainer>
          {this.renderUsers()}
        </FormContainer>
        {groupAssessment && this.renderGroups()}
        {indicatorAssessment &&
          this.renderAssignedUsers(indicatorAssessment?.submissions)}
      </FormContainer>
    );
  }
}

export default Detail;
