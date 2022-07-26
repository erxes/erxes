import Button from '@erxes/ui/src/components/Button';
import { Link } from 'react-router-dom';
import { Flex } from '@erxes/ui/src/styles/main';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Table from '@erxes/ui/src/components/table';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import Row from './Row';

type Props = {
  history: any;
  queryParams: any;
  loading: boolean;
  entries: any[];
  contentType: any;
  getActionBar: (actionBar: any) => void;
  remove: (_id: string) => void;
};

class List extends React.Component<Props> {
  renderRow = () => {
    const { entries, remove, contentType } = this.props;

    return entries.map(entry => (
      <Row
        key={entry._id}
        entry={entry}
        remove={remove}
        contentType={contentType}
      />
    ));
  };

  render() {
    const { contentType, entries, getActionBar } = this.props;
    const { fields = [] } = contentType;

    const actionBarRight = (
      <Flex>
        <Link to={`create/${contentType._id}`}>
          <Button btnStyle="success" size="small" icon="plus-circle">
            Add Entry
          </Button>
        </Link>
      </Flex>
    );

    getActionBar(actionBarRight);

    let content = (
      <>
        <Table hover={true}>
          <thead>
            <tr>
              {fields.map((field, i) => {
                if (i > 2) {
                  return;
                }

                return <th key={field.code}>{field.text}</th>;
              })}
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRow()}</tbody>
        </Table>
      </>
    );

    if (entries.length === 0) {
      content = (
        <EmptyState
          image="/images/actions/8.svg"
          text="No Entries"
          size="small"
        />
      );
    }

    return <>{content}</>;
  }
}

export default List;
