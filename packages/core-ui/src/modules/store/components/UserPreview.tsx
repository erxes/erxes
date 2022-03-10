import Icon from "modules/common/components/Icon";
import Button from "modules/common/components/Button";
import { colors, dimensions } from "modules/common/styles";
import { __ } from "modules/common/utils";
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import styledTS from "styled-components-ts";
import CollapseFilter from "./CollapseFilter";

const MainContainer = styled.div`
  margin: 20px;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const List = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const PluginCard = styled.div`
  height: 74px;
  width: 24%;
  display: flex;
  background: ${colors.bgMain};
  border-radius: 4px;
`;

const PluginPic = styled.div`
  width: 58px;
  margin: 8px;
  height: 58px;
  background: ${colors.colorBlack};
  border-radius: 4px;
`;

const UserInformation = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Footer = styled.div`
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RatingsPreview = styled.div`
  display: flex;
`;

const Rating = styled.div`
  height: 20px;
  width: 100px;
  background: ${colors.bgGray};
`;

const Buttons = styled.div`
  display: flex;
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
        <PluginCard>
          <PluginPic>
            
          </PluginPic>
          <UserInformation>
            <p><b>Frime</b></p>
            <p>use 12 plugin combined in <b>EXM</b></p>
          </UserInformation>
        </PluginCard>
        <PluginCard>
          <PluginPic>
            
          </PluginPic>
          <UserInformation>
            <p><b>Frime</b></p>
            <p>use 12 plugin combined in <b>EXM</b></p>
          </UserInformation>
        </PluginCard>
        <PluginCard>
          <PluginPic>
            
          </PluginPic>
          <UserInformation>
            <p><b>Frime</b></p>
            <p>use 12 plugin combined in <b>EXM</b></p>
          </UserInformation>
        </PluginCard>
        <PluginCard>
          <PluginPic>
            
          </PluginPic>
          <UserInformation>
            <p><b>Frime</b></p>
            <p>use 12 plugin combined in <b>EXM</b></p>
          </UserInformation>
        </PluginCard>
      </List>
    );
  };

  render() {
    return (
      <MainContainer>
        <Header>
          <h5>
            <b>{this.props.header}</b>
          </h5>
          <i>View all</i>
        </Header>
        {this.renderList()}
      </MainContainer>
    );
  }
}

export default UserPreview;
