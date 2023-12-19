import {
  ActionButtons,
  FlexBetween,
  ItemCount
} from '@erxes/ui-settings/src/styles';
import {
  CollapsibleListWrapper,
  FlexRow,
  ItemText,
  SidebarListItem,
  ToggleIcon
} from './styles';

import EmptyState from '../EmptyState';
import Icon from '../Icon';
import { Link } from 'react-router-dom';
import React from 'react';
import { SidebarList } from '../../layout/styles';
import Spinner from '../Spinner';

type Props = {
  items: any[];
  loading?: boolean;
  className?: string;
  treeView?: boolean;
  linkToText?: string;
  isProductCategory?: boolean;
  queryParams?: any;
  isTeam?: boolean;
  queryParamName?: string;
  level?: number;
  icon?: string;

  // hooks
  onClick?: (id: string) => void;
  editAction?: (item: any) => void;
  removeAction?: (item: any) => void;
  additionalActions?: (item: any) => any;
};

type State = {
  key: string;
  items: any[];
  parentIds: { [key: string]: boolean };
};

class CollapsibleList extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      key: '',
      items: props.items,
      parentIds: {}
    };
  }

  groupByParent = (array: any[]) => {
    const key = 'parentId';

    return array.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);

      return rv;
    }, {});
  };

  isActive = (id: string) => {
    const { queryParams, queryParamName } = this.props;

    const paramName = queryParamName || '';
    const currentGroup = queryParamName
      ? queryParams[paramName] || ''
      : queryParams.categoryId || '';

    return currentGroup === id;
  };

  onToggle = (id: string, isOpen: boolean) => {
    const parentIds = this.state.parentIds;
    parentIds[id] = !isOpen;

    this.setState({ parentIds });
  };

  renderIcons(item, hasChildren: boolean, isOpen: boolean) {
    if (!hasChildren) {
      return null;
    }

    return (
      <ToggleIcon
        onClick={this.onToggle.bind(this, item._id, isOpen)}
        type="list"
      >
        <Icon icon={isOpen ? 'angle-down' : 'angle-right'} size={18} />
      </ToggleIcon>
    );
  }

  renderActions = (item: any) => {
    const { editAction, removeAction, additionalActions } = this.props;

    if (!editAction || !removeAction) {
      return null;
    }

    return (
      <ActionButtons>
        {editAction && editAction(item || ({} as any))}
        {additionalActions && additionalActions(item || ({} as any))}
        {removeAction && removeAction(item || ({} as any))}
      </ActionButtons>
    );
  };

  renderItemName = (item: any) => {
    const { isProductCategory, isTeam } = this.props;

    if (isProductCategory || isTeam) {
      return (
        <FlexBetween>
          {item.code} - {isTeam ? item.title : item.name}
          <ItemCount className="product-count">
            {isTeam ? item.users.length : item.productCount}
          </ItemCount>
        </FlexBetween>
      );
    }

    return item.name || '[undefined]';
  };

  renderItemText = (item: any) => {
    const { linkToText } = this.props;

    if (linkToText) {
      return (
        <Link to={`${linkToText}${item._id}`}>{this.renderItemName(item)}</Link>
      );
    }

    return <ItemText>{this.renderItemName(item)}</ItemText>;
  };

  renderItem = (item: any, hasChildren: boolean) => {
    const { onClick, icon } = this.props;
    const { key } = this.state;
    const isOpen = this.state.parentIds[item._id] || !!key;

    return (
      <FlexRow key={item._id}>
        <SidebarListItem
          isActive={this.isActive(item._id)}
          onClick={onClick ? () => onClick(item._id) : (undefined as any)}
        >
          {icon && <Icon className="list-icon" icon={icon} />}
          {this.renderIcons(item, hasChildren, isOpen)}
          {this.renderItemText(item)}
          {this.renderActions(item)}
        </SidebarListItem>
      </FlexRow>
    );
  };

  renderTree(parent, subFields?) {
    const groupByParent = this.groupByParent(subFields);
    const childrens = groupByParent[parent._id];

    if (childrens) {
      const isOpen = this.state.parentIds[parent._id] || !!this.state.key;

      return (
        <SidebarList key={`parent-${parent._id}`}>
          {this.renderItem(parent, true)}

          <div className="child">
            {isOpen &&
              childrens.map(childparent =>
                this.renderTree(childparent, subFields)
              )}
          </div>
        </SidebarList>
      );
    }

    return this.renderItem(parent, false);
  }

  renderItems() {
    const { loading, treeView, items } = this.props;

    if (loading) {
      return <Spinner objective={true} />;
    }

    if (items.length === 0) {
      return (
        <EmptyState
          text="There aren’t any data at the moment."
          icon="clipboard-blank"
        />
      );
    }

    if (!treeView) {
      return items.map(item => this.renderItem(item, false));
    }

    const parents = items.filter(item => !item.parentId);
    const subFields = items.filter(item => item.parentId);

    return parents.map(parent => this.renderTree(parent, subFields));
  }

  render() {
    const { className } = this.props;

    return (
      <CollapsibleListWrapper className={className}>
        {this.renderItems()}
      </CollapsibleListWrapper>
    );
  }
}

export default CollapsibleList;
