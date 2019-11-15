import dayjs from 'dayjs';
import Details from 'modules/boards/components/Details';
import DueDateLabel from 'modules/boards/components/DueDateLabel';
import EditForm from 'modules/boards/containers/editForm/EditForm';
import { ItemContainer, ItemDate } from 'modules/boards/styles/common';
import {
  Footer,
  PriceContainer,
  Right,
  Status
} from 'modules/boards/styles/item';
import { Content } from 'modules/boards/styles/stage';
import { renderAmount, renderPriority } from 'modules/boards/utils';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import Participators from 'modules/inbox/components/conversationDetail/workarea/Participators';
import React from 'react';

import Labels from 'modules/boards/components/label/Labels';
import { IOptions } from 'modules/boards/types';
import Tip from 'modules/common/components/Tip';
import { colors } from 'modules/common/styles';
import { IDeal } from '../types';

type Props = {
  stageId?: string;
  item: IDeal;
  beforePopupClose?: () => void;
  onClick?: () => void;
  options?: IOptions;
  isFormVisible?: boolean;
  portable?: boolean;
  onAdd?: (stageId: string, item: IDeal) => void;
  onRemove?: (dealId: string, stageId: string) => void;
  onUpdate?: (item: IDeal) => void;
};

class DealItem extends React.PureComponent<Props, { isPopupVisible: boolean }> {
  constructor(props) {
    super(props);

    this.state = {
      isPopupVisible: props.isFormVisible || false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isFormVisible !== this.props.isFormVisible) {
      this.setState({
        isPopupVisible: nextProps.isFormVisible
      });
    }
  }

  beforePopupClose = () => {
    const { portable, beforePopupClose } = this.props;

    if (portable) {
      this.setState({ isPopupVisible: false });
    } else {
      if (beforePopupClose) {
        beforePopupClose();
      }
    }
  };

  renderForm = () => {
    const { stageId, item } = this.props;
    const { isPopupVisible } = this.state;

    if (!isPopupVisible) {
      return null;
    }

    return (
      <EditForm
        {...this.props}
        stageId={stageId || item.stageId}
        itemId={item._id}
        hideHeader={true}
        beforePopupClose={this.beforePopupClose}
        isPopupVisible={isPopupVisible}
      />
    );
  };

  renderDate(date, format = 'YYYY-MM-DD') {
    if (!date) {
      return null;
    }

    return (
      <Tip text={dayjs(date).format(format)}>
        <ItemDate>{dayjs(date).format('lll')}</ItemDate>
      </Tip>
    );
  }

  renderStatusLabel(text, color) {
    return (
      <Status>
        <span style={{ backgroundColor: color }}>{__(text)}</span>
      </Status>
    );
  }

  renderStatus(stage) {
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

  renderContent() {
    const { item } = this.props;
    const products = (item.products || []).map(p => p.product);
    const { customers, companies, closeDate, isComplete } = item;

    return (
      <>
        <h5>
          {renderPriority(item.priority)}
          {item.name}
        </h5>

        <Details color="#63D2D6" items={products} />
        <Details color="#F7CE53" items={customers || []} />
        <Details color="#EA475D" items={companies || []} />

        <PriceContainer>
          {renderAmount(item.amount)}

          <Right>
            <Participators participatedUsers={item.assignedUsers} limit={3} />
          </Right>
        </PriceContainer>

        <DueDateLabel closeDate={closeDate} isComplete={isComplete} />

        <Footer>
          {item.isWatched ? <Icon icon="eye" /> : __('Last updated')}
          <Right>{this.renderDate(item.modifiedAt)}</Right>
        </Footer>
      </>
    );
  }

  render() {
    const { item, portable } = this.props;

    if (portable) {
      const onClick = () => {
        this.setState({ isPopupVisible: true });
      };

      return (
        <>
          <ItemContainer onClick={onClick}>
            {this.renderStatus(item.stage)}
            <Content>{this.renderContent()}</Content>
          </ItemContainer>
          {this.renderForm()}
        </>
      );
    }

    return (
      <>
        <Labels labels={item.labels} indicator={true} />
        <Content onClick={this.props.onClick}>{this.renderContent()}</Content>
        {this.renderForm()}
      </>
    );
  }
}

export default DealItem;
