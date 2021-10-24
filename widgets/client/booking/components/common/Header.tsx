import * as React from 'react';
import { GiHamburgerMenu } from 'react-icons/gi';
import { HiArrowNarrowLeft } from 'react-icons/hi';
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

    return (
      <div className={`booking-navigation bn-${style.widgetColor} slide-in`}>
        <div className="booking-header">
          <h4> Navigation </h4>
          <div>
            <HiArrowNarrowLeft width="1.2em" onClick={this.toggleNavigation} />
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
      <div className="header">
        {this.state.isOpen === true ? this.renderNav() : ''}
        <div className="nav flex-center" onClick={this.toggleNavigation}>
          <GiHamburgerMenu style={{ marginRight: '5px' }} />
          <p>Navigation</p>
        </div>
        <div>
          Filter
        </div>
      </div>

    );
  }
}


export default Header;
