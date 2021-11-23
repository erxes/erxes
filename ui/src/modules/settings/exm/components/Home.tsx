import React from 'react';

import HeaderDescription from 'modules/common/components/HeaderDescription';
import { __ } from '../../../common/utils';
import Wrapper from '../../../layout/components/Wrapper';
import EditForm from '../containers/EditForm';
import AddForm from '../containers/AddForm';
import { IExm } from '../types';

type Props = {
  exm?: IExm;
};

function Home(props: Props) {
  const { exm } = props;

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Exm'), link: '/settings/exm' }
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
      content={content()}
    />
  );
}

export default Home;
