import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrapper } from '@erxes/ui/src';
import { __ } from '@erxes/ui/src/utils';
import { Button } from '@erxes/ui/src';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import CreateLabelContainer from '../containers/CreateLabel';
import ConfigContainer from '../containers/Config';
import ListContainer from '../containers/List';
import { BarItems as BarItemsCommon } from '@erxes/ui/src/layout/styles';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import { Icon, EmptyState } from '@erxes/ui/src';

type Props = {
  listData: any;
  refetch: () => void;
};

const SalesPlans = (props: Props) => {
  const { listData, refetch } = props;
  const [data, setData] = useState(listData);

  useEffect(() => setData(listData), [listData]);

  const renderFilter = () => {
    const Filter = (
      <BarItemsCommon>
        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-board">
            {/* <HeaderButton rightIconed={true}> */}
            {__('Type')}
            <Icon icon="angle-down" />
            {/* </HeaderButton> */}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <EmptyState
              icon="web-grid-alt"
              text="No other boards"
              size="small"
            />
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-board">
            {/* <HeaderButton rightIconed={true}> */}
            {__('Created at')}
            <Icon icon="angle-down" />
            {/* </HeaderButton> */}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <EmptyState
              icon="web-grid-alt"
              text="No other boards"
              size="small"
            />
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-board">
            {/* <HeaderButton rightIconed={true}> */}
            {__('Created by')}
            <Icon icon="angle-down" />
            {/* </HeaderButton> */}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <EmptyState
              icon="web-grid-alt"
              text="No other boards"
              size="small"
            />
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-board">
            {/* <HeaderButton rightIconed={true}> */}
            {__('Status')}
            <Icon icon="angle-down" />
            {/* </HeaderButton> */}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <EmptyState
              icon="web-grid-alt"
              text="No other boards"
              size="small"
            />
          </Dropdown.Menu>
        </Dropdown>
      </BarItemsCommon>
    );
    return <>{Filter}</>;
  };

  const renderList = () => {
    return <ListContainer data={data} refetch={refetch} />;
  };

  const renderAdd = () => {
    const config = (formProps: any) => {
      return <CreateLabelContainer {...formProps} />;
    };

    const dayConfig = (formProps: any) => {
      return <ConfigContainer {...formProps} />;
    };

    const createLabel = (
      <Button type="button" icon="processor" size="small" uppercase={false}>
        Manage Labels
      </Button>
    );

    const manageConfig = (
      <Button type="button" icon="processor" size="small" uppercase={false}>
        Manage Day Configs
      </Button>
    );

    const createPlan = (
      <Link to="/sales-plans/create">
        <Button
          type="button"
          btnStyle="success"
          icon="plus-circle"
          size="small"
          uppercase={false}
        >
          Create sales plan
        </Button>
      </Link>
    );

    return (
      <>
        <ModalTrigger
          size="lg"
          title={'Manage Labels'}
          autoOpenKey="showKBAddModal"
          trigger={createLabel}
          content={config}
          enforceFocus={false}
        />
        <ModalTrigger
          size="lg"
          title={'Manage Day Configs'}
          autoOpenKey="showKBAddModal"
          trigger={manageConfig}
          content={dayConfig}
          enforceFocus={false}
        />
        {createPlan}
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
    ></Wrapper>
  );
};

export default SalesPlans;
