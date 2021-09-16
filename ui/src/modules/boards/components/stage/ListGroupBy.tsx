import {
  AddNew,
  ListBody,
  Footer,
  ListContainer,
  Header,
  StageFooter,
  StageTitle,
  ActionButton,
  ActionList,
  GroupTitle
} from 'modules/boards/styles/stage';
import EmptyState from 'modules/common/components/EmptyState';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { __ } from 'modules/common/utils';
import React from 'react';
import { AddForm } from '../../containers/portable';
import { IItem, IOptions } from '../../types';
import Table from 'modules/common/components/table';
import ListItemRow from './ListItemRow';
import routerUtils from 'modules/common/utils/router';
import Item from 'modules/boards/components/stage/Item';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from 'modules/common/types';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import NameCard from 'modules/common/components/nameCard/NameCard';

type Props = {
  index: number;
  length: number;
  items: IItem[];
  itemsTotalCount: number;
  options: IOptions;
  loadMore: () => void;
  refetch: () => void;
  onAddItem: (stageId: string, item: IItem) => void;
  onRemoveItem: (itemId: string, stageId: string) => void;
  archiveItems: () => void;
  archiveList: () => void;
  removeStage: (stageId: string) => void;
  groupObj: any;
  groupType: string;
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
    const { groupObj } = this.props;

    const archiveList = () => {
      this.props.archiveList();
      this.onClosePopover();
    };

    const archiveItems = () => {
      this.props.archiveItems();
      this.onClosePopover();
    };

    const removeStage = () => {
      this.props.removeStage(groupObj._id);
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
    if (this.props.groupType === 'stage') {
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
    return null;
  }

  renderAddItemTrigger() {
    const { options, groupObj, onAddItem } = this.props;
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
      callback: (item: IItem) => onAddItem(groupObj._id, item),
      stageId: groupObj._id,
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
    const { groupObj, items, options, groupType } = this.props;

    if (!items) {
      return <EmptyState icon="columns-1" text="No stage" size="small" />;
    }

    if (!groupObj) {
      return <EmptyState icon="columns-1" text="No stage" size="small" />;
    }

    return (
      <ListContainer>
        <Header>
          <StageTitle>
            <GroupTitle>
              {groupType === 'assignee' ? (
                <NameCard user={groupObj} avatarSize={30} singleLine={true} />
              ) : (
                groupObj.name.charAt(0).toUpperCase() + groupObj.name.slice(1)
              )}

              <span>{this.props.itemsTotalCount}</span>
            </GroupTitle>
            {this.renderCtrl()}
          </StageTitle>
        </Header>
        <ListBody onScroll={this.onScroll}>
          <Table whiteSpace="nowrap" hover={true} bordered={true}>
            <thead>
              <tr>
                <th>{__('Card Title')}</th>
                <th>{groupType === 'stage' ? __('Label') : __('Stage')}</th>
                {groupType === 'assignee' || groupType === 'dueDate' ? (
                  <th>{__('Label')}</th>
                ) : (
                  ''
                )}
                <th>
                  {groupType === 'priority' ? __('Label') : __('Priority')}
                </th>
                <th>{__('Due Date')}</th>
                {groupType === 'assignee' ? '' : <th>{__('Assignee')}</th>}
                <th>{__('Associated Customer')}</th>
                <th>{__('Associated Company')}</th>
              </tr>
            </thead>
            <tbody id="stagelist">
              {items.map((item: any) => (
                <Item
                  key={item._id}
                  item={item}
                  onClick={() => this.onClick(item)}
                  beforePopupClose={this.beforePopupClose}
                  options={options}
                  groupType={groupType}
                  itemComponent={ListItemRow}
                />
              ))}
            </tbody>
          </Table>
        </ListBody>
        {groupType === 'stage' ? (
          <Footer>{this.renderAddItemTrigger()}</Footer>
        ) : (
          ''
        )}
      </ListContainer>
    );
  }
}

export default withRouter<Props>(ListStage);
