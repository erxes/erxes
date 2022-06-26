import React, { useEffect, useState } from 'react';
import { __, Button, ModalTrigger, Wrapper } from '@erxes/ui/src';
import CreateLabelContainer from '../containers/CreateLabel';
import ConfigContainer from '../containers/Config';
import ListContainer from '../containers/List';
import FormContainer from '../containers/Form';

type Props = {
  listData: any;
  refetch: () => void;
  addData: (doc: any) => void;
};

const SalesPlans = (props: Props) => {
  const { listData, refetch, addData } = props;

  const [data, setData] = useState(listData);

  useEffect(() => setData(listData), [listData]);

  const renderList = () => {
    return <ListContainer data={data} refetch={refetch} />;
  };

  const renderAdd = () => {
    const createLabelContent = (formProps: any) => {
      return <CreateLabelContainer {...formProps} />;
    };

    const manageConfigContent = (formProps: any) => {
      return <ConfigContainer {...formProps} />;
    };

    const createPlanContent = (formProps: any) => {
      return <FormContainer {...formProps} submit={addData} />;
    };

    const createLabelTrigger = (
      <Button type="button" icon="processor" size="small" uppercase={false}>
        Manage Labels
      </Button>
    );

    const manageConfigTrigger = (
      <Button type="button" icon="processor" size="small" uppercase={false}>
        Manage Day Configs
      </Button>
    );

    const createPlanTrigger = (
      <Button
        type="button"
        btnStyle="success"
        icon="plus-circle"
        size="small"
        uppercase={false}
      >
        Create sales plan
      </Button>
    );

    return (
      <>
        <ModalTrigger
          size="lg"
          title={'Manage Labels'}
          autoOpenKey="showSLManageLabels"
          trigger={createLabelTrigger}
          content={createLabelContent}
          enforceFocus={false}
        />
        <ModalTrigger
          size="lg"
          title={'Manage Day Configs'}
          autoOpenKey="showSLManageDayConfigs"
          trigger={manageConfigTrigger}
          content={manageConfigContent}
          enforceFocus={false}
        />
        <ModalTrigger
          size="lg"
          title={'Create Sales Log'}
          autoOpenKey="showSLCreateSalesLogModal"
          trigger={createPlanTrigger}
          content={createPlanContent}
          enforceFocus={false}
        />
      </>
    );
  };

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Sales Plans')}
          breadcrumb={[{ title: __('Sales Plans') }]}
        />
      }
      content={renderList()}
      actionBar={<Wrapper.ActionBar right={renderAdd()} left={<></>} />}
    />
  );
};

export default SalesPlans;
