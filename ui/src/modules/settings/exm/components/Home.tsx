import React from 'react';

import DataWithLoader from 'modules/common/components/DataWithLoader';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import { __ } from '../../../common/utils';
import Wrapper from '../../../layout/components/Wrapper';
import EditForm from '../containers/EditForm';
import AddForm from '../containers/AddForm';

type Props = {
  exm?: any;
};

function Home(props: Props) {
  const { exm } = props;

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Exm'), link: '/settings/exm' },
    { title: exm ? exm.name : '' }
  ];

  const leftActionBar = <div>{exm ? exm.name : ''}</div>;

  const content = () => {
    if (exm) {
      return <EditForm exm={exm} />;
    }

    return <AddForm />;
  };

  return (
    <Wrapper
      header={<Wrapper.Header title={'Exm'} breadcrumb={breadcrumb} />}
      mainHead={
        <HeaderDescription
          icon="/images/actions/32.svg"
          title={'EXM'}
          description={__('')}
        />
      }
      actionBar={<Wrapper.ActionBar left={leftActionBar} />}
      content={
        <DataWithLoader
          data={content()}
          emptyText="Add an integration in this Brand"
          emptyImage="/images/actions/2.svg"
          loading={false}
        />
      }
    />
  );
}

export default Home;
