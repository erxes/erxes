import { ItemsWrapper } from '../../styles/item';
import Box from '@erxes/ui/src/components/Box';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { ButtonRelated } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';
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
  mainTypeName?: string;
  relType?: string;
  hideQuickButtons?: boolean;
  onChangeItem: () => void;
};

class Items extends React.Component<Props, { openItemId?: string }> {
  constructor(props) {
    super(props);

    this.state = {
      openItemId: ''
    };
  }

  onItemClick = (item: IItem) => {
    this.setState({ openItemId: item._id });
  };

  beforePopupClose = () => {
    this.setState({ openItemId: '' });
  };

  renderItems = () => {
    const { openItemId } = this.state;
    const { onChangeItem, items, data } = this.props;

    if (items.length === 0) {
      return <EmptyState icon="folder-2" text={`No ${data.options.type}`} />;
    }

    const Item = data.options.Item;

    return (
      <ItemsWrapper>
        {items.map((item, index) => (
          <Item
            options={data.options}
            key={index}
            item={item}
            beforePopupClose={this.beforePopupClose}
            isFormVisible={item._id === openItemId}
            onClick={this.onItemClick.bind(this, item)}
            onAdd={onChangeItem}
            onUpdate={onChangeItem}
            onRemove={onChangeItem}
            portable={true}
          />
        ))}
      </ItemsWrapper>
    );
  };

  render() {
    const {
      mainType,
      mainTypeId,
      mainTypeName,
      data,
      onChangeItem,
      items,
      relType,
      hideQuickButtons
    } = this.props;

    const trigger = (
      <button>
        <Icon icon="plus-circle" />
      </button>
    );

    const relTrigger = (
      <ButtonRelated>
        <span>{__('See related ' + data.options.title + '..')}</span>
      </ButtonRelated>
    );

    const content = props => (
      <ItemChooser
        {...props}
        data={{
          name: mainTypeName,
          options: data.options,
          mainType,
          mainTypeId,
          items
        }}
        callback={onChangeItem}
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
        callback={onChangeItem}
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

    const boxProps = {
      extraButtons: !hideQuickButtons && quickButtons,
      title: __(data.options.title),
      name: relType && `show${relType}`
    };

    return (
      <Box {...boxProps}>
        {this.renderItems()}
        {mainTypeId && mainType && relQuickButtons}
      </Box>
    );
  }
}

export default Items;
