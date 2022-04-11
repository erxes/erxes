import React from "react";
import { colors } from "modules/common/styles";
import { __ } from "modules/common/utils";
import styled from "styled-components";
import Wrapper from "../containers/Wrapper";
import Leftbar from "./Leftbar";
import PluginPreview from "../components/PluginPreview";
import UserPreview from "../components/UserPreview";

const Carousel = styled.div`
  height: 250px;
  background-color: ${colors.bgGray};
  border-radius: 8px;
`;

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

  renderContent() {
    return (
      <>
        <Carousel>Carousel</Carousel>  {/* replace with carousel* */}
        <PluginPreview header="Popular plugins" />
        <UserPreview header="Top user" />
        <PluginPreview header="New plugins" />
      </>
    );
  }

  render() {
    return <Wrapper leftSidebar={<Leftbar />} content={this.renderContent()} />;
  }
}

export default Store;
