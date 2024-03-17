import {
  AddNew,
  ListBody,
  Footer,
  ListContainer,
  Header,
  ListStageFooter,
  StageTitle,
  GroupTitle,
  ColumnLastChild
} from '../../styles/stage';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { AddForm } from '../../containers/portable';
import { IItem, IOptions } from '../../types';
import Table from '@erxes/ui/src/components/table';
import ListItemRow from './ListItemRow';
import * as routerUtils from '@erxes/ui/src/utils/router';
import Item from './Item';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';

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
      <GroupTitle>
        {groupObj.name.charAt(0).toUpperCase() + groupObj.name.slice(1)}
        <span>{this.props.itemsTotalCount}</span>
      </GroupTitle>
    );
  };

  renderTable = () => {
    const { groupObj, items, options, groupType } = this.props;

    if (!groupObj) {
      return <EmptyState icon="grid" text="No stage" size="small" />;
    }

    if (!items || items.length === 0) {
      return <EmptyState icon="grid" text="No item" size="small" />;
    }

    return (
      <>
        <Table hover={true} bordered={true}>
          <thead>
            <tr>
              <th>{__('Card Title')}</th>
              <th>{groupType === 'stage' ? __('Label') : __('Stage')}</th>
              {(groupType === 'assignee' || groupType === 'dueDate') && (
                <th>{__('Label')}</th>
              )}
              <th>{groupType === 'priority' ? __('Label') : __('Priority')}</th>
              <th>{__('Due Date')}</th>
              {groupType !== 'assignee' && <th>{__('Assignee')}</th>}
              {options.type === 'deal' ||
                (options.type === 'purchase' && <th>{__('Products')}</th>)}
              <th>{__('Associated Customer')}</th>
              <ColumnLastChild>{__('Associated Company')}</ColumnLastChild>
            </tr>
          </thead>
          <tbody id="groupByList">
            {items.map((item: any) => (
              <Item
                key={item._id}
                item={item}
                onClick={() => this.onClick(item)}
                beforePopupClose={this.beforePopupClose}
                options={options}
                groupType={groupType}
                groupObj={groupObj}
                itemRowComponent={ListItemRow}
              />
            ))}
          </tbody>
        </Table>
      </>
    );
  };

  render() {
    const { groupType } = this.props;

    return (
      <ListContainer>
        <Header>
          <StageTitle>{this.renderHeader()}</StageTitle>
        </Header>
        <ListBody onScroll={this.onScroll}>{this.renderTable()}</ListBody>
        {groupType === 'stage' && (
          <Footer>{this.renderAddItemTrigger()}</Footer>
        )}
      </ListContainer>
    );
  }
}

export default withRouter<Props>(ListGroupBy);
