import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import {
  Pagination,
  ModalTrigger,
  Button,
  Table
} from 'modules/common/components';
import Sidebar from './Sidebar';
import CompanyRow from './CompanyRow';
import CompanyForm from './CompanyForm';

const propTypes = {
  companies: PropTypes.array.isRequired,
  counts: PropTypes.object.isRequired,
  columnsConfig: PropTypes.array.isRequired,
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
  addCompany: PropTypes.func.isRequired
};

function CompaniesList({
  companies,
  counts,
  columnsConfig,
  loadMore,
  hasMore,
  addCompany
}) {
  const content = (
    <Pagination hasMore={hasMore} loadMore={loadMore}>
      <Table whiteSpace="nowrap" bordered>
        <thead>
          <tr>
            <th>
              <a href="/companies/manage-columns">...</a>
            </th>
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
            />
          ))}
        </tbody>
      </Table>
    </Pagination>
  );

  const addTrigger = (
    <Button btnStyle="success" size="small">
      Add company
    </Button>
  );

  const actionBarRight = (
    <ModalTrigger title="New company" trigger={addTrigger}>
      <CompanyForm addCompany={addCompany} />
    </ModalTrigger>
  );

  const actionBar = <Wrapper.ActionBar right={actionBarRight} invert />;
  const breadcrumb = [{ title: `Companies (${counts.all})` }];

  return (
    <Wrapper
      header={<Wrapper.Header breadcrumb={breadcrumb} />}
      actionBar={actionBar}
      leftSidebar={<Sidebar counts={counts} />}
      content={content}
    />
  );
}

CompaniesList.propTypes = propTypes;

export default CompaniesList;
