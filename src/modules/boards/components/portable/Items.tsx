import EmptyState from 'modules/common/components/EmptyState';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { __ } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import { ButtonRelated, SectionContainer } from 'modules/layout/styles';
import React from 'react';
import { ItemChooser } from '../../containers/portable/';
import { IItem, IOptions } from '../../types';

type IData = {
  options: IOptions;
};
type Props = {
  data: IData;
  items: IItem[];
  mainType?: string;
  mainTypeId?: string;
  onChangeItems: () => void;
  isOpen?: boolean;
};

class Items extends React.Component<Props> {
  renderItems = () => {
    const { onChangeItems, items, data } = this.props;

    if (items.length === 0) {
      return <EmptyState icon="folder" text={`No ${data.options.type}`} />;
    }

    const PortableItem = data.options.PortableItem;

    return items.map((item, index) => (
      <PortableItem
        options={data.options}
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
      mainType,
      mainTypeId,
      isOpen,
      data,
      onChangeItems,
      items
    } = this.props;

    const trigger = (
      <button>
        <Icon icon="add" />
      </button>
    );

    const relTrigger = (
      <ButtonRelated>
        <button>{__('See related ' + data.options.title + '..')}</button>
      </ButtonRelated>
    );

    const content = props => (
      <ItemChooser
        {...props}
        data={{ options: data.options, mainType, mainTypeId, items }}
        callback={onChangeItems}
        showSelect={true}
      />
    );

    const relContent = props => (
      <ItemChooser
        {...props}
        data={{
          options: data.options,
          mainType,
          mainTypeId,
          items,
          isRelated: true
        }}
        callback={onChangeItems}
        showSelect={true}
      />
    );

    const quickButtons = (
      <ModalTrigger
        title={data.options.texts.addText}
        trigger={trigger}
        content={content}
        size="lg"
      />
    );

    const relQuickButtons = (
      <ModalTrigger
        title="Related Associate"
        trigger={relTrigger}
        size="lg"
        content={relContent}
      />
    );

    return (
      <Section>
        <Title>{__(data.options.title)}</Title>

        <QuickButtons isSidebarOpen={isOpen}>{quickButtons}</QuickButtons>

        <SectionContainer>{this.renderItems()}</SectionContainer>

        {mainTypeId && mainType && relQuickButtons}
      </Section>
    );
  }
}

export default Items;
