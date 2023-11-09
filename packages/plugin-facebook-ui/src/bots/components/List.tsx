import Header from '@erxes/ui-settings/src/general/components/Header';
import { ActionBar, BarItems, Button, ModalTrigger } from '@erxes/ui/src';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import Row from './Row';
import Form from '../containers/Form';

type Props = {
  list: any[];
  totalCount: number;
};

class List extends React.Component<Props> {
  renderContent() {
    const { list } = this.props;

    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Name')}</th>
            <th>{__('Integration')}</th>
            <th>{__('Page')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>

        <tbody>
          {list.map(bot => (
            <Row bot={bot} />
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

    console.log('sadsfdgf');

    return (
      <Wrapper
        header={<Wrapper.Header title={__('Facebook Messenger Bots')} />}
        mainHead={
          <Header
            title="Facebook Messager Bots"
            description="Set up your facebook messenger bots."
          />
        }
        actionBar={
          <Wrapper.ActionBar
            // left={<Title>{__('Facebook Messenger Bots')}</Title>}
            right={rightActionBar}
          />
        }
        content={this.renderContent()}
        transparent={true}
        hasBorder={true}
      />
    );
  }
}

export default List;
