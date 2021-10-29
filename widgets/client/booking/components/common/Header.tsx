import * as React from 'react';

import { FilterableList } from '.';
import { IBookingData, ICategoryTree } from '../../types';
type Props = {
  items: ICategoryTree[];
  parentId?: string;
  changeRoute: (item: any) => void;
  booking?: IBookingData;
  selectedItem?: string;
};

type State = {
  isOpen: boolean;
};

class Header extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isOpen: false
    };
  }

  toggleNavigation = () => {
    this.setState(prevState => ({
      isOpen: !prevState.isOpen
    }));
  };

  renderNav() {
    const { items, parentId, changeRoute, booking, selectedItem } = this.props;

    if (!booking) {
      return null;
    }

    const style = booking.style;
    const navigationText = (booking && booking.navigationText) || 'Navigation';

    return (
      <div className={`booking-navigation bn-${style.widgetColor} slide-in`}>
        <div className="booking-header">
          <h4>{navigationText}</h4>
          <div
            onClick={this.toggleNavigation}
            style={{ fontSize: '1.3em', transform: 'rotate(180deg)' }}
          >
            {' '}
            &#10140;{' '}
          </div>
        </div>
        <hr />
        <FilterableList
          treeView={true}
          loading={false}
          items={JSON.parse(JSON.stringify(items))}
          parentId={parentId}
          changeRoute={changeRoute}
          styles={style}
          selectedItem={selectedItem}
        />
      </div>
    );
  }

  render() {
    const navigationText =
      (this.props.booking && this.props.booking.navigationText) || 'Navigation';

    return (
      <>
        {this.state.isOpen === true ? this.renderNav() : ''}
        <div className="header" onClick={this.toggleNavigation}>
          <div className="nav">
            <Burger />
            <div>{navigationText}</div>
          </div>
        </div>
      </>
    );
  }
}

const Burger = () => {
  return (
    <div className="hamburger">
      <span className="bar" />
      <span className="bar" />
      <span className="bar" />
    </div>
  );
};

export default Header;
