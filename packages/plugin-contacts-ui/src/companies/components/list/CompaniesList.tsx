import CompaniesMerge from '@erxes/ui-contacts/src/companies/components/detail/CompaniesMerge';
import CompanyForm from '@erxes/ui-contacts/src/companies/containers/CompanyForm';
import ManageColumns from '@erxes/ui-forms/src/settings/properties/containers/ManageColumns';
import { IConfigColumn } from '@erxes/ui-forms/src/settings/properties/types';
import TaggerPopover from '@erxes/ui-tags/src/components/TaggerPopover';
import { TAG_TYPES } from '@erxes/ui-tags/src/constants';
import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import FormControl from '@erxes/ui/src/components/form/Control';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import SortHandler from '@erxes/ui/src/components/SortHandler';
import Table from '@erxes/ui/src/components/table';
import withTableWrapper from '@erxes/ui/src/components/table/withTableWrapper';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { BarItems } from '@erxes/ui/src/layout/styles';
import { IRouterProps } from '@erxes/ui/src/types';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { menuContacts } from '@erxes/ui/src/utils/menus';
import { __, Alert, confirm, router } from 'coreui/utils';
import { gql } from '@apollo/client';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link, withRouter } from 'react-router-dom';
import TemporarySegment from '@erxes/ui-segments/src/components/filter/TemporarySegment';

import { queries } from '../../graphql';
import { ICompany } from '../../types';
import CompanyRow from './CompanyRow';
import Sidebar from './Sidebar';

