import React, { useState } from 'react';
import Icon from 'erxes-ui/lib/components/Icon';
import { Link } from 'react-router-dom';
import { Wrapper } from 'erxes-ui';
import { Tabs, TabTitle } from 'erxes-ui/lib/components/tabs/index';
import Form from '../containers/Form';
import ThankForm from '../containers/ThankForm';
import List from '../containers/List';
import { FeedLayout } from '../styles';
import ThankList from '../containers/ThankList';
import Select from 'react-select-plus';
import { options } from '../constants';

type Props = {
  queryParams: any;
};

export default function Home(props: Props) {
  const [currentTab, setCurrentTab] = useState('post');
  const { queryParams } = props;
  const [filter, setFilter] = useState('');

  const filterOnChange = value => {
    setFilter(value.value);
  };

  const filterContent = () => {
    return (
      <Select
        clearable={false}
        value={filter}
        onChange={filterOnChange.bind(this)}
        placeholder={'filter'}
        options={options}
      />
    );
  };

  const renderTabContent = () => {
    if (currentTab === 'thank') {
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
        {filterContent()}
        <List queryParams={queryParams} filter={filter} />
      </>
    );
  };

  const content = () => {
    return (
      <FeedLayout>
        <Tabs full={true}>
          <TabTitle
            className={currentTab === 'post' ? 'active' : ''}
            onClick={() => setCurrentTab('post')}
          >
            Post
          </TabTitle>
          <TabTitle
            className={currentTab === 'event' ? 'active' : ''}
            onClick={() => setCurrentTab('event')}
          >
            Event
          </TabTitle>
          <TabTitle
            className={currentTab === 'bravo' ? 'active' : ''}
            onClick={() => setCurrentTab('bravo')}
          >
            Bravo{' '}
            <Link target='_blank' to={`/settings/properties?type=exmFeedBravo`}>
              <Icon color='black' icon='cog' />
            </Link>
          </TabTitle>
          <TabTitle
            className={currentTab === 'thank' ? 'active' : ''}
            onClick={() => setCurrentTab('thank')}
          >
            Thank you
          </TabTitle>
          <TabTitle
            className={currentTab === 'publicHoliday' ? 'active' : ''}
            onClick={() => setCurrentTab('publicHoliday')}
          >
            Public holiday
          </TabTitle>
        </Tabs>
        {renderTabContent()}
      </FeedLayout>
    );
  };

  return (
    <Wrapper
      header={<Wrapper.Header title={'Feed'} />}
      content={
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {content()}
        </div>
      }
    />
  );
}
