import Header from '@erxes/ui-settings/src/general/components/Header';
import { BarItems, Button, ModalTrigger } from '@erxes/ui/src';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import Form from '../containers/Form';
import Row from './Row';

type Props = {
  list: any[];
  totalCount: number;
  remove: (_id: string) => void;
};

class List extends React.Component<Props> {
  renderContent() {
    const { list, remove } = this.props;

    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Name')}</th>
            <th>{__('Account')}</th>
            <th>{__('Page')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>

        <tbody>
          {list.map(bot => (
            <Row key={bot._id} bot={bot} remove={remove} />
          ))}
        </tbody>
      </Table>
    );
  }

  renderForm() {
    const triggeer = <Button btnStyle="success">{__('Add')}</Button>;

    const content = ({ closeModal }) => {
      return <Form closeModal={closeModal} />;
    };

    return (
      <ModalTrigger trigger={triggeer} content={content} title="" hideHeader />
    );
  }

  render() {
    const rightActionBar = <BarItems>{this.renderForm()}</BarItems>;

    return (
      <Wrapper
        header={<Wrapper.Header title={__('Facebook Messenger Bots')} />}
        mainHead={
          <Header
            title="Facebook Messager Bots"
            description="Set up your facebook messenger bots."
          />
        }
        actionBar={<Wrapper.ActionBar right={rightActionBar} />}
        content={this.renderContent()}
        transparent={true}
        hasBorder={true}
      />
    );
  }
}

export default List;