interface IProps extends IRouterProps {
  companies: ICompany[];
  columnsConfig: IConfigColumn[];
  loading: boolean;
  searchValue: string;
  totalCount: number;
  // TODO: check is below line not throwing error ?
  toggleBulk: () => void;
  toggleAll: (targets: ICompany[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removeCompanies: (
    doc: { companyIds: string[] },
    emptyBulk: () => void
  ) => void;
  mergeCompanies: () => void;
  queryParams: any;
  exportCompanies: (bulk: string[]) => void;
  refetch?: () => void;
  renderExpandButton?: any;
  isExpand?: boolean;
  page: number;
  perPage: number;
}

type State = {
  searchValue?: string;
};

class CompaniesList extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer = undefined;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };
  }

  onChange = () => {
    const { toggleAll, companies } = this.props;
    toggleAll(companies, 'companies');
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

  removeCompanies = companies => {
    const companyIds: string[] = [];

    companies.forEach(company => {
      companyIds.push(company._id);
    });

    this.props.removeCompanies({ companyIds }, this.props.emptyBulk);
  };

  moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  };

  afterTag = () => {
    this.props.emptyBulk();

    if (this.props.refetch) {
      this.props.refetch();
    }
  };

  render() {
    const {
      columnsConfig,
      companies,
      history,
      location,
      loading,
      toggleBulk,
      bulk,
      isAllSelected,
      totalCount,
      mergeCompanies,
      queryParams,
      exportCompanies,
      isExpand,
      renderExpandButton,
      perPage,
      page
    } = this.props;

    const mainContent = (
      <withTableWrapper.Wrapper>
        <Table
          whiteSpace="nowrap"
          bordered={true}
          hover={true}
          wideHeader={true}
          responsive={true}
        >
          <thead>
            <tr>
              <th>
                <FormControl
                  checked={isAllSelected}
                  componentClass="checkbox"
                  onChange={this.onChange}
                />
              </th>
              {columnsConfig.map(({ name, label, _id }) => (
                <th key={name}>
                  {_id !== '#' ? (
                    <SortHandler sortField={name} label={__(label)} />
                  ) : (
                    <>#</>
                  )}
                </th>
              ))}
              <th>{__('Tags')}</th>
            </tr>
          </thead>
          <tbody id="companies" className={isExpand ? 'expand' : ''}>
            {companies.map((company, i) => (
              <CompanyRow
                index={(page - 1) * perPage + i + 1}
                company={company}
                columnsConfig={columnsConfig}
                isChecked={bulk.includes(company)}
                key={company._id}
                history={history}
                toggleBulk={toggleBulk}
              />
            ))}
          </tbody>
        </Table>
      </withTableWrapper.Wrapper>
    );

    const addTrigger = (
      <Button btnStyle="success" size="small" icon="plus-circle">
        Add company
      </Button>
    );

    const editColumns = <a href="#edit">{__('Choose Properties/View')}</a>;

    const mergeButton = (
      <Button btnStyle="primary" size="small" icon="merge">
        Merge
      </Button>
    );

    let actionBarLeft: React.ReactNode;

    const companiesMerge = props => {
      return <CompaniesMerge {...props} objects={bulk} save={mergeCompanies} />;
    };

    if (bulk.length > 0) {
      const tagButton = (
        <Button btnStyle="simple" size="small" icon="tag-alt">
          Tag
        </Button>
      );

      const onClick = () =>
        confirm()
          .then(() => {
            this.removeCompanies(bulk);
          })
          .catch(error => {
            Alert.error(error.message);
          });

      const refetchQuery = {
        query: gql(queries.companyCounts),
        variables: { only: 'byTag' }
      };

      actionBarLeft = (
        <BarItems>
          {isEnabled('tags') && (
            <TaggerPopover
              type={TAG_TYPES.COMPANY}
              successCallback={this.afterTag}
              targets={bulk}
              trigger={tagButton}
              refetchQueries={[refetchQuery]}
            />
          )}

          {bulk.length === 2 && (
            <ModalTrigger
              title="Merge Companies"
              size="xl"
              dialogClassName="modal-1000w"
              trigger={mergeButton}
              content={companiesMerge}
            />
          )}

          <Button
            btnStyle="danger"
            size="small"
            icon="cancel-1"
            onClick={onClick}
          >
            Remove
          </Button>
        </BarItems>
      );
    }

    const manageColumns = props => {
      return (
        <ManageColumns
          {...props}
          location={location}
          history={history}
          contentType="contacts:company"
        />
      );
    };

    const companyForm = props => {
      return <CompanyForm {...props} queryParams={queryParams} />;
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

        {renderExpandButton()}

        {isEnabled('segments') && (
          <TemporarySegment contentType={`contacts:company`} />
        )}

        <Dropdown className="dropdown-btn" alignRight={true}>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-customize">
            <Button btnStyle="simple" size="small">
              {__('Customize ')} <Icon icon="angle-down" />
            </Button>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <li>
              <ModalTrigger
                title="Manage Columns"
                trigger={editColumns}
                content={manageColumns}
              />
            </li>
            <li>
              <Link to="/settings/properties?type=contacts:company">
                {__('Manage properties')}
              </Link>
            </li>
            <li>
              <a href="#export" onClick={exportCompanies.bind(this, bulk)}>
                {__('Export this companies')}
              </a>
            </li>
          </Dropdown.Menu>
        </Dropdown>
        <Link to="/settings/importHistories?type=contacts:company">
          <Button btnStyle="primary" size="small" icon="arrow-from-right">
            {__('Go to import')}
          </Button>
        </Link>
        <ModalTrigger
          title="New company"
          trigger={addTrigger}
          autoOpenKey="showCompanyModal"
          size="lg"
          content={companyForm}
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
            title={__(`Companies`) + ` (${totalCount})`}
            queryParams={queryParams}
            submenu={menuContacts}
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        leftSidebar={<Sidebar loadingMainQuery={loading} />}
        content={
          <DataWithLoader
            data={mainContent}
            loading={loading}
            count={companies.length}
            emptyText="Add in your first company!"
            emptyImage="/images/actions/1.svg"
          />
        }
        hasBorder={true}
      />
    );
  }
}

export default withTableWrapper(
  'Company',
  withRouter<IRouterProps>(CompaniesList)
);
