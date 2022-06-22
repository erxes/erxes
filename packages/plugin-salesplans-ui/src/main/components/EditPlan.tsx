import React from 'react';
import { __, Wrapper, DataWithLoader } from '@erxes/ui/src';
import { Title } from '@erxes/ui/src/styles/main';
import FormContainer from '../containers/Form';

type Props = {
  loading: boolean;
  data: any;
  update: (data: any) => void;
};

const EditPlan = (props: Props) => {
  const actionBarLeft = <Title>{__('Edit Plan')}</Title>;
  const content = (
    <DataWithLoader
      loading={props.loading}
      data={<FormContainer initialData={props.data} submit={props.update} />}
    />
  );

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
      content={content}
    />
  );
};

export default EditPlan;
