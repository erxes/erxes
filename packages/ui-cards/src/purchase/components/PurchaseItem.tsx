import { PriceContainer, Right, Status } from '../../boards/styles/item';
import { renderAmount, renderPriority } from '../../boards/utils';

import Assignees from '../../boards/components/Assignees';
import { Content } from '../../boards/styles/stage';
import Details from '../../boards/components/Details';
import DueDateLabel from '../../boards/components/DueDateLabel';
import EditForm from '../../boards/containers/editForm/EditForm';
import { IPurchase } from '../types';
import { IOptions } from '../../boards/types';
import { ItemContainer } from '../../boards/styles/common';
import ItemFooter from '../../boards/components/portable/ItemFooter';
import Labels from '../../boards/components/label/Labels';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import { colors } from '@erxes/ui/src/styles';
import ItemArchivedStatus from '../../boards/components/portable/ItemArchivedStatus';

type Props = {
  stageId?: string;
  item: IPurchase;
  beforePopupClose?: () => void;
  onClick?: () => void;
  options?: IOptions;
  isFormVisible?: boolean;
  portable?: boolean;
  onAdd?: (stageId: string, item: IPurchase) => void;
  onRemove?: (purchaseId: string, stageId: string) => void;
  onUpdate?: (item: IPurchase) => void;
};

class PurchaseItem extends React.PureComponent<Props> {
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
        hideHeader={true}
        isPopupVisible={isFormVisible}
      />
    );
  };

  renderStatusLabel(text, color) {
    const { item } = this.props;

    return (
      <Status>
        <span style={{ backgroundColor: color }}>{__(text)}</span>
        <ItemArchivedStatus
          status={item.status || 'active'}
          skipContainer={true}
        />
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

    const renderProduct = p => {
      p.product.quantity = p.quantity;
      p.product.uom = p.uom;

      return p.product;
    };

    const products = (item.products || [])
      .filter(p => p.tickUsed)
      .map(p => renderProduct(p));

    const exProducts = (item.products || [])
      .filter(p => !p.tickUsed)
      .map(p => renderProduct(p));

    const {
      customers,
      companies,
      closeDate,
      isComplete,
      customProperties
    } = item;

    return (
      <>
        <h5>
          {renderPriority(item.priority)}
          {item.name}
        </h5>

        <Details color="#63D2D6" items={products} />
        <Details color="#b49cf1" items={exProducts} />
        <Details color="#F7CE53" items={customers || []} />
        <Details color="#EA475D" items={companies || []} />
        <Details
          color={colors.colorCoreOrange}
          items={customProperties || []}
        />

        <PriceContainer>
          {renderAmount(item.amount)}

          <Right>
            <Assignees users={item.assignedUsers} />
          </Right>
        </PriceContainer>

        <DueDateLabel closeDate={closeDate} isComplete={isComplete} />

        <ItemFooter item={item} />
      </>
    );
  }

  render() {
    const { item, portable, onClick } = this.props;

    if (portable) {
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
        <Content onClick={onClick}>{this.renderContent()}</Content>
        {this.renderForm()}
      </>
    );
  }
}

export default PurchaseItem;
