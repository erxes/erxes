import Icon from "@erxes/ui/src/components/Icon";
import Button from "@erxes/ui/src/components/Button";
import { colors, dimensions, typography } from "@erxes/ui/src/styles";
import { Flex } from "@erxes/ui/src/styles/main";
import { __ } from "@erxes/ui/src/utils";
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import styledTS from "styled-components-ts";
import CollapseFilter from "./CollapseFilter";

const MainContainer = styled.div`
  padding-bottom: ${dimensions.coreSpacing}px;
  border-bottom: 1px solid ${colors.borderPrimary};
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: ${dimensions.coreSpacing}px 0px;
`;

const List = styled.div`
  width: 100%;
  display: flex;
`;

const PluginCard = styledTS<{ hasMarginRight?: boolean }>(styled.div)`
  display: flex;
  align-items: center;
  background: ${colors.bgMain};
  border-radius: 4px;
  margin-right: ${props => (props.hasMarginRight ? dimensions.coreSpacing : 0)}px;
  width: 100%;
`;

const PluginPic = styled.div`
  width: 45px;
  margin: 7px;
  height: 45px;
  background: ${colors.colorWhite};
  border-radius: 2px;
`;

const UserInformation = styled.div`
  line-height: ${dimensions.unitSpacing}px;
  margin-right: 7px;
`;

const StyledHeader = styled.b`
  color: ${colors.colorPrimary};
`;

const Article = styled.b`
  height: ${typography.lineHeightHeading5};
`;

const GrayText = styled.div`
  color: ${colors.colorCoreGray};
  padding-right: 3px;
`;

const SpaceLeft = styled(GrayText)`
  padding-left: 3px;
`;

const SpaceTop = styled.div`
  padding-top: ${dimensions.unitSpacing}px;
  display: flex;
  font-size: ${typography.fontSizeUppercase}px;
`;

type Props = {
  header: string;
  onSearch?: (e) => void;
  clearSearch?: () => void;
  results;
  loading?: boolean;
};

class UserPreview extends React.Component<
  Props,
  { showInput: boolean; searchValue: string }
> {
  // private wrapperRef;

  constructor(props) {
    super(props);

    this.state = { showInput: false, searchValue: "" };
  }

  renderList = () => {
    // const { showInput } = this.state;

    return (
      <List>
        <PluginCard hasMarginRight={true}>
          <PluginPic></PluginPic>
          <UserInformation>
            <b>Frime</b>
            <SpaceTop>
              <GrayText>use</GrayText>12 plugin combined<SpaceLeft>in </SpaceLeft>
              <b>EXM</b>
            </SpaceTop>
          </UserInformation>
        </PluginCard>
        <PluginCard hasMarginRight={true}>
          <PluginPic></PluginPic>
          <UserInformation>
            <b>Frime</b>
            <SpaceTop>
              <GrayText>use</GrayText>12 plugin combined<SpaceLeft>in </SpaceLeft>
              <b>EXM</b>
            </SpaceTop>
          </UserInformation>
        </PluginCard>
        <PluginCard hasMarginRight={true}>
          <PluginPic></PluginPic>
          <UserInformation>
            <b>Frime</b>
            <SpaceTop>
              <GrayText>use</GrayText>12 plugin combined<SpaceLeft>in </SpaceLeft>
              <b>EXM</b>
            </SpaceTop>
          </UserInformation>
        </PluginCard>
        <PluginCard>
          <PluginPic></PluginPic>
          <UserInformation>
            <b>Frime</b>
            <SpaceTop>
              <GrayText>use</GrayText>12 plugin combined<SpaceLeft>in </SpaceLeft>
              <b>EXM</b>
            </SpaceTop>
          </UserInformation>
        </PluginCard>
      </List>
    );
  };

  render() {
    return (
      <MainContainer>
        <Header>
          <Article>{this.props.header}</Article>
          <StyledHeader>View all</StyledHeader>
        </Header>
        {this.renderList()}
      </MainContainer>
    );
  }
}

export default UserPreview;
