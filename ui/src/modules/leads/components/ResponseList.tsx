import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import EmptyContent from 'modules/common/components/empty/EmptyContent';
// import FormControl from 'modules/common/components/form/Control';
import Pagination from 'modules/common/components/pagination/Pagination';
import SortHandler from 'modules/common/components/SortHandler';
import Table from 'modules/common/components/table';
import { __ } from 'modules/common/utils';
import { IForm, IFormResponse } from 'modules/forms/types';
import Wrapper from 'modules/layout/components/Wrapper';
import { EMPTY_CONTENT_POPUPS } from 'modules/settings/constants';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import { Link } from 'react-router-dom';
import ResponseRow from './ResponseRow';

type Props = {
  integrationDetail: IForm;
  totalCount: number;
  fields: IField[];
  formSubmissions: IFormResponse[];
  queryParams: any;
  loading: boolean;
};

class List extends React.Component<Props, {}> {
  renderRow() {
    const { formSubmissions } = this.props;
    const fieldIds = this.props.fields.map(f => f._id);
    return formSubmissions.map(e => (
      <ResponseRow
        key={e.contentTypeId}
        formSubmission={e}
        fieldIds={fieldIds}
      />
    ));
  }

  render() {
    const {
      totalCount,
      queryParams,
      loading,
      fields,
      formSubmissions
    } = this.props;

    queryParams.loadingMainQuery = loading;

    const actionBarRight = (
      <Link to="/forms/create">
        <Button btnStyle="success" size="small" icon="plus-circle">
          Download Responses
        </Button>
      </Link>
    );

    const actionBar = <Wrapper.ActionBar right={actionBarRight} />;

    const content = (
      <Table whiteSpace="nowrap" hover={true}>
        <thead>
          <tr>
            {fields.map(e => {
              return (
                <th key={e._id} id={e._id}>
                  <SortHandler sortField={e.text} label={e.text} />
                </th>
              );
            })}
          </tr>
        </thead>
        {/* <tbody>{this.renderRow()}</tbody> */}
      </Table>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Form responses')}
            breadcrumb={[{ title: __('Responses') }]}
            queryParams={queryParams}
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={formSubmissions.length}
            emptyContent={
              <EmptyContent
                content={EMPTY_CONTENT_POPUPS}
                maxItemWidth="360px"
              />
            }
          />
        }
      />
    );
  }
}

export default List;
