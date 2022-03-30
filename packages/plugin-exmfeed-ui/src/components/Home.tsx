import React, { useState } from 'react';
import Icon from '@erxes/ui/src/components/Icon';
import { Link } from 'react-router-dom';
import { Wrapper } from '@erxes/ui/src/layout';
import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs/index';
import Form from '../containers/Form';
import ThankForm from '../containers/ThankForm';
import List from '../containers/List';
import { FeedLayout, MainContent, TabContent } from '../styles';
import ThankList from '../containers/ThankList';

type Props = {
  queryParams: any;
};

export default function Home(props: Props) {
  const [currentTab, setCurrentTab] = useState('post');
  const { queryParams } = props;

  const onClickTab = (type: string) => {
    setCurrentTab(type);
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

    return (
      <>
        <Form contentType={currentTab} />
        <List queryParams={queryParams} contentType={currentTab} />
      </>
    );
  };

  const renderContent = () => {
    return (
      <FeedLayout>
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
            Bravo{' '}
            <Link target="_blank" to={`/settings/properties?type=exmFeedBravo`}>
              <Icon color="black" icon="cog" />
            </Link>
          </TabTitle>
          <TabTitle
            className={currentTab === 'thankyou' ? 'active' : ''}
            onClick={() => onClickTab('thankyou')}
          >
            Thank you
          </TabTitle>
          <TabTitle
            className={currentTab === 'publicHoliday' ? 'active' : ''}
            onClick={() => onClickTab('publicHoliday')}
          >
            Public holiday
          </TabTitle>
        </Tabs>
        <TabContent>{renderTabContent()}</TabContent>
      </FeedLayout>
    );
  };

  return (
    <Wrapper
      header={
        <Wrapper.Header title={'Feed'} breadcrumb={[{ title: 'Feed' }]} />
      }
      content={<MainContent>{renderContent()}</MainContent>}
    />
  );
}
