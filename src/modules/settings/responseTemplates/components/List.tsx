import { Table } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { List } from '../../common/components';
import { ICommonListProps } from '../../common/types';
import { Form } from '../containers';
import Row from './Row';

class ResponseTemplateList extends React.Component<ICommonListProps> {
  constructor(props) {
    super(props);

    this.renderContent = this.renderContent.bind(this);
  }

  renderRows({ objects, save, remove }) {
    return objects.map(object =>
      <Row
        key={object._id}
        object={object}
        save={save}
        remove={remove}
      />
    );
  }

  renderContent(props) {
    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Brand')}</th>
            <th>{__('Name')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRows(props)}</tbody>
      </Table>
    );
  }

  render() {
    return (
      <List
        title="New response template"
        breadcrumb={[
          { title: __('Settings'), link: '/settings' },
          { title: __('Response templates') }
        ]}
        renderForm={(props) => <Form {...props} />}
        renderContent={this.renderContent}
        {...this.props}
      />
    )
  }
}

export default ResponseTemplateList;
