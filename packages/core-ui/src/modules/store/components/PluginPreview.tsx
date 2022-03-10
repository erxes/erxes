import Icon from "modules/common/components/Icon";
import Button from "./Button";
import { colors, dimensions } from "modules/common/styles";
import { __ } from "modules/common/utils";
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import styledTS from "styled-components-ts";
import CollapseFilter from "./CollapseFilter";
// import { Rating } from "@mui/material";

const MainContainer = styled.div`
  margin: 20px;
  border-bottom: 1px solid ${colors.borderPrimary};
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
  height: 240px;
  width: 24%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const PluginPic = styled.div`
  width: 100%;
  background: ${colors.bgMain};
  height: 130px;
  border-radius: 4px;
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
          <h5>
            <b>{this.props.header}</b>
          </h5>
          <Button btnStyle="link">View all</Button>
        </Header>
        {this.renderList()}
      </MainContainer>
    );
  }
}

export default PluginPreview;
