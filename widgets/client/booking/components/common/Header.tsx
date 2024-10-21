import * as React from "react";
import { IBookingData, ICategoryTree } from "../../types";
import { iconClose } from "../../../icons/Icons";
import FilterableList from "./FilterableList";
type Props = {
  items: ICategoryTree[];
  parentId?: string;
  changeRoute: (treeItem: ICategoryTree) => void;
  booking?: IBookingData;
  goToIntro?: () => void;
  selectedItem?: string;
};

type State = {
  isOpen: boolean;
};

class Header extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }

  toggleNavigation = () => {
    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
  };

  renderNav() {
    const {
      items,
      parentId,
      changeRoute,
      booking,
      selectedItem,
      goToIntro,
    } = this.props;

    if (!booking) {
      return null;
    }

    const style = booking.style;
    const navigationText = (booking && booking.navigationText) || "Navigation";

    return (
      <div className={`booking-navigation bn-${style.widgetColor} slide-in`}>
        <div className="booking-header">
          <h4 onClick={goToIntro}>{navigationText}</h4>
          <div onClick={this.toggleNavigation}>{iconClose("#444")}</div>
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
    const { goToIntro, booking } = this.props;

    const navigationText = (booking && booking.navigationText) || "Navigation";

    return (
      <>
        {this.state.isOpen && this.renderNav()}
        <div className="header">
          <div className="nav">
            <div className="hamburger" onClick={this.toggleNavigation}>
              <span className="bar" />
              <span className="bar" />
              <span className="bar" />
            </div>
            <h4 onClick={goToIntro}>{navigationText}</h4>
          </div>
        </div>
      </>
    );
  }
}

export default Header;
