import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Wrapper } from 'modules/layout/components';
import {
  Pagination,
  ModalTrigger,
  Button,
  Table,
  Icon,
  ShowData,
  FormControl
} from 'modules/common/components';
import { router } from 'modules/common/utils';
import { BarItems } from 'modules/layout/styles';
import Sidebar from './Sidebar';
import CompanyRow from './CompanyRow';
import { CompanyForm } from '../';
import { ManageColumns } from '../../../fields/containers';

const propTypes = {
  companies: PropTypes.array.isRequired,
  counts: PropTypes.object.isRequired,
  columnsConfig: PropTypes.array.isRequired,
  addCompany: PropTypes.func.isRequired,
  history: PropTypes.object,
  loading: PropTypes.bool.isRequired,
  searchValue: PropTypes.string.isRequired
};

class CompaniesList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };

    this.search = this.search.bind(this);
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

  render() {
    const {
      columnsConfig,
      companies,
      history,
      loading,
      addCompany,
      counts
    } = this.props;

    const mainContent = (
      <div>
        <Table whiteSpace="nowrap" bordered hover>
          <thead>
            <tr>
              {columnsConfig.map(({ name, label }) => (
                <th key={name}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {companies.map(company => (
              <CompanyRow
                company={company}
                columnsConfig={columnsConfig}
                key={company._id}
                history={history}
              />
            ))}
          </tbody>
        </Table>
      </div>
    );

    const addTrigger = (
      <Button btnStyle="success" size="small">
        <Icon icon="plus" /> Add company
      </Button>
    );

    const editColumns = (
      <Button btnStyle="simple" size="small">
        Edit columns
      </Button>
    );

    const actionBarRight = (
      <BarItems>
        <FormControl
          type="text"
          placeholder="Type to search.."
          onChange={e => this.search(e)}
          value={this.state.searchValue}
        />
        <ModalTrigger title="Choose which column you see" trigger={editColumns}>
          <ManageColumns contentType="company" />
        </ModalTrigger>
        <ModalTrigger title="New company" trigger={addTrigger}>
          <CompanyForm addCompany={addCompany} />
        </ModalTrigger>
      </BarItems>
    );

    const actionBar = <Wrapper.ActionBar right={actionBarRight} />;
    const breadcrumb = [{ title: `Companies (${counts.all})` }];
    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        actionBar={actionBar}
        footer={<Pagination count={counts.all} />}
        leftSidebar={<Sidebar counts={counts} />}
        content={
          <ShowData
            data={mainContent}
            loading={loading}
            count={companies.length}
            emptyText="No companies added yet!"
            emptyIcon="ios-list"
          />
        }
      />
    );
  }
}

CompaniesList.propTypes = propTypes;

export default withRouter(CompaniesList);
