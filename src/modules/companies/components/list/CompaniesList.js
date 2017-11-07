import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import {
  Pagination,
  ModalTrigger,
  Button,
  Table,
  Icon
} from 'modules/common/components';
import { BarItems } from 'modules/layout/styles';
import Sidebar from './Sidebar';
import CompanyRow from './CompanyRow';
import CompanyForm from './CompanyForm';

const propTypes = {
  companies: PropTypes.array.isRequired,
  counts: PropTypes.object.isRequired,
  columnsConfig: PropTypes.array.isRequired,
  addCompany: PropTypes.func.isRequired
};

function CompaniesList({ companies, counts, columnsConfig, addCompany }) {
  const content = (
    <Table whiteSpace="nowrap" bordered>
      <thead>
        <tr>
          {columnsConfig.map(({ name, label }) => <th key={name}>{label}</th>)}
        </tr>
      </thead>
      <tbody>
        {companies.map(company => (
          <CompanyRow
            company={company}
            columnsConfig={columnsConfig}
            key={company._id}
          />
        ))}
      </tbody>
    </Table>
  );

  const addTrigger = (
    <Button btnStyle="success" size="small">
      <Icon icon="plus" /> Add company
    </Button>
  );

  const actionBarRight = (
    <BarItems>
      <Link to="/companies/manage-columns">
        <Button btnStyle="simple" size="small">
          Edit columns
        </Button>
      </Link>
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
      content={content}
    />
  );
}

CompaniesList.propTypes = propTypes;

export default CompaniesList;
