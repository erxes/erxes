import { EmptyState, Icon, ModalTrigger } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { PortableDeal } from 'modules/deals/components';
import { Sidebar } from 'modules/layout/components';
import { SectionContainer } from 'modules/layout/styles';
import * as React from 'react';
import { AddItem } from '.';
import { STAGE_CONSTANTS } from '../../constants';
import { Item, ItemParams } from '../../types';

type Props = {
  type: string;
  items: Item[];
  customerId?: string;
  companyId?: string;
  saveItem: (doc: ItemParams, callback: () => void, deal?: Item) => void;
  onChangeItems: () => void;
  isOpen?: boolean;
};

class PortableItems extends React.Component<Props> {
  private ITEMS;

  constructor(props) {
    super(props);

    this.ITEMS = {
      deal: PortableDeal
    };
  }

  renderItems = () => {
    const { onChangeItems, items, type } = this.props;

    if (items.length === 0) {
      return <EmptyState icon="piggy-bank" text={`No ${type}`} />;
    }

    const PortableItem = this.ITEMS[type];

    return items.map((item, index) => (
      <PortableItem
        key={index}
        item={item}
        onAdd={onChangeItems}
        onUpdate={onChangeItems}
        onRemove={onChangeItems}
      />
    ));
  };

  render() {
    const { Section } = Sidebar;
    const { Title, QuickButtons } = Section;

    const { saveItem, customerId, companyId, isOpen, type } = this.props;

    const trigger = (
      <a>
        <Icon icon="add" />
      </a>
    );

    const content = props => (
      <AddItem
        type={type}
        {...props}
        saveItem={saveItem}
        customerId={customerId}
        companyId={companyId}
        showSelect={true}
      />
    );

    const constant = STAGE_CONSTANTS[type];

    const quickButtons = (
      <ModalTrigger
        title={constant.addText}
        trigger={trigger}
        content={content}
      />
    );

    return (
      <Section>
        <Title>{__(constant.title)}</Title>

        <QuickButtons isSidebarOpen={isOpen}>{quickButtons}</QuickButtons>

        <SectionContainer>{this.renderItems()}</SectionContainer>
      </Section>
    );
  }
}

export default PortableItems;
