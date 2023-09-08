import {
  Card,
  FeedLayout,
  OverflowWrapper,
  Row,
  SingleEvent,
  TabContent,
} from "../styles";
import { MainContainer, SideContainer } from "../../layout/styles";
import React, { useState } from "react";
import { TabTitle, Tabs } from "../../common/tabs";

import ChatList from "../containers/chat/ChatList";
import Form from "../containers/feed/Form";
import { IUser } from "../../auth/types";
import Icon from "../../common/Icon";
import List from "../containers/feed/List";
import ThankForm from "../containers/feed/ThankForm";
import ThankList from "../containers/feed/ThankList";
import { Wrapper } from "../../layout";
import { __ } from "../../../utils";

type Props = {
  queryParams: any;
  currentUser: IUser;
};

export default function Home(props: Props) {
  const [currentTab, setCurrentTab] = useState("post");
  const { queryParams } = props;

  const onClickTab = (type: string) => {
    setCurrentTab(type);
  };

  const renderTabContent = () => {
    if (currentTab === "thankyou") {
      return (
        <>
          <ThankForm queryParams={queryParams} />
          <ThankList queryParams={queryParams} />
        </>
      );
    }

    return (
      <>
        <Form contentType={currentTab} />
        <List queryParams={queryParams} contentType={currentTab} />
      </>
    );
  };

  const renderRightSidebar = () => {
    return (
      <>
        <Card>
          <label>{__("Today`s events")}</label>
          <SingleEvent>
            <div className="image-wrapper">
              <img src="/static/event.jpg" alt="event-img" />
            </div>
            <div>
              <b>IT Department Manager Blogger Entrepenour list</b>
              <span>thu, oct 13 6:30pm</span>
            </div>
          </SingleEvent>
        </Card>
        <Card>
          <label>{__("Birthdays")}</label>
          <SingleEvent>
            <Icon icon="gift" size={30} />
            <div>
              <b>Anu-Ujin Bat-Ulzii and 2 others have birthdays today.</b>
            </div>
          </SingleEvent>
        </Card>
        <Card>
          <label>{__("Contacts")}</label>
          <ChatList currentUser={props.currentUser} />
        </Card>
      </>
    );
  };

  const renderContent = () => {
    return (
      <FeedLayout>
        <Row>
          <MainContainer>
            <OverflowWrapper>
              <Tabs full={true}>
                <TabTitle
                  className={currentTab === "post" ? "active" : ""}
                  onClick={() => onClickTab("post")}
                >
                  Post
                </TabTitle>
                <TabTitle
                  className={currentTab === "event" ? "active" : ""}
                  onClick={() => onClickTab("event")}
                >
                  Event
                </TabTitle>
                <TabTitle
                  className={currentTab === "bravo" ? "active" : ""}
                  onClick={() => onClickTab("bravo")}
                >
                  Bravo
                </TabTitle>
                <TabTitle
                  className={currentTab === "publicHoliday" ? "active" : ""}
                  onClick={() => onClickTab("publicHoliday")}
                >
                  Public holiday
                </TabTitle>
              </Tabs>
              <TabContent>{renderTabContent()}</TabContent>
            </OverflowWrapper>
          </MainContainer>
          <SideContainer>
            <OverflowWrapper>{renderRightSidebar()}</OverflowWrapper>
          </SideContainer>
        </Row>
      </FeedLayout>
    );
  };

  return (
    <Wrapper
      header={<Wrapper.Header title={"Feed"} />}
      content={renderContent()}
      transparent={true}
      initialOverflow={true}
    />
  );
}
