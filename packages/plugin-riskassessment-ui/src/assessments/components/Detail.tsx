import {
  CardBox,
  ColorBox,
  Divider,
  FormContainer,
  FormContent,
  TableRow,
  TriggerTabs
} from '../../styles';
import React, { useState } from 'react';
import { TabTitle, Tabs } from '@erxes/ui/src/components/tabs';
import { removeParams, setParams } from '@erxes/ui/src/utils/router';
import { useLocation, useNavigate } from 'react-router-dom';

import Attachment from '@erxes/ui/src/components/Attachment';
import Button from '@erxes/ui/src/components/Button';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import { DetailPopOver } from '../common/utils';
import Icon from '@erxes/ui/src/components/Icon';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import Table from '@erxes/ui/src/components/table';
import { __ } from '@erxes/ui/src/utils/core';
import colors from '@erxes/ui/src/styles/colors';

type Props = {
  riskAssessment: any;
  detail: any;
  assignedUsers: any;
  groupAssessment: any;
  indicatorAssessment: any;
  queryParams: any;
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

    // if (isJsonString(field.value)) {
    //   updateProps.title = field.text;

    //   const attachments = JSON.parse(field.value);

    //   console.log({ attachments });

    //   children = (
    //     <>
    //       {(attachments || []).map(attachment => (
    //         <Attachment key={Math.random()} attachment={attachment} />
    //       ))}
    //     </>
    //   );
    // } else {
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
    // }

    return <CollapseContent {...updateProps}>{children}</CollapseContent>;
  });
}

const Detail = (props: Props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentGroupId, setCurrentGroupId] = useState('');
  const [currentIndicatorId, setCurrentIndicatorId] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');

  const renderUsers = () => {
    const { assignedUsers } = props;

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
            <FormContainer $row $spaceBetween>
              <NameCard user={user} />
              {renderStatus(user?.submitStatus || '')}
            </FormContainer>
            <Divider />
          </div>
        ))}
      </DetailPopOver>
    );
  };

  const renderCard = ({ title, content }) => {
    return (
      <CardBox>
        <p>{title}</p>
        {content}
      </CardBox>
    );
  };

  const renderTable = ({ score, status, color }) => {
    return (
      <FormContent>
        <FormContainer $column>
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
  };

  const renderSubmissions = submissions => {
    if (!currentUserId) {
      return;
    }

    const fields =
      submissions.find(({ _id }) => _id === currentUserId)?.fields || [];

    return <>{renderSubmission(fields)}</>;
  };

  const renderAssignedUsers = submissions => {
    const { assignedUsers } = props;

    const handleSelect = id => {
      setCurrentUserId(id);
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
        {currentUserId && renderSubmissions(submissions)}
      </>
    );
  };

  const renderIndicator = indicator => {
    if (!indicator) {
      return;
    }

    return (
      <>
        {renderTable({
          score: indicator.resultScore,
          status: indicator.status,
          color: indicator.statusColor
        })}
        {renderAssignedUsers(indicator?.submissions)}
      </>
    );
  };

  const renderIndicators = indicatorsAssessment => {
    const handleChangeTabs = id => {
      setCurrentIndicatorId(id);
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
          renderIndicator(
            indicatorsAssessment.find(
              indicator => indicator._id === currentIndicatorId
            )
          )}
      </>
    );
  };

  const renderGroup = groupId => {
    const { groupAssessment } = props;
    const group = groupAssessment.find(group => group._id === groupId);

    if (!group) {
      return;
    }

    return (
      <>
        {renderTable({
          score: group.resultScore,
          status: group.status,
          color: group.statusColor
        })}
        {renderIndicators(group?.indicatorsAssessments)}
      </>
    );
  };

  const renderGroups = () => {
    const { groupAssessment } = props;

    const handleChangeTabs = id => {
      setCurrentGroupId(id);
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
        {currentGroupId && renderGroup(currentGroupId)}
      </>
    );
  };

  const { detail, groupAssessment, indicatorAssessment, queryParams } = props;

  const handleShowFlagged = () => {
    if (queryParams.showFlagged) {
      return removeParams(navigate, location, 'showFlagged');
    }
    setParams(navigate, location, { showFlagged: true });
  };

  return (
    <FormContainer $column $gap>
      <FormContainer $row $gap $spaceBetween>
        <FormContainer $row $gap>
          {renderCard({
            title: 'Score',
            content: <h4>{detail.resultScore}</h4>
          })}
          {renderCard({
            title: 'Status',
            content: (
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                {detail?.status}
                <ColorBox color={detail?.statusColor} />
              </h4>
            )
          })}
        </FormContainer>
        {renderUsers()}
      </FormContainer>
      <Button
        icon={queryParams.showFlagged ? 'eye-slash' : 'eye'}
        onClick={handleShowFlagged}
      >
        {__('Show only flagged')}
      </Button>
      {groupAssessment && renderGroups()}
      {!groupAssessment?.length &&
        indicatorAssessment &&
        renderAssignedUsers(indicatorAssessment?.submissions)}
    </FormContainer>
  );
};

export default Detail;
