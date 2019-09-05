import React from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../EmptyState';
import Filter from './Filter';
import {
  AvatarImg,
  PopoverBody,
  PopoverFooter,
  PopoverHeader,
  PopoverList
} from './styles';

type Props = {
  items?: any[];
  links?: any[];
  showCheckmark?: boolean;
  selectable?: boolean;
  className?: string;

  // hooks
  onClick?: (items: any[], id: string) => void;
  onSearch?: (e: React.FormEvent<HTMLElement>) => void;
  onExit?: (items: any[]) => void;
};

type State = {
  key: string;
  items: any[];
};

class FilterableList extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      key: '',
      items: props.items
    };
  }

  componentWillUnmount() {
    // onExit hook
    const { onExit } = this.props;

    if (onExit) {
      onExit(this.state.items);
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      items: nextProps.items
    });
  }

  filterItems = e => {
    this.setState({ key: e.target.value });
  };

  toggleItem = id => {
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

  renderItems() {
    const { showCheckmark = true } = this.props;
    const { items, key } = this.state;

    if (items.length === 0) {
      return (
        <EmptyState
          text="There aren’t any data at the moment."
          icon="clipboard-1"
        />
      );
    }

    return items.map(item => {
      // filter items by key
      if (key && item.title.toLowerCase().indexOf(key.toLowerCase()) < 0) {
        return false;
      }

      const onClick = () => this.toggleItem(item._id);

      return (
        <li
          key={item._id}
          className={showCheckmark ? item.selectedBy : ''}
          onClick={onClick}
        >
          {item.iconClass ? (
            <i
              className={`icon ${item.iconClass}`}
              style={{ color: item.iconColor }}
            />
          ) : null}{' '}
          {item.avatar ? <AvatarImg src={item.avatar} /> : null}
          {item.title || '[undefined]'}
        </li>
      );
    });
  }

  render() {
    return (
      <div className={this.props.className}>
        <PopoverHeader>
          <Filter onChange={this.props.onSearch || this.filterItems} />
        </PopoverHeader>

        <PopoverBody>
          <PopoverList selectable={this.props.selectable}>
            {this.renderItems()}
          </PopoverList>
        </PopoverBody>
        {this.props.links && (
          <PopoverFooter>
            <PopoverList>
              {this.props.links.map(link => (
                <li key={link.href}>
                  <Link onClick={link.onClick} to={link.href}>
                    {link.title}
                  </Link>
                </li>
              ))}
            </PopoverList>
          </PopoverFooter>
        )}
      </div>
    );
  }
}

export default FilterableList;
