import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import {
  Pagination,
  ModalTrigger,
  Button,
  Table,
  DataWithLoader
} from 'modules/common/components';
import { withRouter } from 'react-router';
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
  loading: PropTypes.bool.isRequired
};

function CompaniesList({
  companies,
  counts,
  columnsConfig,
  addCompany,
  history,
  loading
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
    </div>
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

CompaniesList.propTypes = propTypes;

export default withRouter(CompaniesList);
