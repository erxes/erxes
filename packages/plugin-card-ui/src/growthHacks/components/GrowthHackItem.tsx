import Labels from '@erxes/ui-cards/src/boards/components/label/Labels';
import ItemFooter from '@erxes/ui-cards/src/boards/components/portable/ItemFooter';
import EditForm from '@erxes/ui-cards/src/boards/containers/editForm/EditForm';
import { ItemContainer } from '@erxes/ui-cards/src/boards/styles/common';
import {
  Left,
  PriceContainer,
  Right
} from '@erxes/ui-cards/src/boards/styles/item';
import { Content } from '@erxes/ui-cards/src/boards/styles/stage';
import { IOptions } from '@erxes/ui-cards/src/boards/types';
import { renderPriority } from '@erxes/ui-cards/src/boards/utils';
import Participators from '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/Participators';
import Icon from '@erxes/ui/src/components/Icon';
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

        <ItemFooter item={item} />
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
