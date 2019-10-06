import dayjs from 'dayjs';
import { PriorityIndicator } from 'modules/boards/components/editForm';
import EditForm from 'modules/boards/containers/editForm/EditForm';
import { ItemDate } from 'modules/boards/styles/common';
import {
  Footer,
  Left,
  PriceContainer,
  Right
} from 'modules/boards/styles/item';
import { Content } from 'modules/boards/styles/stage';
import { IOptions } from 'modules/boards/types';
import { renderPriority } from 'modules/boards/utils';
import { __, getUserAvatar } from 'modules/common/utils';
import React from 'react';
import { ScoreAmount } from '../styles';
import { IGrowthHack } from '../types';
import Score from './Score';

type Props = {
  stageId: string;
  item: IGrowthHack;
  beforePopupClose: () => void;
  onClick: () => void;
  options: IOptions;
};

export default class GrowthHackItem extends React.PureComponent<Props> {
  renderDate(date) {
    if (!date) {
      return null;
    }

    return <ItemDate>{dayjs(date).format('MMM D, h:mm a')}</ItemDate>;
  }

  renderForm = () => {
    const { stageId, item, options, beforePopupClose } = this.props;

    return (
      <EditForm
        beforePopupClose={beforePopupClose}
        options={options}
        stageId={stageId}
        itemId={item._id}
        hideHeader={true}
      />
    );
  };

  renderHackStage() {
    const { hackStages = [] } = this.props.item;

    return hackStages.map(i => (
      <div key={i}>
        <PriorityIndicator value={i} />
        {i}
      </div>
    ));
  }

  render() {
    const { item, onClick } = this.props;
    const {
      scoringType,
      reach = 0,
      impact = 0,
      confidence = 0,
      ease = 0
    } = item;

    return (
      <>
        <Content onClick={onClick}>
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
            <Left>{this.renderHackStage()}</Left>
            <Right>
              {(item.assignedUsers || []).map((user, index) => (
                <img
                  alt="Avatar"
                  key={index}
                  src={getUserAvatar(user)}
                  width="22px"
                  height="22px"
                  style={{ marginLeft: '2px', borderRadius: '11px' }}
                />
              ))}
            </Right>
          </PriceContainer>

          <Footer>
            {__('Last updated')}:
            <Right>{this.renderDate(item.modifiedAt)}</Right>
          </Footer>
        </Content>
        {this.renderForm()}
      </>
    );
  }
}
