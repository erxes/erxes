import React, { useEffect, useState } from 'react';
import { Wrapper } from '@erxes/ui';
import { __ } from '@erxes/ui/src/utils';
import { Button } from '@erxes/ui/src';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import CreateSalesPlanContainer from '../containers/CreateSalesPlan';
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

function Home({ listData, refetch }: Props) {
  const [data, setData] = useState(listData);

  useEffect(() => {
    setData(listData);
  }, [listData]);

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
    return <ListContainer data={data} refetch={refetch}></ListContainer>;
  };

  const renderAdd = () => {
    const trigger = (
      <Button type="button" icon="plus-circle" uppercase={false}>
        Create sales plan
      </Button>
    );
    const salesPlan = formProps => {
      return (
        <CreateSalesPlanContainer
          refetch={refetch}
          {...formProps}
        ></CreateSalesPlanContainer>
      );
    };

    const config = formProps => {
      return <CreateLabelContainer {...formProps} />;
    };

    const dayConfig = formProps => {
      return <ConfigContainer {...formProps} />;
    };

    const createLabel = (
      <Button type="button" icon="processor" uppercase={false}>
        Manage Labels
      </Button>
    );

    const manageConfig = (
      <Button type="button" icon="processor" uppercase={false}>
        Manage Day Configs s
      </Button>
    );

    return (
      <>
        <ModalTrigger
          title={'Create sales plan'}
          autoOpenKey="showKBAddModal"
          trigger={trigger}
          content={salesPlan}
          enforceFocus={false}
        />
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
      </>
    );
  };

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Mini Plan')}
          breadcrumb={[
            { title: __('Settings'), link: '/settings' },
            { title: __('Mini Plan') }
          ]}
        />
      }
      content={renderList()}
      actionBar={
        <Wrapper.ActionBar right={renderAdd()} left={renderFilter()} />
      }
    ></Wrapper>
  );
}
export default Home;
