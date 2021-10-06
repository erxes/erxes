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
      place= {"left"}
      tipSize={.01}
      className={"top-0"}
      body={
        <div className="booking-navigation">
              <div className="flex-sb p-5">
                <div className="b"> Navigation </div>
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
      <div className="flex-center">
        <i className="icon-menu-2 mr-10"></i>
        <p>Navigation</p>
      </div>
     
      </div>
    </ReactPopover>
    );
  }
}

export default Navigation;
