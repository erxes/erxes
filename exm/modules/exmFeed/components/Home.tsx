import {
  Card,
  FeedLayout,
  OverflowWrapper,
  Row,
  SingleEvent,
  TabContent,
  WidgetChatWrapper,
  NoEvent,
  FeedWrapper,
  FlexAlignCenter
} from '../styles';
import { MainContainer, SideContainer } from '../../layout/styles';
import React, { useState } from 'react';
import { TabTitle, Tabs } from '../../common/tabs';

import ChatList from '../containers/chat/ChatList';
import Form from '../containers/feed/Form';
import { IUser } from '../../auth/types';
// import Icon from '../../common/Icon';
import List from '../containers/feed/List';
import ThankForm from '../containers/feed/ThankForm';
import ThankList from '../containers/feed/ThankList';
import { Wrapper } from '../../layout';
import { __ } from '../../../utils';
import WidgetChatWindow from '../containers/chat/WidgetChatWindow';
import Icon from '../../common/Icon';
import { readFile } from '../../common/utils';

type Props = {
  queryParams: any;
  todayEvents?: any;
  currentUser: IUser;
};

const LOCALSTORAGE_KEY = 'erxes_active_chats';

export default function Home(props: Props) {
  const [currentTab, setCurrentTab] = useState('post');
  const { queryParams, currentUser, todayEvents } = props;
  const [activeChatIds, setActiveChatIds] = useState<any[]>(
    JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY) || '[]')
  );

  const onClickTab = (type: string) => {
    setCurrentTab(type);
  };

  const handleActive = (_chatId: string) => {
    if (checkActive(_chatId)) {
      updateActive(activeChatIds.filter((c) => c !== _chatId));
    } else {
      updateActive([...activeChatIds, _chatId]);
    }
  };

  const updateActive = (_chats: any[]) => {
    setActiveChatIds(_chats);

    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(_chats));
  };

  const checkActive = (_chatId: string) => {
    return activeChatIds.indexOf(_chatId) !== -1;
  };

  const renderTabContent = () => {
    if (currentTab === 'thankyou') {
      return (
        <>
          <ThankForm queryParams={queryParams} />
          <ThankList queryParams={queryParams} />
        </>
      );
    }

    if (currentTab === 'welcome') {
      return (
        <>
          <List queryParams={queryParams} contentType={currentTab} />
        </>
      );
    }

    return (
      <>
        <Form contentType={currentTab} currentUser={currentUser} />
        <List queryParams={queryParams} contentType={currentTab} />
      </>
    );
  };

  const NoTodaysEvent = (
    <NoEvent>
      <Icon icon="calendar-alt" size={33} />
      There is no event
    </NoEvent>
  );

  const renderRightSidebar = () => {
    return (
      <>
        <Card>
          <label>{__("Today's events")}</label>
          <SingleEvent>
            {todayEvents
              ? todayEvents.every((v) => v === null)
                ? NoTodaysEvent
                : todayEvents.map((e) => {
                    if (e === null) {
                      return null;
                    }

                    return (
                      <FlexAlignCenter key={e._id}>
                        {e.images.length > 0 && (
                          <div className="image-wrapper">
                            <img
                              src={readFile(e.images[0].url)}
                              alt="event-img"
                            />
                          </div>
                        )}
                        <div>
                          <b>{e.title}</b>
                          <span>{e.eventData.where}</span>
                        </div>
                      </FlexAlignCenter>
                    );
                  })
              : NoTodaysEvent}
          </SingleEvent>
        </Card>
        {/* <Card>
          <label>{__('Birthdays')}</label>
          <SingleEvent>
            <Icon icon="gift" size={30} />
            <div>
              <b>Anu-Ujin Bat-Ulzii and 2 others have birthdays today.</b>
            </div>
          </SingleEvent>
        </Card> */}
        <Card>
          <ChatList
            handleActive={(_chatId) => handleActive(_chatId)}
            currentUser={props.currentUser}
          />
        </Card>
      </>
    );
  };

  const renderContent = () => {
    return (
      <>
        <FeedLayout>
          <Row>
            <MainContainer>
              <Tabs full={true}>
                <TabTitle
                  className={currentTab === 'post' ? 'active' : ''}
                  onClick={() => onClickTab('post')}
                >
                  Post
                </TabTitle>
                <TabTitle
                  className={currentTab === 'event' ? 'active' : ''}
                  onClick={() => onClickTab('event')}
                >
                  Event
                </TabTitle>
                <TabTitle
                  className={currentTab === 'bravo' ? 'active' : ''}
                  onClick={() => onClickTab('bravo')}
                >
                  Bravo
                </TabTitle>
                <TabTitle
                  className={currentTab === 'publicHoliday' ? 'active' : ''}
                  onClick={() => onClickTab('publicHoliday')}
                >
                  Public holiday
                </TabTitle>
                <TabTitle
                  className={currentTab === 'welcome' ? 'active' : ''}
                  onClick={() => onClickTab('welcome')}
                >
                  Welcome
                </TabTitle>
              </Tabs>
              <FeedWrapper>
                <TabContent>{renderTabContent()}</TabContent>
              </FeedWrapper>
            </MainContainer>
            <SideContainer>
              <OverflowWrapper>{renderRightSidebar()}</OverflowWrapper>
            </SideContainer>
          </Row>
        </FeedLayout>
        <WidgetChatWrapper>
          {activeChatIds.map((c) => (
            <WidgetChatWindow
              key={c._id}
              chatId={c}
              handleActive={handleActive}
              currentUser={currentUser}
            />
          ))}
        </WidgetChatWrapper>
      </>
    );
  };

  return (
    <Wrapper
      header={<Wrapper.Header title={'Feed'} />}
      content={renderContent()}
      transparent={true}
      initialOverflow={true}
    />
  );
}
