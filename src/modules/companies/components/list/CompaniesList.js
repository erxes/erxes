import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import {
  Pagination,
  ModalTrigger,
  Button,
  Table,
  EmptyState,
  Icon
} from 'modules/common/components';
import { withRouter } from 'react-router';
import { BarItems } from 'modules/layout/styles';
import Sidebar from './Sidebar';
import CompanyRow from './CompanyRow';
import CompanyForm from '../common/CompanyForm';
import { ManageColumns } from '../../../fields/containers';

const propTypes = {
  companies: PropTypes.array.isRequired,
  counts: PropTypes.object.isRequired,
  columnsConfig: PropTypes.array.isRequired,
  addCompany: PropTypes.func.isRequired,
  history: PropTypes.object
};

function CompaniesList({
  companies,
  counts,
  columnsConfig,
  addCompany,
  history
}) {
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

      <Pagination count={counts.all} />
    </div>
  );

  const emptyContent = (
    <EmptyState text="No companies added yet!" size="full" icon="ios-list" />
  );

  const content = () => {
    if (companies.length === 0) {
      return emptyContent;
    }
    return mainContent;
  };

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
      content={content()}
    />
  );
}

CompaniesList.propTypes = propTypes;

export default withRouter(CompaniesList);
