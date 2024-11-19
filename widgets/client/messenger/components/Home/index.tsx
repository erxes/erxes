import * as React from "react";

import {
  IIntegrationMessengerData,
  IIntegrationMessengerDataMessagesItem,
  IUser,
} from "../../../types";
import { adjustBrightness, getColor, getUiOptions } from "../../utils/util";

import Button from "./../common/Button";
import Card from "./../Card.tsx";
import Container from "../common/Container";
import Featured from "../faq/Featured";
import { IconEnvelope } from "../../../icons/Icons";
import SocialLink from "./../common/SocialLink";
import Supporters from "./../common/Supporters";
import WebsiteApp from "../../containers/websiteApp/WebsiteApp";
import { __ } from "../../../utils";
import { useConversation } from "../../context/Conversation";

type Props = {
  supporters: IUser[];
  loading?: boolean;
  color?: string;
  messengerData: IIntegrationMessengerData;
  isOnline?: boolean;
  activeSupport?: boolean;
};

const Home: React.FC<Props> = ({
  messengerData,
  color,
  isOnline,
  supporters,
  loading,
}) => {
  const { createConversation, toggle } = useConversation();
  const headerRef = React.useRef<HTMLDivElement | null>(null);
  const [headHeight, setHeadHeight] = React.useState(120);
  const [activeSupport, setActiveSupport] = React.useState(true);

  const style = color
    ? {
        background: `linear-gradient(
        119deg,
        ${adjustBrightness(color, -60)} 2.96%,
        ${color} 51.52%,
        #caf4f7 100.08%
      )`,
      }
    : {};

  const { logo } = getUiOptions() || {};

  const messages =
    messengerData.messages || ({} as IIntegrationMessengerDataMessagesItem);

  const greetings = messages.greetings || {};

  React.useEffect(() => {
    if (headerRef.current && headHeight !== headerRef.current.offsetHeight) {
      setHeadHeight(headerRef.current.offsetHeight);
    }
    setActiveSupport(false);
  }, []);

  const handleHideWidget = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    toggle(true);
  };

  const renderGreetings = () => (
    <div className="greeting-info">
      <h3>{greetings.title || __("Welcome")}</h3>
      <div>{greetings.message || __("Welcome description")}</div>
    </div>
  );

  const renderAssistBar = (messengerData: IIntegrationMessengerData) => {
    const links = messengerData.externalLinks || [];

    if (links.length === 0) {
      return null;
    }

    return (
      <Card>
        <div className="contact-channels">
          <span>{__("Talk us on your favourite channels")}</span>
          <div className="channel-list">
            {Object.entries(links).map(([key, { url }]) => {
              return (
                <SocialLink
                  key={key}
                  url={url}
                  icon={
                    <img
                      height={32}
                      width={32}
                      alt={url}
                      src={`https://s2.googleusercontent.com/s2/favicons?domain=${url}&sz=${32}`}
                    />
                  }
                />
              );
            })}
          </div>
        </div>
      </Card>
    );
  };

  const renderGettingStarted = () => {
    const color = getColor();

    return (
      <Card>
        <div className="getting-started-wrapper">
          <span>{__("Getting started")}</span>
          <div className="getting-started-content-wrapper">
            <div className="supporters-info-wrapper">
              <Supporters
                users={supporters}
                isExpanded={false}
                loading={loading}
                isOnline={isOnline}
              />
              <div className="schedule-info-wrapper">
                <span>{__("Our usually reply time")}</span>
                <span
                  className="response-rate"
                  style={{ color: color ? color : "#4f33af" }}
                >
                  💬 {messengerData.responseRate}
                </span>
              </div>
            </div>
            <div>
              <Button icon={<IconEnvelope />} onClick={createConversation}>
                <span className="font-semibold">{__("Send us a message")}</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderWebsiteApps = () => {
    const { websiteApps } = messengerData;

    if (!websiteApps) {
      return null;
    }

    return websiteApps.map((websiteApp) => {
      return (
        <Card key={websiteApp._id}>
          <WebsiteApp websiteApp={websiteApp} />
        </Card>
      );
    });
  };

  const renderHead = () => {
    return (
      <div className="main-contents">
        {renderGettingStarted()}
        {renderAssistBar(messengerData)}
        <Featured />
        {renderWebsiteApps()}
      </div>
    );
  };

  return (
    <Container>
      <div className="home-container">
        <div className="gradient-bg" style={style}>
          <div className="absorbed" />
        </div>
        <div className="home-header-wrapper">
          {/* <div className="header-top">
            {logo ? (
              <img alt="head-logo" src={readFile(logo, 90)} />
            ) : (
              <IconErxes />
            )}
          </div> */}
          {renderGreetings()}
        </div>
        {renderHead()}
      </div>
    </Container>
  );
};

export default Home;
