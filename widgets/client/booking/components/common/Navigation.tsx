import * as React from 'react';
import { FilterableList } from '.';
import { IBookingData, ICategoryTree } from '../../types';
import * as ReactPopover from 'react-popover';
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

  render() {
    const { items, parentId, changeRoute, booking } = this.props;

    if (!booking) {
      return null;
    }

    const style = booking.style;
    const { isOpen } = this.state;

    return (
      <ReactPopover
        isOpen={isOpen}
        preferPlace={'start'}
        place={'left'}
        tipSize={0.01}
        className={'top-0'}
        body={
          <div className={`booking-navigation bn-${style.widgetColor}`}>
            <div className="flex-sb p-5">
              <div className="b"> Navigation </div>
              <div
                onClick={() => {
                  this.setState({ isOpen: false });
                }}
              >
                <i className="icon-leftarrow" />
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
        }
      >
        <div onClick={this.toggleNavigation}>
          <div className="flex-center">
            <i className="icon-menu-2 mr-10" />
            <p>Navigation</p>
          </div>
        </div>
      </ReactPopover>
    );
  }
}

export default Navigation;
