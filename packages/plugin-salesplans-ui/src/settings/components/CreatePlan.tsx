import React from 'react';
import { __, Wrapper } from '@erxes/ui/src';
import { Title } from '@erxes/ui/src/styles/main';
import FormContainer from '../containers/Form';

type Props = {
  save: (data: any) => void;
};

const CreatePlan = (props: Props) => {
  const actionBarLeft = <Title>{__('Create Plan')}</Title>;

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title="Sales Plans Create"
          breadcrumb={[
            { title: __('Sales Plans'), link: '/sales-plans' },
            { title: __('Create Plan') }
          ]}
        />
      }
      actionBar={<Wrapper.ActionBar left={actionBarLeft} />}
      content={<FormContainer submit={props.save} />}
    />
  );
};

export default CreatePlan;
