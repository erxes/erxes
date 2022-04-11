import { __ } from "@erxes/ui/src/utils";
import { colors, dimensions } from "modules/common/styles";
import styled from "styled-components";
import styledTS from "styled-components-ts";
import Wrapper from "./Wrapper";
import React from "react";
import RightSidebar from "./RightSidebar";
import BreadCrumb from "@erxes/ui/src/components/breadcrumb/BreadCrumb";
import Button from "../Button";
import { Flex } from "@erxes/ui/src/styles/main";
import { Card, ListHeader } from "../../styles";

const MainContainer = styled.div`
  position: relative;
  border-radius: 8px;
  border: 1px solid ${colors.borderDarker};
  padding: ${dimensions.unitSpacing}px;
`;

const PluginTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Plugin = styled.div`
  display: flex;
  align-items: center;
`;

const Carousel = styled.div`
  height: 250px;
  width: 100%;
  background-color: ${colors.bgGray};
  border-radius: 8px;
  margin: ${dimensions.unitSpacing}px 0;
`;

const MemberPic = styled.div`
  width: 80px;
  height: 80px;
  padding: ${dimensions.unitSpacing}px;
  border: 2px solid ${colors.borderDarker};
  background: ${colors.bgMain};
  border-radius: 50%;
`;

const Information = styled.div`
  display: flex;
  height: 80px;
  flex-direction: column;
  justify-content: space-between;
  margin: 0px 12px;
`;

const Hashtag = styled.div`
  border-radius: 4px;
  color: ${colors.colorWhite};
  background: ${colors.colorBlack};
  padding: 2px 6px;
  margin-right: 5px;
  font-size: 11px;

  $:nth-last-child(1) {
    margin-right: 0;
  }
`;

const Rating = styled.div`
  height: ${dimensions.coreSpacing}px;
  width: 90px;
  background: ${colors.bgGray};
`;

const ColorHeader = styledTS<{ size?: string }>(styled.div)`
  color: ${colors.colorPrimary};
  font-size: ${(props) => props.size && props.size}px;
`;

const AddOnPic = styled.div`
  width: 100%;
  background: ${colors.bgMain};
  height: 110px;
  border-radius: 4px;
`;

const AddOnInformation = styled.div`
  margin: ${dimensions.unitSpacing}px 0 ${dimensions.unitSpacing}px 0;
`;

const Detail = styled.div`
  border-bottom: 1px solid ${colors.borderPrimary};
  padding-bottom: ${dimensions.unitSpacing}px;
`;

const AddOn = styled.div`
  border-radius: 10px;
  color: ${colors.colorWhite};
  background: ${colors.colorCoreYellow};
  padding: 2px 8px;
  font-size: 11px;
  width: 60px;
`;

const CardInformation = styled.div`
  margin-bottom: ${dimensions.unitSpacing}px;
  display: flex;
  justify-content: space-between;
`;

type Props = {
  text: string;
};

type State = {
  count: number;
};

class PluginDetails extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      count: 0,
    };
  }

  renderList = () => {
    const titles = [
      "Company Branding",
      "Integrations",
      "Team members",
      "Email sending",
    ];

    return (
      <Flex>
        {titles.map((title) => (
          <Card>
            <AddOnPic />
            <AddOnInformation>
              <CardInformation>
                <div>
                  <b>{title}</b>
                  <AddOn>
                    <b>Add-On</b>
                  </AddOn>
                </div>
                <Button btnStyle="link" padding="8px 10px" background={true} style={{color: '#000'}}>
                  <b>$5</b>
                </Button>
              </CardInformation>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod.
              </p>
            </AddOnInformation>
          </Card>
        ))}
      </Flex>
    );
  };

  render() {
    const breadcrumb = [
      { title: __("Store"), link: "/store" },
      { title: "WeeCommere Cart all in One" },
    ];
    const space = "\u00a0";

    const content = (
      <MainContainer>
        <PluginTitle>
          <Plugin>
            <MemberPic />
            <Information>
              <b>WooCommerce Cart All in One</b>
              <Flex>
                <Hashtag>#Free</Hashtag>
                <Hashtag>#Marketing</Hashtag>
                <Hashtag>#Ecommerce</Hashtag>
              </Flex>
              <Flex>
                <Rating /> {/* replace with rating stars* */}
                <p>{space}4.5</p>
              </Flex>
            </Information>
          </Plugin>
          <Button padding="12px">
            <b>Follow</b> +11k
          </Button>
        </PluginTitle>
        <Carousel />
        <Detail>
          <ListHeader>
            <ColorHeader>
              <b>About Plugin</b>
            </ColorHeader>
          </ListHeader>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </Detail>
        <ListHeader>
          <ColorHeader>
            <b>Support add-ons</b>
          </ColorHeader>
        </ListHeader>
        {this.renderList()}
      </MainContainer>
    );

    return (
      <Wrapper
        mainHead={<BreadCrumb breadcrumbs={breadcrumb} />}
        rightSidebar={<RightSidebar />}
        content={content}
      />
    );
  }
}

export default PluginDetails;
