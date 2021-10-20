import * as React from 'react';
import { GiHamburgerMenu } from 'react-icons/gi'
import { HiArrowNarrowLeft } from "react-icons/hi"
import { FilterableList } from '.';
import { IBookingData, ICategoryTree, IStyle } from '../../types';
type Props = {
  items: ICategoryTree[];
  parentId?: string;
  changeRoute: (item: any) => void;
  booking?: IBookingData;
};

type State = {
  isOpen: boolean;
};

class Navigation extends React.Component<Props, State> {
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
    const { isOpen } = this.state;
    return (
      <div className={`booking-navigation bn-${style.widgetColor} slide-in`} >
        <div className="booking-header" >
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
    )
  }
  render() {
    return (
      <div>
        <div className="nav" onClick={this.toggleNavigation}>
          <GiHamburgerMenu style={{ marginRight: "5px" }} />
          <p>Navigation</p>
        </div>
        {this.state.isOpen === true ? this.renderNav() : ""}
      </div>
    );
  }
}




export default Navigation;
