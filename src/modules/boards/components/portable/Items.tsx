import { EmptyState, Icon, ModalTrigger } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Sidebar } from 'modules/layout/components';
import { SectionContainer } from 'modules/layout/styles';
import React from 'react';
import { AddForm } from '../../containers/portable';
import { IItem, IOptions } from '../../types';

type Props = {
  options: IOptions;
  items: IItem[];
  customerIds?: string[];
  companyIds?: string[];
  onChangeItems: () => void;
  isOpen?: boolean;
};

class Items extends React.Component<Props> {
  renderItems = () => {
    const { onChangeItems, items, options } = this.props;

    if (items.length === 0) {
      return <EmptyState icon="folder" text={`No ${options.type}`} />;
    }

    const PortableItem = options.PortableItem;

    return items.map((item, index) => (
      <PortableItem
        options={options}
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

    const {
      customerIds,
      companyIds,
      isOpen,
      options,
      onChangeItems
    } = this.props;

    const trigger = (
      <button>
        <Icon icon="add" />
      </button>
    );

    const content = props => (
      <AddForm
        options={options}
        {...props}
        callback={onChangeItems}
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

export default Items;
