import React from "react";
import Wrapper from "../containers/Wrapper";
import Leftbar from "./Leftbar";
import Main from "../containers/Main";

type Props = {
  text: string;
};

type State = {
  count: number;
};

class Store extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      count: 0,
    };
  }

  render() {
    return <Wrapper leftSidebar={<Leftbar />} content={<Main />} />;
  }
}

export default Store;
