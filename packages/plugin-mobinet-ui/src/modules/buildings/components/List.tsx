import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { router, __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { submenu } from '../../../utils';
import OSMBuildings from '../../../common/OSMBuildings';
import BuildingForm from '../containers/Form';
// import Sidebar from './Sidebar';
import { IBuilding } from '../types';
import Row from './Row';
import { BarItems } from '@erxes/ui/src/layout/styles';
import Icon from '@erxes/ui/src/components/Icon';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';

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

  const [isMap, setIsMap] = React.useState(
    viewType && viewType.includes('map')
  );

  const onClickToggle = () => {
    router.setParams(history, { viewType: isMap ? 'list' : 'map' });

    !isMap && window.location.reload();

    setIsMap(!isMap);
  };

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

  const renderMap = () => {
    if (!isMap) {
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
    if (isMap) {
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

  // const actionBar = (
  //   <BarItems>
  //     <Button btnStyle="simple" size="small" onClick={onClickToggle}>
  //       <Icon icon={isMap ? 'list' : 'map'} />
  //     </Button>
  //     <Wrapper.ActionBar right={righActionBar} left={actionBarLeft} />
  //   </BarItems>
  // );

  const actionBarRight = (
    <BarItems>
      <Button btnStyle="simple" size="small" onClick={onClickToggle}>
        <Icon icon={isMap ? 'list' : 'map'} />
      </Button>

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
      {renderMap()}
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

// export default List;

export default withRouter<Props>(List);
