import * as React from 'react';
import { RiArrowDownSFill, RiArrowRightSFill } from 'react-icons/ri';
import { IStyle } from '../../types';

type Props = {
  items?: any[];
  links?: any[];
  showCheckmark?: boolean;
  loading?: boolean;
  className?: string;
  treeView?: boolean;
  parentId?: string;

  styles: IStyle;

  changeRoute: (item: any) => void;

  // hooks
  onClick?: (items: any[], id: string) => void;
  onExit?: (items: any[]) => void;
};

type State = {
  isOpen: boolean;
  key: string;
  items: any[];
  selectedItem: any;
  parentIds: { [key: string]: boolean };
};

class FilterableList extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);

    this.state = {
      isOpen: false,
      key: '',
      items: props.items,
      selectedItem: undefined,
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

  toggleItem = (id: string) => {
    const items = this.state.items;
    // const item = items.find(i => i._id === id);

    // items[items.indexOf(item)].selectedBy =
    //   item.selectedBy === 'all' ? 'none' : 'all';

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

  renderIcons(item: any, hasChildren: boolean, isOpen: boolean, color: string) {
    return hasChildren ? (
      <div
        className="toggle-nav"
        onClick={this.onToggle.bind(this, item._id, isOpen)}
      >
        {isOpen ? <RiArrowDownSFill /> : <RiArrowRightSFill />}
      </div>
    ) : null;
  }

  renderItem(item: any, hasChildren: boolean, stockCnt: number) {
    const { showCheckmark = true, changeRoute, styles } = this.props;
    const { widgetColor, productAvailable, productUnavailable } = styles;
    const { key } = this.state;

    if (key && item.name.toLowerCase().indexOf(key.toLowerCase()) < 0) {
      return false;
    }
    const onClick = () => this.toggleItem(item._id);

    const isOpen = this.state.parentIds[item._id] || !!key;

    let color = stockCnt === 0 ? productUnavailable : widgetColor;

    if (stockCnt > 0 && stockCnt < 10) {
      color = productAvailable;
    }

    const handleClick = (item: any) => {
      changeRoute(item);
      this.setState({ selectedItem: item });
    }

    return (
      <li
        key={item._id}
        className={`list flex-sb `}
        style={(this.state.selectedItem && item._id === this.state.selectedItem._id) ? { fontWeight: 500, color } : { fontWeight: 400, color }}
        onClick={onClick}
      >

        <div className="flex-center">
          {this.renderIcons(item, hasChildren, isOpen, color)}
          <div className="mr-30" onClick={() => handleClick(item)}>
            {item.name || '[undefined]'}
          </div>
        </div>
        <div className={`circle center `} style={{ backgroundColor: color }}>
          {stockCnt}
        </div>
      </li>
    );
  }

  renderTree(parent: any, subFields?: any) {
    const groupByParent = this.groupByParent(subFields);
    const childrens = groupByParent[parent._id];

    const productCount = subFields.filter(
      (el: any) => el.type === 'product' && el.parentIds.includes(parent._id)
    );

    let stockCnt = productCount ? productCount.length : 0;

    if (childrens) {
      const isOpen = this.state.parentIds[parent._id] || !!this.state.key;
      return (
        <ul key={`parent-${parent._id}`}>
          {this.renderItem(parent, true, stockCnt)}
          <li className="child-list">
            {isOpen &&
              childrens.map((childparent: any) => {
                return this.renderTree(childparent, subFields);
              })}
          </li>
        </ul>
      );
    }

    if (parent.type === 'product') {
      stockCnt = 1;
    }

    return this.renderItem(parent, false, stockCnt);
  }

  renderItems() {
    const { loading, parentId } = this.props;
    const { items } = this.state;

    if (loading) {
      return null;
    }

    if (items.length === 0) {
      return null;
    }

    const parents = items.filter(item => item.parentId === parentId);
    const subFields = items.filter(item => item.parentId);

    return parents.map(parent => this.renderTree(parent, subFields));
  }

  togglePopover = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };

  render() {
    return <div>{this.renderItems()}</div>;
  }
}

export default FilterableList;
