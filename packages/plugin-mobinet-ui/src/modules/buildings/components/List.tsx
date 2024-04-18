import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import FormControl from '@erxes/ui/src/components/form/Control';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { BarItems } from '@erxes/ui/src/layout/styles';
import { LinkButton } from '@erxes/ui/src/styles/main';
import { IQueryParams, IRouterProps } from '@erxes/ui/src/types';
import { __, router } from '@erxes/ui/src/utils/core';
import React, { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';
import { withRouter } from 'react-router-dom';
import OSMBuildings from '../../../common/OSMBuildings';
import OSMap from '../../../common/OSMap';
import { ICoordinates } from '../../../types';
import { submenu } from '../../../utils';
import BuildingForm from '../containers/Form';
import { IBuilding, IOSMBuilding } from '../types';
import FilterMenu from './FilterMenu';
import Row from './Row';

type Props = {
  buildings: IBuilding[];
  totalCount: number;
  queryParams: any;
  loading: boolean;
  viewType: string;
  page: number;
  perPage: number;
  getBuildingsWithingBounds: (bounds: ICoordinates[]) => void;
  remove: (buildingId: string) => void;
  refetch?: () => void;
} & IRouterProps;

let timer: NodeJS.Timeout;

const List = (props: Props) => {
  const {
    totalCount,
    queryParams,
    loading,
    history,
    viewType,
    remove,
    page,
    perPage,
  } = props;

  const [center, setCenter] = useState<ICoordinates>({
    lat: 47.918812,
    lng: 106.9154893,
  });

  const [map, setMap] = useState<any>(null);
  const [buildings, setBuildings] = useState<IBuilding[]>(
    props.buildings || []
  );

  const [currentOsmBuilding, setCurrentOsmBuilding] = useState<
    IOSMBuilding | undefined
  >(undefined);
  const [currentBuilding, setCurrentBuilding] = useState<IBuilding | undefined>(
    undefined
  );
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>();

  const changeMapCenter = (center) => {
    if (map) {
      map.setPosition({ latitude: center.lat, longitude: center.lng });
    }
  };
  React.useEffect(() => {
    if (props.buildings) {
      setBuildings(props.buildings);
    }

    if (buildings.length > 0 && map) {
      map.highlight((feature: any) => {
        const serviceStatus = feature.properties?.serviceStatus || 'inactive';
        switch (serviceStatus) {
          case 'active':
            return '#ff0000';
          case 'inactive':
            return '#00bbff';
          case 'inprogress':
            return '#ffcc00';
          case 'unavailable':
            return '#00ff00';
          default:
            return '#00bbff';
        }
      });
    }
  }, [map, props.buildings, buildings, isFormOpen, currentOsmBuilding]);

  const renderRow = () => {
    return buildings.map((building, i) => (
      <Row
        index={(page - 1) * perPage + i + 1}
        key={building._id}
        building={building}
        remove={remove}
        history={props.history}
      />
    ));
  };

  queryParams.loadingMainQuery = loading;

  const onChangeCenter = (newCenter: ICoordinates, bounds: ICoordinates[]) => {
    bounds.push(bounds[0]);

    props.getBuildingsWithingBounds(bounds);
    setCenter(newCenter);
  };

  const onChangeBuilding = (e) => {
    const buildingId = e.id;

    const { properties } = e;

    if (properties._id) {
      history.push(`/mobinet/building/details/${properties._id}`);
      return;
    }

    if (!buildingId) {
      setIsFormOpen(false);
      return;
    }

    setCurrentOsmBuilding(e);

    setIsFormOpen(true);
  };

  const render3dMap = () => {
    if (viewType !== '3d') {
      return null;
    }

    const onload = (bounds: ICoordinates[], mapRef) => {
      bounds.push(bounds[0]);
      props.getBuildingsWithingBounds(bounds);

      setMap(mapRef.current);
    };

    const mapProps = {
      id: 'mapOnList',
      onChange: onChangeBuilding,
      onChangeCenter,
      onload,
      center,
      buildings,
    };

    return <OSMBuildings {...mapProps} />;
  };

  const render2dMap = () => {
    if (viewType !== '2d') {
      console.log('rerender');
      return null;
    }
    const onload = (bounds: ICoordinates[], mapRef) => {
      bounds.push(bounds[0]);
      props.getBuildingsWithingBounds(bounds);

      setMap(mapRef.current);
    };

    return (
      <OSMap
        id={Math.random().toString(10)}
        width={'100%'}
        height={'100%'}
        onChangeCenter={onChangeCenter}
        onload={onload}
        center={center}
        buildings={buildings}
        zoom={16}
        addMarkerOnCenter={false}
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
            <th>{'#'}</th>
            <th>{__('name')}</th>
            <th>{__('Latitude')}</th>
            <th>{__('Longitude')}</th>
            <th>{__('city')}</th>
            <th>{__('district')}</th>
            <th>{__('quarter')}</th>
            <th>{__('request count')}</th>
            <th>{__('ticket count')}</th>
            <th>{__('network type')}</th>
            <th>{__('status')}</th>
            <th>{__('Action')}</th>
          </tr>
        </thead>
        <tbody>{renderRow()}</tbody>
      </Table>
    );
  };

  const formContent = (formProps) => (
    <BuildingForm
      {...formProps}
      refetch={props.refetch}
      center={center}
      osmBuilding={currentOsmBuilding}
      building={currentBuilding}
      buildings={buildings}
    />
  );

  const renderModal = () => {
    if (!isFormOpen) {
      return null;
    }

    const onHide = () => {
      setCurrentOsmBuilding(undefined);
      setCurrentBuilding(undefined);
      setIsFormOpen(false);
    };

    return (
      <Modal
        show={true}
        size="xl"
        onHide={onHide}
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
    const onFilterClick = (e) => {
      const type = e.target.id;

      router.setParams(history, { viewType: type });
    };

    const viewTypes = [
      { title: 'List', value: 'list' },
      { title: '2D map', value: '2d' },
      { title: '3D map', value: '3d' },
    ];

    return (
      <Dropdown>
        <Dropdown.Toggle as={DropdownToggle} id="dropdown-buildingAction">
          <Button btnStyle="primary" icon="list-ui-alt">
            {viewTypes.find((type) => type.value === viewType)?.title}
            <Icon icon="angle-down" />
          </Button>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {viewTypes.map((type) => (
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
  const search = (e) => {
    if (timer) {
      clearTimeout(timer);
    }
    const searchValue = e.target.value;

    setSearchValue(searchValue);

    timer = setTimeout(() => {
      router.removeParams(history, 'page');
      router.setParams(history, { searchValue });
    }, 500);
  };

  const onFilter = (filterParams: IQueryParams) => {
    router.removeParams(props.history, 'page');

    for (const key of Object.keys(filterParams)) {
      if (filterParams[key]) {
        router.setParams(props.history, { [key]: filterParams[key] });
      } else {
        router.removeParams(props.history, key);
      }
    }

    return router;
  };
  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  };
  const filterParams = {
    onFilter,
    queryParams,
    changeMapCenter,
  };

  const actionBarRight = (
    <BarItems>
      <FormControl
        type="text"
        placeholder={__('Type to search')}
        onChange={search}
        value={searchValue}
        autoFocus={true}
        onFocus={moveCursorAtTheEnd}
      />
      {renderViewChooser()}
      <FilterMenu {...filterParams} />
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
    <Wrapper.ActionBar left={''} right={actionBarRight} wideSpacing={true} />
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
                  alignItems: 'center',
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
