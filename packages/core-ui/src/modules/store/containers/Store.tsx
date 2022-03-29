import React from "react";
import Store from "../components/Store";

type Props = {
  text: string;
};

type State = {
  count: number;
};

class StoreContainer extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      count: 0,
    };
  }

  render() {
    return <Store text={this.props.text} />;
  }
}

export default StoreContainer;
