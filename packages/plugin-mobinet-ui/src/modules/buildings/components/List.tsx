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
import React, { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { withRouter } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';

import OSMBuildings from '../../../common/OSMBuildings';
import OSMap from '../../../common/OSMap';
import { ICoordinates } from '../../../types';
import { submenu } from '../../../utils';
import BuildingForm from '../containers/Form';
import { IBuilding, IOSMBuilding } from '../types';
import FilterMenu from './FilterMenu';
import Row from './Row';

// import Sidebar from './Sidebar';
type Props = {
  buildings: IBuilding[];
  totalCount: number;
  queryParams: any;
  loading: boolean;
  viewType: string;
  getBuildingsWithingBounds: (bounds: ICoordinates[]) => void;
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

  const [center, setCenter] = useState<ICoordinates>({
    lat: 47.918812,
    lng: 106.9154893
  });

  const [currentOsmBuilding, setCurrentOsmBuilding] = useState<
    IOSMBuilding | undefined
  >(undefined);
  const [currentBuilding, setCurrentBuilding] = useState<IBuilding | undefined>(
    undefined
  );
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  React.useEffect(() => {}, [props.buildings, isFormOpen]);

  const renderRow = () => {
    const { buildings } = props;
    return buildings.map(building => (
      <Row key={building._id} building={building} remove={remove} />
    ));
  };

  queryParams.loadingMainQuery = loading;

  const onChangeCenter = (center: ICoordinates, bounds: ICoordinates[]) => {
    bounds.push(bounds[0]);

    props.getBuildingsWithingBounds(bounds);
    setCenter(center);
  };

  const render3dMap = () => {
    if (viewType !== '3d') {
      return null;
    }

    const onChange = e => {
      const buildingId = e.id;

      if (!buildingId) {
        setIsFormOpen(false);
        return;
      }

      setCurrentOsmBuilding(e);

      const index = props.buildings.findIndex(b => b.osmbId === buildingId);

      if (index !== -1) {
        setCurrentBuilding(props.buildings[index]);
      }

      setIsFormOpen(true);
    };

    const onload = (bounds: ICoordinates[]) => {
      bounds.push(bounds[0]);
      props.getBuildingsWithingBounds(bounds);
    };

    const mapProps = {
      id: 'mapOnList',
      onChange,
      onChangeCenter,
      onload,
      center,
      mode: 'single',
      selectedValues: props.buildings.map(b => b.osmbId)
    };

    // console.log('OSMBuildings', mapProps);

    return <OSMBuildings {...mapProps} />;
  };

  const render2dMap = () => {
    if (viewType !== '2d') {
      return null;
    }

    return (
      <OSMap
        id={Math.random().toString(10)}
        width={'100%'}
        height={'100%'}
        center={center}
        zoom={16}
        addMarkerOnCenter={false}
        // onChangeCenter={onChangeCenter}
      />
    );
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

  const formContent = props => (
    <BuildingForm
      {...props}
      center={center}
      osmBuilding={currentOsmBuilding}
      building={currentBuilding}
    />
  );

  const renderModal = () => {
    if (!isFormOpen) {
      return null;
    }

    return (
      <Modal
        show={true}
        size="xl"
        onHide={() => setIsFormOpen(false)}
        animation={false}
        enforceFocus={false}
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>
            {currentBuilding ? __('Edit building') : __('Add building')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body id="ModalBody" className="md-padding">
          {formContent({ closeModal: () => setIsFormOpen(false) })}
        </Modal.Body>
      </Modal>
    );
  };

  const renderViewChooser = () => {
    const onFilterClick = e => {
      const type = e.target.id;

      router.setParams(history, { viewType: type });
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

  const trigger = (
    <Button btnStyle="success" size="small" icon="plus-circle">
      Add building
    </Button>
  );

  const actionBarRight = (
    <BarItems>
      {renderViewChooser()}
      <FilterMenu />
      <ModalTrigger
        size="xl"
        title={currentBuilding ? __('Edit building') : __('Add building')}
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
      {render2dMap()}
      {renderModal()}
    </>
  );

  return (
    <>
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
    </>
  );
};

export default withRouter<Props>(List);
