import React from 'react';
import { __, Wrapper } from '@erxes/ui/src';
import { Title } from '@erxes/ui/src/styles/main';
import Form from '../containers/Form';

type Props = {
  labels: any[];
  type: string;
  setType: (type: string) => void;
  save: (data: any) => void;
};

const CreatePlan = (props: Props) => {
  const { labels, type, setType, save } = props;

  const content = (
    <Form labels={labels} type={type} setType={setType} submit={save} />
  );

  const actionBarLeft = <Title>{__('Create Plan')}</Title>;

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title="Sales Plans Create"
          breadcrumb={[
            { title: __('Settings'), link: '/settings' },
            { title: __('Sales Plans'), link: '/settings/sales-plans' },
            { title: __('Create Plan') }
          ]}
        />
      }
      actionBar={<Wrapper.ActionBar left={actionBarLeft} />}
      content={content}
    />
  );
};

export default CreatePlan;
