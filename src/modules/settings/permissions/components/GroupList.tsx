import {
  ActionButtons,
  Button,
  DataWithLoader,
  Icon,
  ModalTrigger,
  Pagination,
  Table,
  Tip
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import { BarItems } from 'modules/layout/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { IUserGroup, IUserGroupDocument } from '../types';
import GroupForm from './GroupForm';

type Props = {
  totalCount: number;
  loading: boolean;
  objects: IUserGroupDocument[];
  save: (doc: IUserGroup, callback: () => void, object: any) => void;
  remove: (id: string) => void;
};

class GroupList extends React.Component<Props> {
  renderFormTrigger(trigger: React.ReactNode, object) {
    const content = props => this.renderForm({ ...props, object });

    return (
      <ModalTrigger
        title="New Group"
        size={'lg'}
        trigger={trigger}
        content={content}
      />
    );
  }

  renderForm = props => {
    const { save } = this.props;

    const extendedProps = { ...props, save };

    return <GroupForm {...extendedProps} />;
  };

  renderEditActions(object: IUserGroupDocument) {
    const trigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')}>
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return this.renderFormTrigger(trigger, object);
  }

  renderRemoveActions(object: IUserGroupDocument) {
    const { remove } = this.props;

    return (
      <Button btnStyle="link" onClick={remove.bind(null, object._id)}>
        <Tip text={__('Remove')}>
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  }

  renderObjects(objects: IUserGroupDocument[]) {
    return objects.map(object => (
      <tr key={object._id}>
        <td>{object.name}</td>
        <td>{object.description}</td>
        <td>
          {this.renderEditActions(object)}
          {this.renderRemoveActions(object)}
        </td>
      </tr>
    ));
  }

  renderContent() {
    const { objects } = this.props;

    return (
      <Table whiteSpace="nowrap={true}" hover={true} bordered={true}>
        <thead>
          <tr>
            <th>{__('Name')}</th>
            <th>{__('Description')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{this.renderObjects(objects)}</tbody>
      </Table>
    );
  }

  renderActionBar() {
    const trigger = (
      <Button btnStyle="primary" size="small" icon="plus">
        New Group
      </Button>
    );

    const rightActionBar = (
      <BarItems>
        {this.renderFormTrigger(trigger, null)}
        <Link to="/settings/permissions">
          <Button type="success" size="small">
            Permissions
          </Button>
        </Link>
      </BarItems>
    );

    return <Wrapper.ActionBar right={rightActionBar} />;
  }

  render() {
    const { totalCount, loading } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Users groups') }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        actionBar={this.renderActionBar()}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={this.renderContent()}
            loading={loading}
            count={totalCount}
            emptyText="There is no data."
            emptyImage="/images/robots/robot-05.svg"
          />
        }
      />
    );
  }
}

export default GroupList;
