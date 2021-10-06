import * as React from 'react';
import { FilterableList } from '.';
import { ICategoryTree } from '../../types';
import * as ReactPopover from 'react-popover'
type Props = {
  items: ICategoryTree[];
  parentId?: string;
  changeRoute: (item: any) => void;
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
    const { items, parentId, changeRoute } = this.props;
    const { isOpen } = this.state;

    return (
      <ReactPopover
      isOpen={isOpen}
      preferPlace={'start'}
      tipSize={.01}
      body={
        <div className="booking-navigation">
              <div className="flex-sb p-10">
                <div> Navigation </div>
                <div onClick={()=>{this.setState({isOpen:false})}}> 
                <i className="icon-leftarrow"></i>
                </div>
              </div>
      
      <hr />
          <FilterableList
        treeView={true}
        loading={false}
        items={JSON.parse(JSON.stringify(items))}
        parentId={parentId}
        changeRoute={changeRoute}
      />
        </div>
      }
    >
      <div onClick={this.toggleNavigation} >
      <label className="menu__btn">
        <span></span>
      </label>
      <p>Navigation</p>
      </div>
    </ReactPopover>
    );
  }
}

export default Navigation;
