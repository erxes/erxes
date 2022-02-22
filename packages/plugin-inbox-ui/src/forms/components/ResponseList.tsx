import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
// import FormControl from '@erxes/ui/src/components/form/Control';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import SortHandler from '@erxes/ui/src/components/SortHandler';
import Table from '@erxes/ui/src/components/table';
import { __ } from '@erxes/ui/src/utils';
import { IForm, IFormResponse } from '@erxes/ui-forms/src/forms/types';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { EMPTY_CONTENT_POPUPS } from '@erxes/ui-settings/src/constants';
import { IField } from '@erxes/ui/src/types';
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
