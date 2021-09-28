import * as React from 'react';
import { IProductCategory } from '../../types';
import FilterableList from './FilterableList';

type Props = {
  blocks: IProductCategory[];
};

class Navigation extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hha: ''
    };
  }

  render() {
    const { blocks } = this.props;
    return (
      <FilterableList
        treeView={false}
        selectable={false}
        loading={false}
        items={JSON.parse(JSON.stringify(blocks))}
      />
    );
  }
}

export default Navigation;
