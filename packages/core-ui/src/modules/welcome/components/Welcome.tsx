// import { IUser } from "modules/auth/types";
// import Icon from 'modules/common/components/Icon';
import { DescImg } from "@erxes/ui/src/components/HeaderDescription";
import { __ } from "modules/common/utils";
import Wrapper from "modules/layout/components/Wrapper";
import React from "react";
import { WELCOME, CARDS } from "../constants";
import {
  BoxedStep,
  BoxHeader,
  Left,
  Boxes,
  Card,
  Header,
} from "../styles";
import Box from "@erxes/ui/src/components/Box";
import Icon from "@erxes/ui/src/components/Icon";
import Button from "@erxes/ui/src/components/Button";
import { WidgetBackgrounds } from "@erxes/ui-settings/src/styles";
import { Step, Steps } from '@erxes/ui/src/components/step';
import ProgressBar from '@erxes/ui/src/components/ProgressBar';

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
    title: string,
    image?: string,
    description?: string
  ) => {
    return (
      <BoxHeader>
        <Left>
          {image && <DescImg src={image} />}
          <div>
            <h4>{title}</h4>
            {description}
          </div>
        </Left>
        <ProgressBar percentage={20} type="circle" />
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

  const renderSetup = () => {
    return (<>
    <Steps type="stepperColumn" allStep={5} titles={['General information', 'General system configuration', 'Campaign config / File Upload', 'Constant', 'Connecting service']} >
      <Step type="stepperColumn" noButton={true}>hi</Step>
      <Step type="stepperColumn" noButton={true}>hi</Step>
      <Step type="stepperColumn" noButton={true}>hi</Step>
      <Step type="stepperColumn" noButton={true}>hi</Step>
      <Step type="stepperColumn" noButton={true}>hi</Step>
    </Steps>
    {/* <StepperColumn title="General information" complete= {true} stepNumber={1}>hi</StepperColumn>
    <StepperColumn title="General information" complete= {false} stepNumber={2}>hi</StepperColumn>
    <StepperColumn title="General information" complete= {false} stepNumber={3}>hi</StepperColumn>
    <StepperColumn title="General information" complete= {false} stepNumber={4}>hi</StepperColumn>
    <StepperColumn title="General information" complete= {false} stepNumber={5}>hi</StepperColumn> */}
    </>);
  };

  const renderGuide = () => {
    return (
      <WidgetBackgrounds>
        <Boxes>
          <Box title="Admin">hello</Box>
          <Box title="Marketing">hello</Box>
        </Boxes>
        <Boxes>
          <Box title="Sales">hello</Box>
          <Box title="Support">hello</Box>
        </Boxes>
      </WidgetBackgrounds>
    );
  };

  const renderCommunity = () => {
    const community = [
      {
        name: "github",
        link: "https://github.com/erxes/erxes",
        icon: "github-circled",
      },
      { name: "Discord", link: "", icon: "" },
      { name: "Youtube", link: "", icon: "youtube-play" },
      { name: "Figma", link: "", icon: "" },
      { name: "Twitter", link: "", icon: "twitter" },
      { name: "Facebook", link: "", icon: "facebook-official" },
      { name: "Blog", link: "", icon: "" },
    ];
    return (
      <BoxedStep>
        {renderBoxHeader(
          "Join our community",
          "",
          "Discuss with team member, contributors and developers on different channels"
        )}
        <WidgetBackgrounds>
          {community.map((com) => (
            <Button href={com.link} btnStyle="simple" icon={com.icon}>
              {com.name}
            </Button>
          ))}
        </WidgetBackgrounds>
      </BoxedStep>
    );
  };

  const renderCard = (
    key: string,
    background: string,
    title: string,
    desc: string,
    button: string,
    icon: string
  ) => {
    return (
      <>
        <Card backgroundImage={background}>
          <Header>
            <h1>{title}</h1>
            <p>{desc}</p>
          </Header>
          <br />
          <Button size="large">
            {button}
            <Icon icon={icon} />
          </Button>
        </Card>
        {key === "market" && renderCommunity()}
      </>
    );
  };

  const content = (
    <>
      {WELCOME.map((group) => (
        <BoxedStep>
          {renderBoxHeader(group.title, group.image, group.description)}
          {group.key === "documentation" && renderDocumentation()}
          {group.key === "usingGuide" && renderGuide()}
          {group.key === 'setup' && renderSetup()}
          {/* {group.key === "community" && renderCommunity()} */}
        </BoxedStep>
      ))}
      {CARDS.map((card) =>
        renderCard(
          card.key,
          card.background,
          card.title,
          card.desc,
          card.button,
          card.icon
        )
      )}
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
      initialOverflow={true}
    />
  );
}

export default Welcome;
