import React from 'react';
import { __, Wrapper } from '@erxes/ui/src';
import { Title } from '@erxes/ui/src/styles/main';
import FormContainer from '../containers/Form';

type Props = {
  save: (data: any) => void;
};

const EditPlan = (props: Props) => {
  const actionBarLeft = <Title>{__('Edit Plan')}</Title>;

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title="Sales Plans Edit"
          breadcrumb={[
            { title: __('Sales Plans'), link: '/sales-plans' },
            { title: __('Edit Plan') }
          ]}
        />
      }
      actionBar={<Wrapper.ActionBar left={actionBarLeft} />}
      content={<FormContainer submit={props.save} edit={true} />}
    />
  );
};

export default EditPlan;
