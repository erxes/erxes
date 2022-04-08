// import { IUser } from "modules/auth/types";
// import Icon from 'modules/common/components/Icon';
import { DescImg } from "@erxes/ui/src/components/HeaderDescription";
import colors from "modules/common/styles/colors";
import { __ } from "modules/common/utils";
import Wrapper from "modules/layout/components/Wrapper";
import React from "react";
import styled from "styled-components";
import { WELCOME } from "../constants";
import { BoxedStep, BoxHeader, Left, Divider, Boxes } from "../styles";
import Box from "@erxes/ui/src/components/Box";
import { WidgetBackgrounds } from "@erxes/ui-settings/src/styles";

const Header = styled.div`
  h1 {
    margin: 20px 0 5px;
    font-size: 24px;
  }

  p {
    margin: 0;
    font-size: 16px;
    color: ${colors.colorCoreGray};
  }
`;

// const NoBorder = styled.div`
//   input{border-bottom: 0;}
// `;

function Welcome() {
  // const isOpen = (id: string) => {
  //   return window.location.toString().includes(id);
  // };

  const renderHeader = () => {
    return (
      <Header>
        <h1>
          {__("Welcome!")} {"currentUser"}{" "}
          <span role="img" aria-label="Wave">
            👋
          </span>
        </h1>
        <p>
          {__(
            "Enjoy a frictionless development experience and expand upon the erxes platform without modifying the core platform"
          )}
          <br />
          <ul>
            <li>
              {__("Free and fair code licensed experience operating system")}
            </li>
            <li>{__("Monetization - earn from your creations")}</li>
          </ul>
        </p>
      </Header>
    );
  };

  const renderBoxHeader = (
    image: string,
    title: string,
    description?: string
  ) => {
    return (
      <BoxHeader>
        <Left>
          <DescImg src={image} />
          <div>
            <h4>{title}</h4>
            {description}
          </div>
        </Left>
      </BoxHeader>
    );
  };

  const renderDocumentation = () => {
    return (
        <WidgetBackgrounds>
          <Boxes>
            <Box title="Docs">hello</Box>
            <Box title="How To Plugin">hello</Box>
          </Boxes>
          <Boxes>
            <Box title="API">hello</Box>
            <Box title="Plugin Monetization">hello</Box>
          </Boxes>
        </WidgetBackgrounds>
    );
  };

  // const renderSetup = () => {
  //   return (<Divider />)
  // }

  const renderGuide = () => {
    return (
        <WidgetBackgrounds>
          <Boxes>
            <Box title="Docs">hello</Box>
            <Box title="How To Plugin">hello</Box>
          </Boxes>
          <Boxes>
            <Box title="API">hello</Box>
            <Box title="Plugin Monetization">hello</Box>
          </Boxes>
        </WidgetBackgrounds>
    );
  }

  const content = (
    <>
      {WELCOME.map((group) => (
        <BoxedStep>
          {renderBoxHeader(group.image, group.title, group.description)}
          {group.key === "documentation" && renderDocumentation()}
          {group.key === "usingGuide" && renderGuide()}
        </BoxedStep>
      ))}
    </>
  );

  return (
    <Wrapper
      actionBar={
        <Wrapper.ActionBar background="transparent" left={renderHeader()} />
      }
      content={content}
      transparent={true}
      center={true}
    />
  );
}

export default Welcome;
