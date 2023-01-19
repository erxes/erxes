import {
  ActivityDate,
  ActivityIcon,
  ActivityRow,
  FlexCenterContent,
  Timeline
} from '@erxes/ui-log/src/activityLogs/styles';
import React from 'react';
import { DataWithLoader, NameCard, Tip } from '../../../components';
import Icon from '../../../components/Icon';
import { IUserMovement } from '../../types';
import dayjs from 'dayjs';
import { __ } from '../../../utils';
import { ContentBox } from '../../../layout';
import styled from 'styled-components';
import { colors, dimensions } from '@erxes/ui/src/styles';
import styledTS from 'styled-components-ts';
import { ActivityContent } from '../../../styles/main';

const Row = styledTS<{ gap: number }>(styled.div)`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  gap: ${({ gap }) => gap}px;
  margin-right: ${dimensions.coreSpacing}px;
`;

const StructureCard = styled.div`
  font-size: 16px;
`;

type Props = {
  list: IUserMovement[];
  loading: boolean;
};

class UserMovementForm extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  renderRow(movement) {
    const {
      _id,
      createdByDetail,
      userDetail,
      contentTypeDetail,
      createdAt,
      contentType,
      status
    } = movement;

    const { color, label, label2, icon } = {
      color: status === 'removed' ? colors.colorCoreRed : colors.colorCoreGreen,
      label: status === 'removed' ? 'Removed:' : 'Moved:',
      label2: status === 'removed' ? 'From' : 'To',
      icon: status === 'removed' ? 'user-minus' : 'user-plus'
    };

    return (
      <ActivityRow key={_id}>
        <ActivityIcon color={color}>
          <Icon icon={icon} />
        </ActivityIcon>
        <FlexCenterContent>
          <ContentBox>
            <Row gap={25}>
              <NameCard user={createdByDetail} />
              {__(label)}
              <Row gap={15}>
                <NameCard user={userDetail} />
                <Row gap={5}>
                  {__(label2)}
                  <Icon icon="rightarrow" />
                </Row>
                <StructureCard>
                  <Icon icon={contentType === 'branch' ? 'gold' : 'building'} />
                  {__(contentTypeDetail?.title || '')}
                  {`(${contentType})`}
                </StructureCard>
              </Row>
            </Row>
          </ContentBox>
          <Tip text={dayjs(createdAt).format('llll')}>
            <ActivityDate>
              {dayjs(createdAt).format('MMM D, h:mm A')}
            </ActivityDate>
          </Tip>
        </FlexCenterContent>
      </ActivityRow>
    );
  }

  render() {
    const { list, loading } = this.props;
    return (
      <ActivityContent isEmpty={!list.length}>
        <DataWithLoader
          loading={loading}
          count={list?.length || 0}
          data={
            <Timeline>
              {(list || []).map(movement => this.renderRow(movement))}
            </Timeline>
          }
          emptyText="No movements of user"
          emptyImage="/images/actions/5.svg"
        />
      </ActivityContent>
    );
  }
}

export default UserMovementForm;
