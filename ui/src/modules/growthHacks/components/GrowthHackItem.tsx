import dayjs from 'dayjs';
import Labels from 'modules/boards/components/label/Labels';
import EditForm from 'modules/boards/containers/editForm/EditForm';
import { ItemContainer, ItemDate } from 'modules/boards/styles/common';
import {
  Footer,
  Left,
  PriceContainer,
  Right
} from 'modules/boards/styles/item';
import { Content } from 'modules/boards/styles/stage';
import { IOptions } from 'modules/boards/types';
import { renderPriority } from 'modules/boards/utils';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import Participators from 'modules/inbox/components/conversationDetail/workarea/Participators';
import React from 'react';
import { ScoreAmount, Vote } from '../styles';
import { IGrowthHack } from '../types';
import Score from './Score';

type Props = {
  stageId: string;
  item: IGrowthHack;
  beforePopupClose: () => void;
  onClick: () => void;
  options: IOptions;
  isFormVisible: boolean;
  portable?: boolean;
};

export default class GrowthHackItem extends React.PureComponent<Props> {
  renderDate(date) {
    if (!date) {
      return null;
    }

    return <ItemDate>{dayjs(date).format('MMM D, h:mm a')}</ItemDate>;
  }

  renderForm = () => {
    const { stageId, item, isFormVisible } = this.props;

    if (!isFormVisible) {
      return null;
    }

    return (
      <EditForm
        {...this.props}
        stageId={stageId || item.stageId}
        itemId={item._id}
        isPopupVisible={isFormVisible}
        hideHeader={true}
      />
    );
  };

  renderContent() {
    const { item } = this.props;
    const {
      scoringType,
      reach = 0,
      impact = 0,
      confidence = 0,
      ease = 0
    } = item;

    return (
      <>
        <h5>
          {renderPriority(item.priority)}
          {item.name}
        </h5>
        <ScoreAmount>
          <Score.Amount
            type={scoringType}
            r={reach}
            i={impact}
            c={confidence}
            e={ease}
          />
        </ScoreAmount>

        <PriceContainer>
          <Left>
            <Vote>
              <Icon icon="thumbs-up" />
              {item.voteCount}
            </Vote>
          </Left>
          <Right>
            <Participators participatedUsers={item.assignedUsers} limit={3} />
          </Right>
        </PriceContainer>

        <Footer>
          {__('Last updated')}:<Right>{this.renderDate(item.modifiedAt)}</Right>
        </Footer>
      </>
    );
  }

  render() {
    const { item, onClick, portable } = this.props;

    if (portable) {
      return (
        <>
          <ItemContainer onClick={onClick}>
            <Content>{this.renderContent()}</Content>
          </ItemContainer>
          {this.renderForm()}
        </>
      );
    }

    return (
      <>
        <Labels labels={item.labels} indicator={true} />
        <Content onClick={onClick} type="growthHack">
          {this.renderContent()}
        </Content>
        {this.renderForm()}
      </>
    );
  }
}
