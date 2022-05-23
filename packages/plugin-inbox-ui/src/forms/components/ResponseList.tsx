import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import { __ } from '@erxes/ui/src/utils';
import { IFormResponse } from '@erxes/ui-forms/src/forms/types';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { IField } from '@erxes/ui/src/types';
import React from 'react';

import ResponseRow from './ResponseRow';
import { getEnv } from 'coreui/utils';
import { IIntegration } from '@erxes/ui-settings/src/integrations/types';
import { SortHandler } from '@erxes/ui/src';

type Props = {
  integrationDetail: IIntegration;
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
      formSubmissions,
      integrationDetail
    } = this.props;

    queryParams.loadingMainQuery = loading;
    const { REACT_APP_API_URL } = getEnv();

    const onClick = () => {
      window.open(
        `${REACT_APP_API_URL}/pl:contacts/file-export?type=customer&popupData=true&form=${integrationDetail.formId}`,
        '_blank'
      );
    };

    const actionBarRight = (
      <Button
        btnStyle="success"
        size="small"
        icon="plus-circle"
        onClick={onClick}
      >
        Download Responses
      </Button>
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
            <th>{__('Submitted at')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
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
            emptyContent={'no responses'}
          />
        }
      />
    );
  }
}

export default List;
