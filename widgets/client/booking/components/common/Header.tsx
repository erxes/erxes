import * as React from 'react';

import { FilterableList } from '.';
import { IBookingData, ICategoryTree } from '../../types';
type Props = {
  items: ICategoryTree[];
  parentId?: string;
  changeRoute: (item: any) => void;
  booking?: IBookingData;
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
    const { items, parentId, changeRoute, booking } = this.props;

    if (!booking) {
      return null;
    }

    const style = booking.style;
    const navigationName = "Navigation"

    return (
      <div className={`booking-navigation bn-${style.widgetColor} slide-in`}>
        <div className="booking-header">
          <h4>{navigationName}</h4>
          <div>
            <div onClick={this.toggleNavigation} > </div>
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
        />
      </div>
    );
  }

  render() {
    return (
      <div className="header" onClick={this.toggleNavigation} >
        {this.state.isOpen === true ? this.renderNav() : ''}
        <Burger />
      </div>
    );
  }
}

const Burger = () => {
  return (
    <div className="hamburger">
      <span className="bar"></span>
      <span className="bar"></span>
      <span className="bar"></span>
    </div>
  )
}


export default Header;
