import Button from '@erxes/ui/src/components/Button';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Table from '@erxes/ui/src/components/table';
import { __ } from '@erxes/ui/src/utils';
import { BarItems } from '@erxes/ui/src/layout/styles';
import React from 'react';
import Form from '../../containers/entries/Form';
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
    const { queryParams, contentType, entries, getActionBar } = this.props;
    const { fields = [] } = contentType;

    const modalContent = props => (
      <Form {...props} contentType={contentType} queryParams={queryParams} />
    );

    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add an entry
      </Button>
    );

    const actionBarRight = (
      <BarItems>
        <ModalTrigger
          title="Add an entry"
          trigger={trigger}
          autoOpenKey="showEntryModal"
          content={modalContent}
          size="lg"
        />
      </BarItems>
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
