import * as React from 'react';
import * as ReactPopover from 'react-popover'

type Props = {
  items?: any[];
  links?: any[];
  showCheckmark?: boolean;
  loading?: boolean;
  className?: string;
  treeView?: boolean;
  parentId?: string;

  changeRoute: (item: any) => void;

  // hooks
  onClick?: (items: any[], id: string) => void;
  onExit?: (items: any[]) => void;
};

type State = {
  isOpen :boolean;
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

  renderIcons(item: any, hasChildren: boolean, isOpen: boolean) {
    return (
          <div className="toggle-nav"
            onClick={this.onToggle.bind(this, item._id, isOpen)}
          >
            <div className={isOpen ? 'arrow-down' : 'arrow-right'} />
          </div>
    );
  }

  renderItem(item: any, hasChildren: boolean, stockCnt: number) {
    const { showCheckmark = true, changeRoute } = this.props;
    const { key } = this.state;

    if (key && item.name.toLowerCase().indexOf(key.toLowerCase()) < 0) {
      return false;
    }
    const onClick = () => this.toggleItem(item._id);
    const isOpen = this.state.parentIds[item._id] || !!key;
  
    let stock = stockCnt === 0 ? "duussan": "available";
    if(stockCnt > 0 && stockCnt <10) stock = "baga"
     console.log(isOpen)
    return (
        <li key={item._id} 
          className={`list grid-131 s-${stock}`}
          onClick={onClick}
        >
          {this.renderIcons(item, hasChildren, isOpen)}
          <span className="grid" onClick={() => changeRoute(item)}>
            {item.name || '[undefined]'}
          </span>
          <div className={`circle center ${stock}`}>{stockCnt}</div>

      </li>
    );
  }

  renderTree(parent: any, subFields?: any) {
    const groupByParent = this.groupByParent(subFields);
    const childrens = groupByParent[parent._id];
    console.log(childrens)
    if (childrens) {
      const isOpen = this.state.parentIds[parent._id] || !!this.state.key;

      return (
        <ul key={`parent-${parent._id}`}>
          {this.renderItem(parent, true,20 )}
          <li className="child-list">
            {isOpen &&
              childrens.map((childparent: any) => {
                return this.renderTree(childparent, subFields);
              })}
          </li>
        </ul>
      );
    }

    return this.renderItem(parent, false, 20);
  }

  renderItems() {
    const { loading, parentId } = this.props;
    const { items } = this.state;

    if (loading) {
      return null;
    }

    if (items.length === 0) {
      return <div>hooson baina</div>;
    }

    const parents = items.filter(item => item.parentId === parentId);
    const subFields = items.filter(item => item.parentId);

    return parents.map(parent =>this.renderTree(parent, subFields)
      );
  }
  togglePopover = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };

  render() {
    return (
      <div>
      {this.renderItems()}
    </div>
      
    );
  }
}

export default FilterableList;
