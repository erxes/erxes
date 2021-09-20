import React, { useState } from 'react';
import { Wrapper } from 'erxes-ui';
import { Tabs, TabTitle } from 'erxes-ui/lib/components/tabs/index';

import Form from '../containers/Form';
import ThankForm from '../containers/ThankForm';
import List from '../containers/List';
import { FeedLayout, FormContainer, TabLayout } from '../styles';
import ThankList from '../containers/ThankList';

type Props = {
  queryParams: any;
};

export default function Home(props: Props) {
  const [currentTab, setCurrentTab] = useState('post');

  const renderTabContent = () => {
    if (currentTab === 'thank') {
      const { queryParams } = props;

      return (
        <>
          <ThankForm queryParams={queryParams} />
          <ThankList queryParams={queryParams} />
        </>
      );
    }

    return <Form contentType={currentTab} />;
  };

  const content = () => {
    return (
      <FeedLayout>
        <TabLayout>
          <Tabs full={true}>
            <TabTitle
              className={currentTab === 'post' ? 'active' : ''}
              onClick={() => setCurrentTab('post')}
            >
              Post
            </TabTitle>
            <TabTitle
              className={currentTab === 'bravo' ? 'active' : ''}
              onClick={() => setCurrentTab('bravo')}
            >
              Bravo
            </TabTitle>
            <TabTitle
              className={currentTab === 'thank' ? 'active' : ''}
              onClick={() => setCurrentTab('thank')}
            >
              Thank you
            </TabTitle>
            <TabTitle
              className={currentTab === 'event' ? 'active' : ''}
              onClick={() => setCurrentTab('event')}
            >
              Event
            </TabTitle>
          </Tabs>
          <FormContainer>{renderTabContent()}</FormContainer>
        </TabLayout>
        <List queryParams={props.queryParams} />
      </FeedLayout>
    );
  };

  return (
    <Wrapper header={<Wrapper.Header title={'Feed'} />} content={content()} />
  );
}
