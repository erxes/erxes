import * as React from 'react';
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
  selectedItem?: string;

  changeRoute: (item: any) => void;

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

  renderIcons(item: any, hasChildren: boolean, isOpen: boolean, color: string) {
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

    return hasChildren ? (
      <div>
        {' '}
        {isOpen ? <div style={downTraingle} /> : <div style={rightTraingle} />}
      </div>
    ) : null;
  }

  renderItem(item: any, hasChildren: boolean, stockCnt: number) {
    const { showCheckmark = true, changeRoute, styles } = this.props;
    const {
      widgetColor,
      productAvailable,
      productUnavailable,
      productSelected
    } = styles;
    const { key } = this.state;

    if (key && item.name.toLowerCase().indexOf(key.toLowerCase()) < 0) {
      return false;
    }
    const onClick = () => this.onToggle(item._id, isOpen);

    const isOpen = this.state.parentIds[item._id] || !!key;

    let color = stockCnt === 0 ? productUnavailable : widgetColor;

    if (stockCnt > 0 && stockCnt < 10) {
      color = productAvailable;
    }

    // tslint:disable-next-line: no-shadowed-variable
    const handleClick = (item: any) => {
      changeRoute(item);
    };

    return (
      <li
        key={item._id}
        className={`list flex-sb ${
          item.status === 'disabled' || item.count === 0 ? 'card-disabled' : ''
        }`}
        style={
          item._id === this.props.selectedItem
            ? { fontWeight: 500, color: productSelected }
            : { fontWeight: 400, color }
        }
      >
        <div className="flex-center">
          <div
            className="toggle-nav"
            onClick={() => this.onToggle(item._id, isOpen)}
          >
            {this.renderIcons(item, hasChildren, isOpen, color)}
          </div>
          <div
            style={{
              fontSize: '1em',
              marginRight: '2em'
            }}
            onClick={() => handleClick(item)}
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

    const stockCnt = parent.count;

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
