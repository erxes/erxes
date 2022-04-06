import { colors } from "modules/common/styles";
import { __ } from "modules/common/utils";
import React from "react";
import styled from "styled-components";
import PluginPreview from "../components/PluginPreview";
import UserPreview from "../components/UserPreview";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";

const Carousel = styled.div`
  height: 250px;
  background-color: ${colors.bgGray};
  border-radius: 8px;
`;

type Props = {
  onSearch?: (e) => void;
  clearSearch?: () => void;
  results;
  loading: boolean;
};

class Main extends React.Component<
  Props,
  { showInput: boolean; searchValue: string }
> {
  // private wrapperRef;

  constructor(props) {
    super(props);

    this.state = { showInput: false, searchValue: "" };
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
    return <DataWithLoader data={this.renderContent()} loading={this.props.loading} />;
  }
}

export default Main;
Carousel;
