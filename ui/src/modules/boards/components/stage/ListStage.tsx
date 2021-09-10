import {
  AddNew,
  ListBody,
  Footer,
  ListContainer,
  Header,
  HeaderAmount,
  StageFooter,
  StageTitle,
  ActionButton,
  ActionList
} from 'modules/boards/styles/stage';
import EmptyState from 'modules/common/components/EmptyState';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { __ } from 'modules/common/utils';
import React from 'react';
import { AddForm } from '../../containers/portable';
import { IItem, IOptions, IStage } from '../../types';
import { renderAmount } from '../../utils';
import Table from 'modules/common/components/table';
import ListItemRow from './ListItemRow';
import routerUtils from 'modules/common/utils/router';
import Item from 'modules/boards/components/stage/Item';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from 'modules/common/types';
import { OverlayTrigger, Popover } from 'react-bootstrap';

type Props = {
  index: number;
  stage: IStage;
  length: number;
  items: IItem[];
  options: IOptions;
  loadMore: () => void;
  refetch: () => void;
  onAddItem: (stageId: string, item: IItem) => void;
  onRemoveItem: (itemId: string, stageId: string) => void;
  archiveItems: () => void;
  archiveList: () => void;
  removeStage: (stageId: string) => void;
} & IRouterProps;

type State = {
  showSortOptions: boolean;
};
class ListStage extends React.Component<Props, State> {
  private overlayTrigger;

  constructor(props: Props) {
    super(props);

    this.state = { showSortOptions: false };
  }

  onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const bottom =
      Math.round(target.scrollHeight - target.scrollTop) <= target.clientHeight;

    if (bottom) {
      this.props.loadMore();
    }
  };

  renderPopover() {
    const { stage } = this.props;

    const archiveList = () => {
      this.props.archiveList();
      this.onClosePopover();
    };

    const archiveItems = () => {
      this.props.archiveItems();
      this.onClosePopover();
    };

    const removeStage = () => {
      this.props.removeStage(stage._id);
      this.onClosePopover();
    };

    return (
      <Popover id="listStage-popover" placement="auto">
        <ActionList>
          <>
            <li onClick={archiveItems} key="archive-items">
              {__('Archive All Cards in This List')}
            </li>
            <li onClick={archiveList} key="archive-list">
              {__('Archive This List')}
            </li>
            <li onClick={removeStage} key="remove-stage">
              {__('Remove stage')}
            </li>
          </>
        </ActionList>
      </Popover>
    );
  }

  renderCtrl() {
    return (
      <OverlayTrigger
        ref={overlayTrigger => {
          this.overlayTrigger = overlayTrigger;
        }}
        trigger="click"
        placement="bottom-start"
        rootClose={true}
        container={this}
        overlay={this.renderPopover()}
      >
        <ActionButton>
          <Icon icon="ellipsis-h" />
        </ActionButton>
      </OverlayTrigger>
    );
  }

  renderAddItemTrigger() {
    const { options, stage, onAddItem } = this.props;
    const addText = options.texts.addText;

    const trigger = (
      <StageFooter>
        <AddNew>
          <Icon icon="plus-1" />
          {__(addText)}
        </AddNew>
      </StageFooter>
    );

    const formProps = {
      options,
      showSelect: false,
      callback: (item: IItem) => onAddItem(stage._id, item),
      stageId: stage._id,
      aboveItemId: ''
    };

    const content = props => <AddForm {...props} {...formProps} />;

    return <ModalTrigger title={addText} trigger={trigger} content={content} />;
  }

  onClosePopover = () => {
    this.overlayTrigger.hide();
  };

  toggleSortOptions = () => {
    const { showSortOptions } = this.state;

    this.setState({ showSortOptions: !showSortOptions });
  };

  onClick = (item: any) => {
    const { history } = this.props;

    routerUtils.setParams(history, { itemId: item._id, key: '' });
  };

  beforePopupClose = () => {
    this.props.refetch();
  };

  render() {
    const { stage, items, options } = this.props;

    if (!items) {
      return <EmptyState icon="columns-1" text="No stage" size="small" />;
    }

    if (!stage) {
      return <EmptyState icon="columns-1" text="No stage" size="small" />;
    }

    return (
      <ListContainer>
        <Header>
          <StageTitle>
            <div>
              {stage.name}
              <span>{stage.itemsTotalCount}</span>
            </div>
            {this.renderCtrl()}
          </StageTitle>
          <HeaderAmount>{renderAmount(stage.amount)}</HeaderAmount>
        </Header>
        <ListBody onScroll={this.onScroll}>
          <Table whiteSpace="nowrap" hover={true} bordered={true}>
            <thead>
              <tr>
                <th>{__('Card Title')}</th>
                <th>{__('Label')}</th>
                <th>{__('Priority')}</th>
                <th>{__('Due Date')}</th>
                <th>{__('Assignee')}</th>
                <th>{__('Associated Customer')}</th>
                <th>{__('Associated Company')}</th>
              </tr>
            </thead>
            <tbody id="stagelist">
              {items.map((item: any) => (
                <Item
                  key={item._id}
                  stageId={stage._id}
                  item={item}
                  onClick={() => this.onClick(item)}
                  beforePopupClose={this.beforePopupClose}
                  options={options}
                  itemComponent={ListItemRow}
                />
              ))}
            </tbody>
          </Table>
        </ListBody>
        <Footer>{this.renderAddItemTrigger()}</Footer>
      </ListContainer>
    );
  }
}

export default withRouter<Props>(ListStage);
