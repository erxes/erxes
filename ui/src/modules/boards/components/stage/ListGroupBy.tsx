import {
  AddNew,
  ListBody,
  Footer,
  ListContainer,
  Header,
  ListStageFooter,
  StageTitle,
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
  groupObj: any;
  groupType: string;
} & IRouterProps;

class ListGroupBy extends React.Component<Props> {
  onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const bottom =
      Math.round(target.scrollHeight - target.scrollTop) <= target.clientHeight;

    if (bottom) {
      this.props.loadMore();
    }
  };

  renderAddItemTrigger() {
    const { options, groupObj, onAddItem } = this.props;
    const addText = options.texts.addText;

    const trigger = (
      <ListStageFooter>
        <AddNew>
          <Icon icon="plus-1" />
          {__(addText)}
        </AddNew>
      </ListStageFooter>
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

  onClick = (item: any) => {
    const { history, groupObj } = this.props;

    routerUtils.setParams(history, {
      itemId: `${item._id}${groupObj._id}`,
      key: ''
    });
  };

  beforePopupClose = () => {
    this.props.refetch();
  };

  renderHeader = () => {
    const { groupType, groupObj } = this.props;

    if (groupType === 'assignee') {
      return <NameCard user={groupObj} avatarSize={30} />;
    }

    return (
      <>
        {groupObj.name.charAt(0).toUpperCase() + groupObj.name.slice(1)}
        <p>{this.props.itemsTotalCount}</p>
      </>
    );
  };

  render() {
    const { groupObj, items, options, groupType } = this.props;

    if (!groupObj) {
      return <EmptyState icon="grid" text="No stage" size="small" />;
    }

    return (
      <ListContainer>
        <Header>
          <StageTitle>
            <GroupTitle>{this.renderHeader()}</GroupTitle>
          </StageTitle>
        </Header>
        <ListBody onScroll={this.onScroll}>
          {!items || items.length === 0 ? (
            <EmptyState icon="grid" text="No item" size="small" />
          ) : (
            <Table whiteSpace="nowrap" hover={true} bordered={true}>
              <thead>
                <tr>
                  <th>{__('Card Title')}</th>
                  <th>{groupType === 'stage' ? __('Label') : __('Stage')}</th>
                  {(groupType === 'assignee' || groupType === 'dueDate') && (
                    <th>{__('Label')}</th>
                  )}
                  <th>
                    {groupType === 'priority' ? __('Label') : __('Priority')}
                  </th>
                  <th>{__('Due Date')}</th>
                  {groupType !== 'assignee' && <th>{__('Assignee')}</th>}
                  <th>{__('Associated Customer')}</th>
                  <th>{__('Associated Company')}</th>
                </tr>
              </thead>
              <tbody id="groupbylist">
                {items.map((item: any) => (
                  <Item
                    key={item._id}
                    item={item}
                    onClick={() => this.onClick(item)}
                    beforePopupClose={this.beforePopupClose}
                    options={options}
                    groupType={groupType}
                    groupObj={groupObj}
                    itemComponent={ListItemRow}
                  />
                ))}
              </tbody>
            </Table>
          )}
        </ListBody>
        {groupType === 'stage' && (
          <Footer>{this.renderAddItemTrigger()}</Footer>
        )}
      </ListContainer>
    );
  }
}

export default withRouter<Props>(ListGroupBy);
