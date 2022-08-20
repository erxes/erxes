import { confirm, router } from '@erxes/ui/src/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Table from '@erxes/ui/src/components/table';
import SortHandler from '@erxes/ui/src/components/SortHandler';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Alert from '@erxes/ui/src/utils/Alert';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { BarItems } from '@erxes/ui/src/layout/styles';
import FormControl from '@erxes/ui/src/components/form/Control';
import { __ } from '@erxes/ui/src/utils/core';
import Button from '@erxes/ui/src/components/Button';
import { ModalTrigger } from '@erxes/ui/src/components';

import {
  IButtonMutateProps,
  IQueryParams,
  IRouterProps
} from '@erxes/ui/src/types';
import { ICar, IProduct, IProductCategory } from '../../types';

import CarForm from '../../containers/CarForm';
import CarRow from './CarRow';
import CarsMerge from '../detail/CarsMerge';
import { CarsTableWrapper } from '../../styles';
import { IConfigColumn } from '@erxes/ui-forms/src/settings/properties/types';
import ManageColumns from '@erxes/ui-forms/src/settings/properties/containers/ManageColumns';
import React from 'react';
import RightMenu from './RightMenu';
import Sidebar from './Sidebar';
import { withRouter } from 'react-router-dom';

interface IProps extends IRouterProps {
  cars: ICar[];
  loading: boolean;
  searchValue: string;
  totalCount: number;
  columnsConfig: IConfigColumn[];
  // TODO: check is below line not throwing error ?
  toggleBulk: () => void;
  toggleAll: (targets: ICar[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removeCars: (doc: { carIds: string[] }, emptyBulk: () => void) => void;
  mergeCars: () => void;
  history: any;
  queryParams: any;
  productCategories: IProductCategory[];
  product?: IProductCategory;
  products: IProduct[];
  saveMatch: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  page: number;
  perPage: number;

  onSearch: (search: string, key?: string) => void;
  onFilter: (filterParams: IQueryParams) => void;
  onSelect: (values: string[] | string, key: string) => void;
  isFiltered: boolean;
  clearFilter: () => void;
}

type State = {
  searchValue?: string;
};

export const tumentechMenu = [
  { title: 'Car', link: '/erxes-plugin-tumentech/car/list' },
  { title: 'Products', link: '/product' },
  { title: 'Places', link: '/erxes-plugin-tumentech/place/list' },
  { title: 'Directions', link: '/erxes-plugin-tumentech/direction/list' },
  { title: 'Routes', link: '/erxes-plugin-tumentech/route/list' },
  { title: 'Trips', link: '/erxes-plugin-tumentech/trips/list' }
];

class CarsList extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer = undefined;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };
  }

  onChange = () => {
    const { toggleAll, cars } = this.props;
    toggleAll(cars, 'cars');
  };

  search = e => {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const { history } = this.props;
    const searchValue = e.target.value;

    this.setState({ searchValue });
    this.timer = setTimeout(() => {
      router.removeParams(history, 'page');
      router.setParams(history, { searchValue });
    }, 500);
  };

  removeCars = cars => {
    const carIds: string[] = [];

    cars.forEach(car => {
      carIds.push(car._id);
    });

    this.props.removeCars({ carIds }, this.props.emptyBulk);
  };

  moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  };

  render() {
    const {
      cars,
      history,
      loading,
      toggleBulk,
      bulk,
      isAllSelected,
      totalCount,
      mergeCars,
      queryParams,
      productCategories,
      products,
      saveMatch,
      renderButton,
      columnsConfig,
      page,
      perPage,

      onFilter,
      onSelect,
      onSearch,
      isFiltered,
      clearFilter
    } = this.props;

    const mainContent = (
      <CarsTableWrapper>
        <Table whiteSpace="nowrap" bordered={true} hover={true}>
          <thead>
            <tr>
              <th>
                <FormControl
                  checked={isAllSelected}
                  componentClass="checkbox"
                  onChange={this.onChange}
                />
              </th>
              {(columnsConfig || []).map(({ _id, name, label }) => (
                <th key={name}>
                  {_id !== '#' ? (
                    <SortHandler sortField={name} label={__(label)} />
                  ) : (
                    <>#</>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody id="cars">
            {cars.map((car, i) => (
              <CarRow
                index={(page - 1) * perPage + i + 1}
                car={car}
                columnsConfig={columnsConfig}
                isChecked={bulk.includes(car)}
                key={car._id}
                history={history}
                toggleBulk={toggleBulk}
                productCategories={productCategories}
              />
            ))}
          </tbody>
        </Table>
      </CarsTableWrapper>
    );

    const addTrigger = (
      <Button btnStyle="success" size="small" icon="plus-circle">
        Add car
      </Button>
    );

    const editColumns = (
      <Button btnStyle="primary" size="small" icon="plus-circle" href="#edit">
        Choose Properties/View
      </Button>
    );

    const manageColumns = props => {
      return (
        <ManageColumns
          {...props}
          contentType={'tumentech:car'}
          location={location}
          history={history}
        />
      );
    };

    const mergeButton = (
      <Button btnStyle="primary" size="small" icon="merge">
        Merge
      </Button>
    );

    let actionBarLeft: React.ReactNode;

    const carsMerge = props => {
      return <CarsMerge {...props} objects={bulk} save={mergeCars} />;
    };

    if (bulk.length > 0) {
      const onClick = () =>
        confirm()
          .then(() => {
            this.removeCars(bulk);
          })
          .catch(error => {
            Alert.error(error.message);
          });

      actionBarLeft = (
        <BarItems>
          {bulk.length === 2 && (
            <ModalTrigger
              title="Merge Cars"
              size="lg"
              trigger={mergeButton}
              content={carsMerge}
            />
          )}

          <Button
            btnStyle="danger"
            size="small"
            icon="cancel-1"
            onClick={onClick}
          >
            Delete
          </Button>
        </BarItems>
      );
    }

    const carForm = props => {
      return <CarForm {...props} queryParams={queryParams} />;
    };

    const rightMenuProps = {
      onFilter,
      onSelect,
      onSearch,
      isFiltered,
      clearFilter,
      queryParams
    };

    const actionBarRight = (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__('Type to search')}
          onChange={this.search}
          value={this.state.searchValue}
          autoFocus={true}
          onFocus={this.moveCursorAtTheEnd}
        />

        <ModalTrigger
          title="Manage Columns"
          trigger={editColumns}
          content={manageColumns}
        />

        <ModalTrigger
          title="New car"
          trigger={addTrigger}
          autoOpenKey="showCarModal"
          size="xl"
          content={carForm}
          backDrop="static"
        />

        <RightMenu {...rightMenuProps} />
      </BarItems>
    );

    const actionBar = (
      <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Cars`) + ` (${totalCount})`}
            queryParams={queryParams}
            submenu={tumentechMenu}
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        leftSidebar={
          <Sidebar
            loadingMainQuery={loading}
            queryParams={queryParams}
            history={history}
            products={products}
            saveMatch={saveMatch}
            productCategories={productCategories}
            renderButton={renderButton}
          />
        }
        content={
          <DataWithLoader
            data={mainContent}
            loading={loading}
            count={cars.length}
            emptyText="Add in your first car!"
            emptyImage="/images/actions/1.svg"
          />
        }
      />
    );
  }
}

export default withRouter<IRouterProps>(CarsList);
