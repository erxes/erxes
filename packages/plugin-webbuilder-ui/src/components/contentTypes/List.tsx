import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import FormControl from '@erxes/ui/src/components/form/Control';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import SortHandler from '@erxes/ui/src/components/SortHandler';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { EMPTY_CONTENT_POPUPS } from '@erxes/ui-settings/src/constants';
import React from 'react';
import { Link } from 'react-router-dom';
import { Flex } from '@erxes/ui/src/styles/main';
import Row from './Row';

type Props = {
  history: any;
  queryParams: any;
  contentTypes: any[];
  remove: (contentTypeId: string) => void;
  loading: boolean;
  getActionBar: (actionBar: any) => void;
};

class ContentTypes extends React.Component<Props, {}> {
  renderRow() {
    const { contentTypes, remove } = this.props;

    return contentTypes.map(contentType => (
      <Row key={contentType._id} contentType={contentType} remove={remove} />
    ));
  }

  render() {
    const { getActionBar } = this.props;

    const actionBarRight = (
      <Flex>
        <Link to="contenttypes/create">
          <Button btnStyle="success" size="small" icon="plus-circle">
            Add Content Type
          </Button>
        </Link>
      </Flex>
    );

    const ActionBar = <Wrapper.ActionBar right={actionBarRight} />;

    getActionBar(ActionBar);

    const content = (
      <Table whiteSpace="nowrap" hover={true}>
        <thead>
          <tr>
            <th>Display name</th>
            <th>Code</th>
            <th>
              <SortHandler sortField={'createdDate'} label={'Created at'} />
            </th>
            <th>{'Actions'}</th>
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );

    return <>{content}</>;
  }
}

export default ContentTypes;
