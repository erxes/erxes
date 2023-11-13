import {
  CollapseContent,
  colors,
  Icon,
  NameCard,
  Table,
  Tabs,
  TabTitle,
  __,
  Attachment,
  Button
} from '@erxes/ui/src';
import React from 'react';
import {
  CardBox,
  ColorBox,
  Divider,
  FormContainer,
  FormContent,
  TableRow,
  TriggerTabs
} from '../../styles';

import { DetailPopOver } from '../common/utils';
import { removeParams, setParams } from '@erxes/ui/src/utils/router';

type Props = {
  riskAssessment: any;
  detail: any;
  assignedUsers: any;
  groupAssessment: any;
  indicatorAssessment: any;
  queryParams: any;
  history: any;
};

type State = {
  currentGroupId: string;
  currentIndicatorId: string;
  currentUserId: string;
};

const isJsonString = value => {
  try {
    JSON.parse(value);
  } catch (e) {
    return false;
  }
  return true;
};

export function renderSubmission(fields) {
  return fields.map(field => {
    const updateProps: any = {
      key: field.fieldId,
      description: field.description,
      compact: true
    };

    let children;

    if (isJsonString(field.value)) {
      updateProps.title = field.text;

      const attachments = JSON.parse(field.value);

      children = (
        <>
          {attachments.map(attachment => (
            <Attachment key={Math.random()} attachment={attachment} />
          ))}
        </>
      );
    } else {
      updateProps.title = `${field?.text}: ${field?.value}`;

      if (field.isFlagged) {
        updateProps.beforeTitle = (
          <Icon
            icon="flag"
            color={colors.colorCoreRed}
            style={{ marginRight: 10, fontSize: 15 }}
          />
        );
      }

      children = (
        <>
          {(field?.optionsValues?.split('\n') || []).map(value => (
            <p key={Math.random()}>{__(value)}</p>
          ))}
        </>
      );
    }

    return <CollapseContent {...updateProps}>{children}</CollapseContent>;
  });
}

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

    const renderStatus = submitStatus => {
      switch (submitStatus) {
        case 'inProgress':
          return <Icon icon="loading" color={colors.colorCoreBlue} />;
        case 'pending':
          return <Icon icon="wallclock" color={colors.colorCoreOrange} />;
        case 'submitted':
          return <Icon icon="checked" color={colors.colorCoreGreen} />;
        default:
          return;
      }
    };

    return (
      <DetailPopOver
        withoutPopoverTitle
        title="Assigned Members"
        icon="downarrow-2"
      >
        {assignedUsers.map(user => (
          <div key={user._id}>
            <FormContainer row spaceBetween>
              <NameCard user={user} />
              {renderStatus(user?.submitStatus || '')}
            </FormContainer>
            <Divider />
          </div>
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

  renderSubmissions(submissions) {
    const { currentUserId } = this.state;

    if (!currentUserId) {
      return;
    }

    const fields =
      submissions.find(({ _id }) => _id === currentUserId)?.fields || [];

    return <>{renderSubmission(fields)}</>;
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
              const assignedUser = assignedUsers.find(
                user => user?._id === _id
              );
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
        {currentUserId && this.renderSubmissions(submissions)}
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
    const {
      detail,
      groupAssessment,
      indicatorAssessment,
      queryParams,
      history
    } = this.props;

    const handleShowFlagged = () => {
      if (queryParams.showFlagged) {
        return removeParams(history, 'showFlagged');
      }
      setParams(history, { showFlagged: true });
    };

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
        <Button
          icon={queryParams.showFlagged ? 'eye-slash' : 'eye'}
          onClick={handleShowFlagged}
        >
          {__('Show only flagged')}
        </Button>
        {groupAssessment && this.renderGroups()}
        {!groupAssessment?.length &&
          indicatorAssessment &&
          this.renderAssignedUsers(indicatorAssessment?.submissions)}
      </FormContainer>
    );
  }
}

export default Detail;
