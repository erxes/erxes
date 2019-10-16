import dayjs from 'dayjs';
import Details from 'modules/boards/components/portable/Details';
import EditForm from 'modules/boards/containers/editForm/EditForm';
import { ItemContainer, ItemDate } from 'modules/boards/styles/common';
import { Content } from 'modules/boards/styles/stage';
import { IOptions } from 'modules/boards/types';
import { renderAmount } from 'modules/boards/utils';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { colors } from 'modules/common/styles';
import { __ } from 'modules/common/utils';
import { Participators } from 'modules/inbox/components/conversationDetail';
import React from 'react';
import {
  Footer,
  PriceContainer,
  Right,
  SpaceContent,
  Status
} from '../../boards/styles/item';
import { IDeal } from '../types';

type Props = {
  item: IDeal;
  options: IOptions;
  onAdd?: (stageId: string, item: IDeal) => void;
  onRemove?: (dealId: string, stageId: string) => void;
  onUpdate?: (item: IDeal) => void;
};

class Deal extends React.Component<Props, { isPopupVisible: boolean }> {
  constructor(props) {
    super(props);

    this.state = {
      isPopupVisible: false
    };
  }

  renderForm = () => {
    const { item, onAdd, onRemove, onUpdate, options } = this.props;

    const beforePopupClose = () => {
      this.setState({ isPopupVisible: false });
    };

    return (
      <EditForm
        {...this.props}
        options={options}
        stageId={item.stageId}
        itemId={item._id}
        onAdd={onAdd}
        onRemove={onRemove}
        onUpdate={onUpdate}
        isPopupVisible={this.state.isPopupVisible}
        beforePopupClose={beforePopupClose}
      />
    );
  };

  renderDate = (date, format = 'YYYY-MM-DD') => {
    if (!date) {
      return null;
    }

    return (
      <Tip text={dayjs(date).format(format)}>
        <ItemDate>{dayjs(date).format('lll')}</ItemDate>
      </Tip>
    );
  };

  renderStatusLabel(text, color) {
    return (
      <Status>
        <span style={{ backgroundColor: color }}>{__(text)}</span>
      </Status>
    );
  }

  renderDealStatus(stage) {
    if (!stage) {
      return null;
    }

    if (stage.probability === 'Lost') {
      return this.renderStatusLabel('Lost', colors.colorCoreRed);
    }

    if (stage.probability === 'Won') {
      return this.renderStatusLabel('Won', colors.colorCoreGreen);
    }

    return this.renderStatusLabel('In Progress', colors.colorCoreBlue);
  }

  render() {
    const { item } = this.props;
    const products = (item.products || []).map(p => p.product);

    const onClick = () => {
      this.setState({ isPopupVisible: true });
    };

    return (
      <>
        <ItemContainer onClick={onClick}>
          {this.renderDealStatus(item.stage)}
          <Content>
            <SpaceContent>
              <h5>{item.name}</h5>
              {this.renderDate(item.closeDate)}
            </SpaceContent>
            <Details color="#63D2D6" items={products} />
            <Details color="#F7CE53" items={item.customers || []} />
            <Details color="#EA475D" items={item.companies || []} />
          </Content>
          <PriceContainer>
            {renderAmount(item.amount)}

            <Right>
              <Participators
                participatedUsers={item.assignedUsers || []}
                limit={3}
              />
            </Right>
          </PriceContainer>

          <Footer>
            {item.isWatched ? <Icon icon="eye" /> : __('Last updated')}
            <Right>{this.renderDate(item.modifiedAt)}</Right>
          </Footer>
        </ItemContainer>
        {this.renderForm()}
      </>
    );
  }
}

export default Deal;
