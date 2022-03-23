import Icon from "modules/common/components/Icon";
import Button from "./Button";
import { colors, dimensions, typography } from "@erxes/ui/src/styles";
import { Flex } from "@erxes/ui/src/styles/main";
import { __ } from "modules/common/utils";
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import styledTS from "styled-components-ts";
import CollapseFilter from "./CollapseFilter";
// import { Rating } from "@mui/material";

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

const PluginCard = styled.div`
  padding-right: ${dimensions.coreSpacing}px;
`;

const PluginPic = styled.div`
  width: 100%;
  background: ${colors.bgMain};
  height: 110px;
  border-radius: 4px;
  margin-bottom: ${dimensions.unitSpacing}px;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Rating = styled.div`
  height: ${dimensions.coreSpacing}px;
  width: 90px;
  background: ${colors.bgGray};
`;

const StyledHeader = styled.b`
  color: ${colors.colorPrimary};
`;

const Article = styled.b`
  height: ${typography.lineHeightHeading5};
`;

const GrayText = styled.div`
  color: ${colors.colorCoreGray};
  padding-right: 5px;
`;

const Space = styled(GrayText)`
  padding-left: 5px;
`;

type Props = {
  header?: string;
  onSearch?: (e) => void;
  clearSearch?: () => void;
  results?;
  loading?: boolean;
};

class PluginPreview extends React.Component<
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
          <PluginPic />
          <b>Ecommerce plugin</b>
          <Flex>
            <GrayText>by </GrayText>New media group <Space>in </Space>
            <b>EXM</b>
          </Flex>
          <Footer>
            <Flex>
              <Rating />
              <Space><b>/412/</b></Space>
            </Flex>
            <Flex>
              <Button btnStyle="simple" border size="small">
                <Icon
                  icon="shopping-cart-alt"
                  size={15}
                  color={colors.colorPrimary}
                />
              </Button>
              <Button size="small">
                <b>Install</b>
              </Button>
            </Flex>
          </Footer>
        </PluginCard>
        <PluginCard>
          <PluginPic />
          <b>Ecommerce plugin</b>
          <Flex>
            <GrayText>by </GrayText>New media group <Space>in </Space>
            <b>EXM</b>
          </Flex>
          <Footer>
            <Flex>
              <Rating />
              <Space><b>/412/</b></Space>
            </Flex>
            <Flex>
              <Button btnStyle="simple" border size="small">
                <Icon
                  icon="shopping-cart-alt"
                  size={15}
                  color={colors.colorPrimary}
                />
              </Button>
              <Button size="small">
                <b>Install</b>
              </Button>
            </Flex>
          </Footer>
        </PluginCard>
        <PluginCard>
          <PluginPic />
          <b>Ecommerce plugin</b>
          <Flex>
            <GrayText>by </GrayText>New media group <Space>in </Space>
            <b>EXM</b>
          </Flex>
          <Footer>
            <Flex>
              <Rating />
              <Space><b>/412/</b></Space>
            </Flex>
            <Flex>
              <Button btnStyle="simple" border size="small">
                <Icon
                  icon="shopping-cart-alt"
                  size={15}
                  color={colors.colorPrimary}
                />
              </Button>
              <Button size="small">
                <b>Install</b>
              </Button>
            </Flex>
          </Footer>
        </PluginCard>
        <PluginCard>
          <PluginPic />
          <b>Ecommerce plugin</b>
          <Flex>
            <GrayText>by </GrayText>New media group <Space>in </Space>
            <b>EXM</b>
          </Flex>
          <Footer>
            <Flex>
              <Rating />
              <Space><b>/412/</b></Space>
            </Flex>
            <Flex>
              <Button btnStyle="simple" border size="small">
                <Icon
                  icon="shopping-cart-alt"
                  size={15}
                  color={colors.colorPrimary}
                />
              </Button>
              <Button size="small">
                <b>Install</b>
              </Button>
            </Flex>
          </Footer>
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

export default PluginPreview;
