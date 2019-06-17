import { Details, UserCounter } from 'modules/boards/components/portable';
import { EditForm } from 'modules/boards/containers/editForm';
import { ItemContainer } from 'modules/boards/styles/common';
import { Content } from 'modules/boards/styles/stage';
import { IOptions } from 'modules/boards/types';
import { renderDate } from 'modules/boards/utils';
import { renderAmount } from 'modules/boards/utils';
import { ModalTrigger } from 'modules/common/components';
import { colors } from 'modules/common/styles';
import { __ } from 'modules/common/utils';
import * as React from 'react';
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

class Deal extends React.Component<Props, { isFormVisible: boolean }> {
  renderFormTrigger = (trigger: React.ReactNode) => {
    const { item, onAdd, onRemove, onUpdate, options } = this.props;

    const content = props => (
      <EditForm
        {...props}
        options={options}
        stageId={item.stageId}
        itemId={item._id}
        onAdd={onAdd}
        onRemove={onRemove}
        onUpdate={onUpdate}
      />
    );

    return (
      <ModalTrigger
        title="Edit deal"
        trigger={trigger}
        size="lg"
        content={content}
      />
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

    const content = (
      <ItemContainer>
        {this.renderDealStatus(item.stage)}
        <Content>
          <SpaceContent>
            <h5>{item.name}</h5>
            {renderDate(item.closeDate)}
          </SpaceContent>
          <Details color="#63D2D6" items={products} />
          <Details color="#F7CE53" items={item.customers || []} />
          <Details color="#EA475D" items={item.companies || []} />
        </Content>
        <PriceContainer>
          {renderAmount(item.amount)}

          <Right>
            <UserCounter users={item.assignedUsers || []} />
          </Right>
        </PriceContainer>

        <Footer>
          {__('Last updated')}:<Right>{renderDate(item.modifiedAt)}</Right>
        </Footer>
      </ItemContainer>
    );

    return this.renderFormTrigger(content);
  }
}

export default Deal;
