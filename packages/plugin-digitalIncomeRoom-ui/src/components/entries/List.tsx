import { IContentType, IEntryDoc } from '../../types';

import Button from '@erxes/ui/src/components/Button';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { EntryContainer } from './styles';
import EntryForm from '../../containers/entries/EntryForm';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import Row from './Row';
import { SubTitle } from '../sites/styles';
import Table from '@erxes/ui/src/components/table';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  loading: boolean;
  entries: IEntryDoc[];
  contentType: IContentType;
  remove: (_id: string) => void;
  entriesCount: number;
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

  renderButtons() {
    const { contentType } = this.props;

    const trigger = (
      <Button btnStyle="success" size="small" icon="plus-circle">
        Add Entry
      </Button>
    );

    const content = ({ closeModal }) => (
      <EntryForm contentTypeId={contentType._id} closeModal={closeModal} />
    );

    return (
      <ModalTrigger
        title="Add new entry"
        size="lg"
        trigger={trigger}
        content={content}
      />
    );
  }

  render() {
    const { contentType, entriesCount } = this.props;
    const { fields = [] } = contentType;

    let content = (
      <Table hover={true}>
        <thead>
          <tr>
            {fields.map(field => {
              if (!field.show) {
                return;
              }

              return <th key={field.code}>{field.text}</th>;
            })}
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );

    if (entriesCount < 1) {
      content = (
        <EmptyState
          image="/images/actions/8.svg"
          text="No Entries"
          size="small"
        />
      );
    }

    return (
      <EntryContainer className="gjs-one-bg gjs-two-color">
        <SubTitle flexBetween={true}>
          {contentType.displayName} {__('Entries')}
          {this.renderButtons()}
        </SubTitle>
        {content}
      </EntryContainer>
    );
  }
}

export default List;
