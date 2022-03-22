import Icon from "modules/common/components/Icon";
import Button from "./Button";
import { colors, dimensions, typography } from "@erxes/ui/src/styles";
import {Flex} from '@erxes/ui/src/styles/main';
import { __ } from "modules/common/utils";
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import styledTS from "styled-components-ts";
import CollapseFilter from "./CollapseFilter";
// import { Rating } from "@mui/material";

const MainContainer = styled.div`
  padding-bottom: 30px;
  border-bottom: 1px solid ${colors.borderPrimary};
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 20px 0px 20px 0px;
`;

const List = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const PluginCard = styled.div`
  height: 240px;
  width: 24%;
`;

const PluginPic = styled.div`
  width: 100%;
  background: ${colors.bgMain};
  height: 110px;
  border-radius: 4px;
  margin-bottom: 10px;
`;

const Footer = styled.div`
  height: 50px;
  display: flex;
  align-items: center;
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

const StyledHeader = styled.b`
  color: ${colors.colorPrimary};
`;

const Article = styled.b`
  height: ${typography.lineHeightHeading5};
`;
const GrayText = styled.p`
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
            <GrayText>by </GrayText>New media group <Space>in </Space><b>EXM</b>
          </Flex>
          <Footer>
            <RatingsPreview>
              <Rating />
              <p>/412/</p>
            </RatingsPreview>
            <Button btnStyle="simple" border size="small"><Icon icon="shopping-cart-alt" size={15}  color={colors.colorPrimary}/></Button>
            <Button size="small"><b>Install</b></Button>
          </Footer>
        </PluginCard>
        <PluginCard>
          <PluginPic />
          <b>Ecommerce plugin</b>
          <p>
            by New Media Group in <b>EXM</b>
          </p>
          <Footer>
            <RatingsPreview>
              <Rating
                // name="half-rating-read"
                // defaultValue={2.5}
                // precision={0.5}
                // size="small"
                // readOnly
              />
              <p>/412/</p>
            </RatingsPreview>
            <Buttons>
              <Button btnStyle="simple" border size="small"><Icon icon="shopping-cart-alt" size={15}  color= {colors.colorPrimary}/></Button>
              <Button size="small"><b>Install</b></Button>
            </Buttons>
          </Footer>
        </PluginCard>
        <PluginCard>
          <PluginPic />
          <b>Ecommerce plugin</b>
          <p>
            by New Media Group in <b>EXM</b>
          </p>
          <Footer>
            <RatingsPreview>
              <Rating
                // name="half-rating-read"
                // defaultValue={2.5}
                // precision={0.5}
                // size="small"
                // readOnly
              />
              <p>/412/</p>
            </RatingsPreview>
            <Buttons>
              <Button btnStyle="simple" border size="small"><Icon icon="shopping-cart-alt" size={15}  color= {colors.colorPrimary}/></Button>
              <Button size="small"><b>Install</b></Button>
            </Buttons>
          </Footer>
        </PluginCard>
        <PluginCard>
          <PluginPic />
          <b>Ecommerce plugin</b>
          <p>
            by New Media Group in <b>EXM</b>
          </p>
          <Footer>
            <RatingsPreview>
              <Rating
                // name="half-rating-read"
                // defaultValue={2.5}
                // precision={0.5}
                // size="small"
                // readOnly
              />
              <p>/412/</p>
            </RatingsPreview>
            <Buttons>
              <Button btnStyle="simple" border size="small"><Icon icon="shopping-cart-alt" size={15}  color= {colors.colorPrimary}/></Button>
              <Button size="small"><b>Install</b></Button>
            </Buttons>
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
