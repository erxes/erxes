import {
  __,
  Alert,
  BarItems,
  Button,
  confirm,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Pagination,
  router,
  SortHandler,
  Table,
  Wrapper
} from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { withRouter } from 'react-router-dom';

import InsuranceTypeForm from '../containers/InsuranceTypeForm';
import { InsuranceTypesTableWrapper } from '../styles';
import { IInsuranceType } from '../types';
import InsuranceTypeRow from './InsuranceTypeRow';

interface IProps extends IRouterProps {
  insuranceTypes: IInsuranceType[];
  loading: boolean;
  searchValue: string;
  totalCount: number;
  // TODO: check is below line not throwing error ?
  toggleBulk: () => void;
  toggleAll: (targets: IInsuranceType[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removeInsuranceTypes: (
    doc: { insuranceTypeIds: string[] },
    emptyBulk: () => void
  ) => void;
  history: any;
  queryParams: any;
}

type State = {
  searchValue?: string;
};

class InsuranceTypesList extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer = undefined;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };
  }

  onChange = () => {
    const { toggleAll, insuranceTypes } = this.props;
    toggleAll(insuranceTypes, 'insuranceTypes');
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

  removeInsuranceTypes = insuranceTypes => {
    const insuranceTypeIds: string[] = [];

    insuranceTypes.forEach(insuranceType => {
      insuranceTypeIds.push(insuranceType._id);
    });

    this.props.removeInsuranceTypes({ insuranceTypeIds }, this.props.emptyBulk);
  };

  moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  };

  render() {
    const {
      insuranceTypes,
      history,
      loading,
      toggleBulk,
      bulk,
      isAllSelected,
      totalCount,
      queryParams
    } = this.props;

    const mainContent = (
      <InsuranceTypesTableWrapper>
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
                <SortHandler sortField={'code'} label={__('Code')} />
              </th>
              <th>
                <SortHandler sortField={'name'} label={__('Name')} />
              </th>
              <th>{__('Company Code')}</th>
              <th>{__('Company Name')}</th>
              <th>{__('Percent')}</th>
              <th>{__('Year Percents')}</th>
              <th>
                <SortHandler
                  sortField={'description'}
                  label={__('Description')}
                />
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody id="insuranceTypes">
            {insuranceTypes.map(insuranceType => (
              <InsuranceTypeRow
                insuranceType={insuranceType}
                isChecked={bulk.includes(insuranceType)}
                key={insuranceType._id}
                history={history}
                toggleBulk={toggleBulk}
              />
            ))}
          </tbody>
        </Table>
      </InsuranceTypesTableWrapper>
    );

    const addTrigger = (
      <Button btnStyle="success" size="small" icon="plus-circle">
        Add insuranceType
      </Button>
    );

    let actionBarLeft: React.ReactNode;

    if (bulk.length > 0) {
      const onClick = () =>
        confirm()
          .then(() => {
            this.removeInsuranceTypes(bulk);
          })
          .catch(error => {
            Alert.error(error.message);
          });

      actionBarLeft = (
        <BarItems>
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

    const insuranceTypeForm = props => {
      return <InsuranceTypeForm {...props} queryParams={queryParams} />;
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
          title="New insuranceType"
          trigger={addTrigger}
          autoOpenKey="showInsuranceTypeModal"
          content={insuranceTypeForm}
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
            title={__(`InsuranceTypes`) + ` (${totalCount})`}
            queryParams={queryParams}
            breadcrumb={[
              { title: __('Settings'), link: '/settings' },
              { title: 'Insurance type' }
            ]}
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={mainContent}
            loading={loading}
            count={insuranceTypes.length}
            emptyText="Add in your first insuranceType!"
            emptyImage="/images/actions/1.svg"
          />
        }
        hasBorder
      />
    );
  }
}

export default withRouter<IRouterProps>(InsuranceTypesList);
