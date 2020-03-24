import React from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../EmptyState';
import Icon from '../Icon';
import Spinner from '../Spinner';
import Filter from './Filter';
import {
  AvatarImg,
  FlexRow,
  IconWrapper,
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
  loading?: boolean;
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
    if (JSON.stringify(this.props.items) !== JSON.stringify(nextProps.items)) {
      this.setState({
        items: nextProps.items
      });
    }
  }

  filterItems = e => {
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

  renderItems() {
    const { showCheckmark = true, loading } = this.props;
    const { items, key } = this.state;

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

    return items.map(item => {
      // filter items by key
      if (key && item.title.toLowerCase().indexOf(key.toLowerCase()) < 0) {
        return false;
      }

      const onClick = () => this.toggleItem(item._id);

      return (
        <FlexRow key={item._id}>
          <li
            className={showCheckmark ? item.selectedBy : ''}
            style={item.style}
            onClick={onClick}
          >
            {item.iconClass ? (
              <i
                className={`icon ${item.iconClass}`}
                style={{ color: item.iconColor }}
              />
            ) : null}{' '}
            {item.avatar ? <AvatarImg src={item.avatar} /> : null}
            <span>{item.title || '[undefined]'}</span>
          </li>
          {item.additionalIconClass && (
            <IconWrapper
              onClick={
                item.additionalIconOnClick &&
                item.additionalIconOnClick.bind(this, item._id)
              }
            >
              <Icon icon={item.additionalIconClass} size={12} />
            </IconWrapper>
          )}
        </FlexRow>
      );
    });
  }

  render() {
    const { className, onSearch, selectable, links } = this.props;

    return (
      <div className={className}>
        <PopoverHeader>
          <Filter onChange={onSearch || this.filterItems} />
        </PopoverHeader>

        <PopoverBody>
          <PopoverList selectable={selectable}>
            {this.renderItems()}
          </PopoverList>
        </PopoverBody>
        {links && (
          <PopoverFooter>
            <PopoverList>
              {links.map(link => (
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
