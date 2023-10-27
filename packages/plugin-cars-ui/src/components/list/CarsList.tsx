import {
  __,
  Alert,
  Button,
  confirm,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Pagination,
  router,
  SortHandler,
  Table,
  Wrapper,
  BarItems
} from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { withRouter } from 'react-router-dom';

import CarForm from '../../containers/CarForm';
import { CarsTableWrapper } from '../../styles';
import { ICar } from '../../types';
import CarsMerge from '../detail/CarsMerge';
import CarRow from './CarRow';
import Sidebar from './Sidebar';

interface IProps extends IRouterProps {
  cars: ICar[];
  loading: boolean;
  searchValue: string;
  totalCount: number;
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
}

type State = {
  searchValue?: string;
};

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
      queryParams
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
              <th>
                <SortHandler
                  sortField={'plateNumber'}
                  label={__('Plate Number')}
                />
              </th>
              <th>
                <SortHandler sortField={'vinNumber'} label={__('Vin Number')} />
              </th>
              <th>
                <SortHandler
                  sortField={'vintageYear'}
                  label={__('Vintage Year')}
                />
              </th>
              <th>
                <SortHandler
                  sortField={'importYear'}
                  label={__('Import Year')}
                />
              </th>
              <th>
                <SortHandler
                  sortField={'description'}
                  label={__('Description')}
                />
              </th>
            </tr>
          </thead>
          <tbody id="cars">
            {cars.map(car => (
              <CarRow
                car={car}
                isChecked={bulk.includes(car)}
                key={car._id}
                history={history}
                toggleBulk={toggleBulk}
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
          title="New car"
          trigger={addTrigger}
          autoOpenKey="showCarModal"
          size="lg"
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
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        leftSidebar={
          <Sidebar
            loadingMainQuery={loading}
            queryParams={queryParams}
            history={history}
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
