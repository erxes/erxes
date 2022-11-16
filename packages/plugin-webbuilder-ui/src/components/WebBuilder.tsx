import React, { useEffect, useState } from 'react';

import { BarItems } from '@erxes/ui/src/layout/styles';
import ContentTypeList from '../containers/contentTypes/List';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EntriesList from '../containers/entries/List';
import { IRouterProps } from '@erxes/ui/src/types';
import Pages from '../containers/pages/Pages';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import SelectSite from '../containers/sites/SelectSite';
import SideBar from '../containers/Sidebar';
import Sites from '../containers/sites/List';
import TemplatesList from '../containers/templates/List';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils';
import { router } from '@erxes/ui/src/utils';
import { withRouter } from 'react-router-dom';

type Props = {
  step: string;
  queryParams: any;
  history: any;
} & IRouterProps;

function WebBuilder(props: Props) {
  const [Component, setComponent] = useState(<div />);
  const [RightActionBar, setRightActionBar] = useState(<div />);
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(true);

  const { step, queryParams, history } = props;
  const site = localStorage.getItem('webbuilderSiteId') || '';

  useEffect(() => {
    switch (step) {
      case 'contenttypes':
        setComponent(
          <ContentTypeList
            queryParams={queryParams}
            getActionBar={setRightActionBar}
            setCount={setCount}
            selectedSite={site}
          />
        );

        setLoading(false);
        break;

      case 'entries':
        setComponent(
          <EntriesList
            queryParams={queryParams}
            getActionBar={setRightActionBar}
            setCount={setCount}
          />
        );

        setLoading(false);
        break;

      case 'pages':
        setComponent(
          <Pages
            getActionBar={setRightActionBar}
            setCount={setCount}
            queryParams={queryParams}
            history={history}
            selectedSite={site}
          />
        );

        setLoading(false);
        break;

      case 'templates':
        setComponent(
          <TemplatesList
            setCount={setCount}
            queryParams={queryParams}
            selectedSite={site}
          />
        );

        setRightActionBar(<></>);

        setLoading(false);
        break;

      case 'sites':
        setComponent(
          <Sites
            getActionBar={setRightActionBar}
            setCount={setCount}
            queryParams={queryParams}
            selectedSite={site}
          />
        );

        setLoading(false);
        break;

      default:
        setComponent(<div />);
        setLoading(false);
    }
  }, [queryParams]);

  const breadcrumb = [{ title: __('Webbuilder') }];

  const onChangeSite = value => {
    const { history } = props;

    const siteId = value;

    localStorage.setItem('webbuilderSiteId', siteId);

    router.setParams(history, { siteId });
  };

  const actionBarLeft = () => {
    return (
      <BarItems>
        <SelectSite initialValue={site} onSelect={onChangeSite} />
      </BarItems>
    );
  };

  return (
    <>
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Webbuilder Entries')}
            breadcrumb={breadcrumb}
          />
        }
        actionBar={
          <Wrapper.ActionBar right={RightActionBar} left={actionBarLeft()} />
        }
        leftSidebar={
          <SideBar queryParams={queryParams} type={step} selectedSite={site} />
        }
        content={
          <DataWithLoader
            data={Component}
            loading={loading}
            emptyText="There is no data"
            emptyImage="/images/actions/5.svg"
          />
        }
        footer={<Pagination count={count} />}
        transparent={true}
      />
    </>
  );
}

export default withRouter<Props>(WebBuilder);
