import * as React from 'react';
import { FilterableList } from '.';
import { ICategoryTree } from '../../types';

type Props = {
  items: ICategoryTree[];
  parentId?: string;
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
    const { items, parentId } = this.props;
    const { isOpen } = this.state;

    return (
      <div>
        <i className="icon-menu" onClick={this.toggleNavigation} />
        {isOpen ? (
          <FilterableList
            treeView={true}
            selectable={false}
            loading={false}
            items={JSON.parse(JSON.stringify(items))}
            parentId={parentId}
          />
        ) : null}
      </div>
    );
  }
}

export default Navigation;
