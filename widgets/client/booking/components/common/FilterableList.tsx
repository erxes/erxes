import * as React from 'react';
import {
  FlexRow,
  PopoverBody,
  PopoverList,
  ChildList,
  ToggleIcon,
  SidebarList
} from './styles';

type Props = {
  items?: any[];
  links?: any[];
  showCheckmark?: boolean;
  selectable?: boolean;
  loading?: boolean;
  className?: string;
  treeView?: boolean;
  isIndented?: boolean;

  // hooks
  onClick?: (items: any[], id: string) => void;
  onSearch?: (e: React.FormEvent<HTMLElement>) => void;
  onExit?: (items: any[]) => void;
};

type State = {
  key: string;
  items: any[];
  parentIds: { [key: string]: boolean };
};

class FilterableList extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);

    this.state = {
      key: '',
      items: props.items,
      parentIds: {}
    };
  }

  componentWillUnmount() {
    // onExit hook
    const { onExit } = this.props;

    if (onExit) {
      onExit(this.state.items);
    }
  }

  componentWillReceiveProps(nextProps: any) {
    if (JSON.stringify(this.props.items) !== JSON.stringify(nextProps.items)) {
      this.setState({
        items: nextProps.items
      });
    }
  }

  filterItems = (e: any) => {
    this.setState({ key: e.target.value });
  };

  toggleItem = (id: string) => {
    const items = this.state.items;
    const item = items.find(i => i._id === id);

    items[items.indexOf(item)].selectedBy =
      item.selectedBy === 'all' ? 'none' : 'all';

    this.setState({ items });

    // onClick hook
    const { onClick } = this.props;

    if (onClick) {
      onClick(items, id);
    }
  };

  groupByParent = (array: any[]) => {
    const key = 'parentId';

    return array.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);

      return rv;
    }, {});
  };

  onToggle = (id: string, isOpen: boolean) => {
    const parentIds = this.state.parentIds;
    parentIds[id] = !isOpen;

    this.setState({ parentIds });
  };

  renderIcons(item: any, hasChildren: boolean, isOpen: boolean) {
    if (!item.iconClass) {
      return null;
    }

    return (
      <>
        {hasChildren && (
          <ToggleIcon
            isIndented={this.props.isIndented}
            onClick={this.onToggle.bind(this, item._id, isOpen)}
          >
            <i className={isOpen ? 'icon-menu' : 'icon-menu-2'} />
          </ToggleIcon>
        )}

        <i className={item.iconClass} style={{ color: item.iconColor }} />
      </>
    );
  }

  renderItem(item: any, hasChildren: boolean) {
    const { showCheckmark = true } = this.props;
    const { key } = this.state;

    if (key && item.name.toLowerCase().indexOf(key.toLowerCase()) < 0) {
      return false;
    }

    const onClick = () => this.toggleItem(item._id);
    const isOpen = this.state.parentIds[item._id] || !!key;

    return (
      <FlexRow key={item._id}>
        <li
          className={showCheckmark ? item.selectedBy : ''}
          style={item.style}
          onClick={onClick}
        >
          {this.renderIcons(item, hasChildren, isOpen)}

          <span>{item.name || '[undefined]'}</span>
        </li>
      </FlexRow>
    );
  }

  renderTree(parent: any, subFields?: any) {
    const groupByParent = this.groupByParent(subFields);
    const childrens = groupByParent[parent._id];

    if (childrens) {
      const isOpen = this.state.parentIds[parent._id] || !!this.state.key;

      return (
        <div key={`parent-${parent._id}`}>
          {this.renderItem(parent, true)}

          <ChildList>
            {isOpen &&
              childrens.map((childparent: any) =>
                this.renderTree(childparent, subFields)
              )}
          </ChildList>
        </div>
      );
    }

    return this.renderItem(parent, false);
  }

  renderItems() {
    const { loading, treeView } = this.props;
    const { items } = this.state;

    if (loading) {
      return <h1>loading</h1>;
    }

    if (items.length === 0) {
      return <div>hooson bainac</div>;
    }

    if (!treeView) {
      return items.map(item => this.renderItem(item, false));
    }

    const parents = items.filter(item => !item.parentId);
    const subFields = items.filter(item => item.parentId);

    return parents.map(parent => this.renderTree(parent, subFields));
  }

  render() {
    const { className, selectable, isIndented } = this.props;
    console.log(this.props, 'ehllo world');

    return (
      <div className={className}>
        <PopoverBody>
          <PopoverList isIndented={isIndented} selectable={selectable}>
            {this.renderItems()}
          </PopoverList>
        </PopoverBody>
      </div>
    );
  }
}

export default FilterableList;
