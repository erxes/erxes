import React from 'react';

type Props = {};

type State = {
  searchValue?: string;
};

class List extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return <div>RCFA</div>;
  }
}

export default List;
