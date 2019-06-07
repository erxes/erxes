import { EmptyState, Icon, ModalTrigger } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { PortableDeal } from 'modules/deals/components';
import { Sidebar } from 'modules/layout/components';
import { SectionContainer } from 'modules/layout/styles';
import { PortableTicket } from 'modules/tickets/components';
import * as React from 'react';
import { AddItem } from '.';
import { IOptions, Item, ItemParams } from '../../types';

type Props = {
  options: IOptions;
  items: Item[];
  customerIds?: string[];
  companyIds?: string[];
  saveItem: (doc: ItemParams, callback: () => void, item?: Item) => void;
  onChangeItems: () => void;
  isOpen?: boolean;
};

class PortableItems extends React.Component<Props> {
  private ITEMS;

  constructor(props) {
    super(props);

    this.ITEMS = {
      deal: PortableDeal,
      ticket: PortableTicket
    };
  }

  renderItems = () => {
    const { onChangeItems, items, options } = this.props;

    if (items.length === 0) {
      return <EmptyState icon="piggy-bank" text={`No ${options.type}`} />;
    }

    const PortableItem = this.ITEMS[options.type];

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

    const { saveItem, customerIds, companyIds, isOpen, options } = this.props;

    const trigger = (
      <a>
        <Icon icon="add" />
      </a>
    );

    const content = props => (
      <AddItem
        options={options}
        {...props}
        saveItem={saveItem}
        customerIds={customerIds}
        companyIds={companyIds}
        showSelect={true}
      />
    );

    const quickButtons = (
      <ModalTrigger
        title={options.texts.addText}
        trigger={trigger}
        content={content}
      />
    );

    return (
      <Section>
        <Title>{__(options.title)}</Title>

        <QuickButtons isSidebarOpen={isOpen}>{quickButtons}</QuickButtons>

        <SectionContainer>{this.renderItems()}</SectionContainer>
      </Section>
    );
  }
}

export default PortableItems;
