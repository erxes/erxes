import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { BarItems } from '@erxes/ui/src/layout/styles';
import { LinkButton } from '@erxes/ui/src/styles/main';
import { IRouterProps } from '@erxes/ui/src/types';
import { __, router } from '@erxes/ui/src/utils/core';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { withRouter } from 'react-router-dom';

import OSMBuildings from '../../../common/OSMBuildings';
import { submenu } from '../../../utils';
import BuildingForm from '../containers/Form';
import { IBuilding } from '../types';
import Row from './Row';

// import Sidebar from './Sidebar';
type Props = {
  buildings: IBuilding[];
  totalCount: number;
  queryParams: any;
  loading: boolean;
  viewType: string;
  remove: (buildingId: string) => void;
  refetch?: () => void;
} & IRouterProps;

const List = (props: Props) => {
  const {
    totalCount,
    queryParams,
    loading,
    buildings,
    history,
    viewType,
    remove
  } = props;

  const renderRow = () => {
    const { buildings } = props;
    return buildings.map(building => (
      <Row key={building._id} building={building} remove={remove} />
    ));
  };

  queryParams.loadingMainQuery = loading;

  const trigger = (
    <Button btnStyle="success" size="small" icon="plus-circle">
      Add building
    </Button>
  );

  const render3dMap = () => {
    if (viewType !== '3d') {
      return null;
    }

    const onClickBuilding = e => {};

    const mapProps = {
      id: Math.random().toString(),
      onClickBuilding
    };

    return <OSMBuildings {...mapProps} />;
  };

  const renderList = () => {
    if (viewType !== 'list') {
      return null;
    }
    return (
      <Table whiteSpace="nowrap" hover={true}>
        <thead>
          <tr>
            <th>{__('code')}</th>
            <th>{__('name')}</th>
            <th>{__('Latitude')}</th>
            <th>{__('Longitude')}</th>
            <th>{__('city')}</th>
            <th>{__('district')}</th>
            <th>{__('quarter')}</th>
            <th>{__('Action')}</th>
          </tr>
        </thead>
        <tbody>{renderRow()}</tbody>
      </Table>
    );
  };

  const formContent = props => <BuildingForm {...props} />;

  const modalContent = () => (
    <ModalTrigger
      size="lg"
      title="building"
      autoOpenKey="showAppAddModal"
      trigger={trigger}
      content={formContent}
    />
  );

  const renderViewChooser = () => {
    const onFilterClick = e => {
      const type = e.target.id;

      router.setParams(history, { viewType: type });

      if (type === '3d') {
        window.location.reload();
      }
    };

    const viewTypes = [
      { title: 'List', value: 'list' },
      { title: '2D map', value: '2d' },
      { title: '3D map', value: '3d' }
    ];

    return (
      <Dropdown>
        <Dropdown.Toggle as={DropdownToggle} id="dropdown-buildingAction">
          <Button btnStyle="primary" icon="list-ui-alt">
            {viewTypes.find(type => type.value === viewType)?.title}
            <Icon icon="angle-down" />
          </Button>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {viewTypes.map(type => (
            <li key={type.value}>
              <LinkButton id={type.value} onClick={onFilterClick}>
                {__(type.title)}
              </LinkButton>
            </li>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  const actionBarRight = (
    <BarItems>
      {renderViewChooser()}

      <ModalTrigger
        title={__('Add Building')}
        trigger={trigger}
        content={formContent}
        enforceFocus={false}
      />
    </BarItems>
  );

  const actionBar = (
    <Wrapper.ActionBar left={''} right={actionBarRight} wideSpacing />
  );

  const content = (
    <>
      {renderList()}
      {render3dMap()}
    </>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Buildings')}
          queryParams={queryParams}
          submenu={submenu}
        />
      }
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      //   leftSidebar={<Sidebar loadingMainQuery={loading}/>}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={1}
          emptyContent={
            <h3
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              no data
            </h3>
          }
        />
      }
    />
  );
};

export default withRouter<Props>(List);
