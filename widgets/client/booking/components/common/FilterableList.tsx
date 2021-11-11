import * as React from 'react';
import { ICategoryTree, IStyle } from '../../types';

type Props = {
  items?: ICategoryTree[];
  links?: any[];
  loading?: boolean;
  className?: string;
  treeView?: boolean;
  parentId?: string;
  styles: IStyle;
  selectedItem?: string;

  changeRoute: (item: ICategoryTree) => void;

  // hooks
  onClick?: (items: any[], id: string) => void;
  onExit?: (items: any[]) => void;
};

type State = {
  isOpen: boolean;
  key: string;
  items: any[];
  parentIds: { [key: string]: boolean };
};

class FilterableList extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);

    this.state = {
      isOpen: false,
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

  toggleItem = (id: string) => {
    const items = this.state.items;

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

  renderIcons(isOpen: boolean, color: string) {
    const arrowsize = '0.3em';
    const downTraingle = {
      borderColor: `${color} transparent transparent transparent`,
      borderStyle: 'solid',
      borderWidth: `${arrowsize} ${arrowsize} 0px ${arrowsize}`,
      height: '0px',
      width: '0px'
    };

    const rightTraingle = {
      borderColor: `transparent transparent transparent ${color}`,
      borderStyle: 'solid',
      borderWidth: `${arrowsize} 0px ${arrowsize} ${arrowsize}`,
      height: '0px',
      width: '0px'
    };

    return <div style={isOpen ? downTraingle : rightTraingle} />;
  }

  renderItem(item: any, hasChildren: boolean, stockCnt: number) {
    const { changeRoute, styles } = this.props;
    const { widgetColor, productAvailable } = styles;
    const { key } = this.state;

    if (key && item.name.toLowerCase().indexOf(key.toLowerCase()) < 0) {
      return false;
    }

    const isOpen = this.state.parentIds[item._id] || !!key;

    const isDisabled = item.status === 'disabled' || parseInt(item.count) === 0;

    const isSelected = item._id === this.props.selectedItem;

    let color = stockCnt === 0 ? '#AAA' : widgetColor;

    if (stockCnt > 0 && stockCnt < 10) {
      color = productAvailable;
    }

    const handleClick = (treeItem: ICategoryTree) => {
      changeRoute(treeItem);
    };

    return (
      <li
        key={item._id}
        className={`list flex-sb ${isDisabled ? 'card-disabled' : ''} ${
          isSelected ? 'selected' : ''
        }`}
      >
        <div className="flex-items-center">
          <div
            className="toggle-nav"
            onClick={() => this.onToggle(item._id, isOpen)}
          >
            {hasChildren && this.renderIcons(isOpen, color)}
          </div>
          <div
            className={`list-item`}
            onClick={() => handleClick(item)}
            style={{
              color: !isDisabled ? color : ''
            }}
          >
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

    const stockCnt = parseInt(parent.count);

    if (childrens) {
      const isOpen = this.state.parentIds[parent._id] || !!this.state.key;
      return (
        <ul key={`parent-${parent._id}`}>
          {this.renderItem(parent, true, stockCnt)}
          <li className="child-list" key={`child-${parent._id}`}>
            {isOpen &&
              childrens.map((childparent: any) => {
                return this.renderTree(childparent, subFields);
              })}
          </li>
        </ul>
      );
    }

    return this.renderItem(parent, false, stockCnt);
  }

  togglePopover = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };

  render() {
    const { loading, parentId } = this.props;
    const { items } = this.state;

    if (loading || items.length === 0) {
      return null;
    }

    const parents = items.filter(item => item.parentId === parentId);
    const subFields = items.filter(item => item.parentId);

    return <ul>{parents.map(parent => this.renderTree(parent, subFields))}</ul>;
  }
}

export default FilterableList;
