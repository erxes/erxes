import React from 'react';

import { __ } from '@erxes/ui/src/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import EditForm from '../containers/EditForm';
import AddForm from '../containers/AddForm';
import { IExm } from '../types';

type Props = {
  exm?: IExm;
};

function Home(props: Props) {
  const { exm } = props;

  const leftActionBar = <div>{exm ? exm.name : ''}</div>;

  const content = () => {
    if (exm) {
      return <EditForm exm={exm} />;
    }

    return <AddForm />;
  };

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={'Exm core'}
          breadcrumb={[{ title: 'Exm core' }]}
        />
      }
      actionBar={<Wrapper.ActionBar left={leftActionBar} />}
      content={content()}
    />
  );
}

export default Home;
