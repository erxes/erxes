import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Wrapper } from 'modules/layout/components';
import {
  Pagination,
  ModalTrigger,
  Button,
  Table,
  DataWithLoader,
  FormControl,
  TaggerPopover
} from 'modules/common/components';
import { router, confirm } from 'modules/common/utils';
import { BarItems } from 'modules/layout/styles';
import Sidebar from './Sidebar';
import CompanyRow from './CompanyRow';
import { CompanyForm } from '../../containers';
import { ManageColumns } from 'modules/settings/properties/containers';
import { CommonMerge } from 'modules/customers/components';
import { CompaniesTableWrapper } from 'modules/companies/styles';

const propTypes = {
  companies: PropTypes.array.isRequired,
  counts: PropTypes.object.isRequired,
  columnsConfig: PropTypes.array.isRequired,
  history: PropTypes.object,
  location: PropTypes.object,
  loading: PropTypes.bool.isRequired,
  searchValue: PropTypes.string.isRequired,
  toggleBulk: PropTypes.func.isRequired,
  toggleAll: PropTypes.func.isRequired,
  bulk: PropTypes.array.isRequired,
  emptyBulk: PropTypes.func.isRequired,
  tags: PropTypes.array.isRequired,
  removeCompanies: PropTypes.func.isRequired,
  loadingTags: PropTypes.bool.isRequired,
  mergeCompanies: PropTypes.func.isRequired,
  basicInfos: PropTypes.object.isRequired,
  queryParams: PropTypes.object
};

class CompaniesList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };

    this.onChange = this.onChange.bind(this);
    this.search = this.search.bind(this);
    this.removeCompanies = this.removeCompanies.bind(this);
  }

  onChange() {
    const { toggleAll, companies } = this.props;
    toggleAll(companies, 'companies');
  }

  search(e) {
    if (this.timer) clearTimeout(this.timer);

    const { history } = this.props;
    const searchValue = e.target.value;

    this.setState({ searchValue });
    this.timer = setTimeout(() => {
      router.setParams(history, { searchValue });
    }, 500);
  }

  removeCompanies(companies) {
    const companyIds = [];

    companies.forEach(company => {
      companyIds.push(company._id);
    });

    this.props.removeCompanies({ companyIds });
  }

  moveCursorAtTheEnd(e) {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  }

  render() {
    const {
      columnsConfig,
      companies,
      history,
      location,
      loading,
      counts,
      toggleBulk,
      bulk,
      emptyBulk,
      tags,
      loadingTags,
      mergeCompanies,
      basicInfos,
      queryParams
    } = this.props;
    const { __ } = this.context;

    const mainContent = (
      <CompaniesTableWrapper>
        <Table whiteSpace="nowrap" bordered hover>
          <thead>
            <tr>
              <th>
                <FormControl
                  componentClass="checkbox"
                  onChange={this.onChange}
                />
              </th>
              {columnsConfig.map(({ name, label }) => (
                <th key={name}>{__(label)}</th>
              ))}
              <th>{__('Tags')}</th>
            </tr>
          </thead>
          <tbody id="companies">
            {companies.map(company => (
              <CompanyRow
                company={company}
                columnsConfig={columnsConfig}
                key={company._id}
                history={history}
                toggleBulk={toggleBulk}
              />
            ))}
          </tbody>
        </Table>
      </CompaniesTableWrapper>
    );

    const addTrigger = (
      <Button btnStyle="success" size="small" icon="plus">
        Add company
      </Button>
    );

    const editColumns = (
      <Button btnStyle="simple" size="small">
        Edit columns
      </Button>
    );

    const mergeButton = (
      <Button btnStyle="primary" size="small" icon="shuffle">
        Merge
      </Button>
    );

    let actionBarLeft = null;

    if (bulk.length > 0) {
      const tagButton = (
        <Button btnStyle="simple" size="small" icon="ios-arrow-down">
          Tag
        </Button>
      );

      actionBarLeft = (
        <BarItems>
          <TaggerPopover
            type="company"
            afterSave={emptyBulk}
            targets={bulk}
            trigger={tagButton}
          />

          {bulk.length === 2 && (
            <ModalTrigger
              title="Merge Companies"
              size="lg"
              trigger={mergeButton}
            >
              <CommonMerge
                datas={bulk}
                save={mergeCompanies}
                basicInfos={basicInfos}
              />
            </ModalTrigger>
          )}

          <Button
            btnStyle="danger"
            size="small"
            icon="close"
            onClick={() =>
              confirm().then(() => {
                this.removeCompanies(bulk);
              })
            }
          >
            Remove
          </Button>
        </BarItems>
      );
    }

    const actionBarRight = (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__('Type to search')}
          onChange={e => this.search(e)}
          value={this.state.searchValue}
          autoFocus
          onFocus={e => this.moveCursorAtTheEnd(e)}
        />
        <ModalTrigger title="Choose which column you see" trigger={editColumns}>
          <ManageColumns
            location={location}
            history={history}
            contentType="company"
          />
        </ModalTrigger>
        <ModalTrigger title="New company" trigger={addTrigger} size="lg">
          <CompanyForm />
        </ModalTrigger>
      </BarItems>
    );

    const actionBar = (
      <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
    );
    const breadcrumb = [{ title: __(`Companies`) + ` (${counts.all})` }];

    return (
      <Wrapper
        header={
          <Wrapper.Header breadcrumb={breadcrumb} queryParams={queryParams} />
        }
        actionBar={actionBar}
        footer={<Pagination count={counts.all} />}
        leftSidebar={
          <Sidebar counts={counts} tags={tags} loading={loadingTags} />
        }
        content={
          <DataWithLoader
            data={mainContent}
            loading={loading}
            count={companies.length}
            emptyText="No companies added yet!"
            emptyImage="/images/robots/robot-04.svg"
          />
        }
      />
    );
  }
}

CompaniesList.propTypes = propTypes;
CompaniesList.contextTypes = {
  __: PropTypes.func
};

export default withRouter(CompaniesList);
