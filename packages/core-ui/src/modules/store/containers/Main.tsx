import Icon from "modules/common/components/Icon";
import Button from "modules/common/components/Button";
import { colors, dimensions } from "modules/common/styles";
import { __ } from "modules/common/utils";
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import styledTS from "styled-components-ts";
// import CollapseFilter from "./CollapseFilter";
import PluginPreview from '../components/PluginPreview';
import UserPreview from '../components/UserPreview';

const MainContainer = styled.div`
  padding: ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px 0px;
`;

const Carousel = styled.div`
  height: 250px;
  background-color: ${colors.bgGray};
  border-radius: 8px;
`;

// const FilterBox = styled.div`
//   border-bottom: 1px solid ${colors.borderPrimary};
// `;

type Props = {
  onSearch?: (e) => void;
  clearSearch?: () => void;
  results;
  loading?: boolean;
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

  render() {
    return (
      <MainContainer>
        <Carousel>Carousel</Carousel>
        <PluginPreview header="Popular plugins" />
        <UserPreview header="Top user" />
        <PluginPreview header="New plugins" />
      </MainContainer>
    );
  }
}

export default Main;
Carousel