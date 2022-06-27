import {
  Alert,
  BarItems,
  Button,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Pagination,
  SortHandler,
  Table,
  Wrapper,
  __,
  confirm,
  router
} from '@erxes/ui/src';
import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';
import { ICar, IProduct, IProductCategory } from '../../types';

import CarForm from '../../containers/CarForm';
import CarRow from './CarRow';
import CarsMerge from '../detail/CarsMerge';
import { CarsTableWrapper } from '../../styles';
import { IConfigColumn } from '@erxes/ui-forms/src/settings/properties/types';
import ManageColumns from '@erxes/ui-forms/src/settings/properties/containers/ManageColumns';
import React from 'react';
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
  onSelect: (prs: IProduct[]) => void;
  saveMatch: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  page: number;
  perPage: number;
}

type State = {
  searchValue?: string;
};

export const tumentechMenu = [
  { title: 'Car', link: '/erxes-plugin-tumentech/list' },
  { title: 'Products', link: '/product' },
  { title: 'Places', link: '/tumentech/place/list' },
  { title: 'Directions', link: '/tumentech/direction/list' },
  { title: 'Routes', link: '/tumentech/route/list' }
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
      onSelect,
      saveMatch,
      renderButton,
      columnsConfig,
      page,
      perPage
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
            onSelect={onSelect}
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
