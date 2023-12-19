import React from 'react';
import { DefaultWrapper } from '../../common/utils';
import {
  BarItems,
  Button,
  HeaderDescription,
  ModalTrigger,
  Table,
  __
} from '@erxes/ui/src';
import Row from './Row';
import Form from '../containers/Form';

type Props = {
  configs: any[];
  totalCount: number;
  remove: (variables: { _id: string }) => void;
};

class List extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  renderContent() {
    const { configs, remove } = this.props;

    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Name')}</th>
            <th>{__('Action')}</th>
            <th>{__('Created At')}</th>
            <th>{__('Modified At')}</th>
            <th>{__('Action')}</th>
          </tr>
        </thead>
        <tbody>
          {(configs || []).map(config => (
            <Row key={config._id} config={config} remove={remove} />
          ))}
        </tbody>
      </Table>
    );
  }

  renderForm() {
    const content = props => <Form {...props} />;

    const trigger = <Button btnStyle="success">{__('Add Config')}</Button>;

    return (
      <ModalTrigger
        title="Add Config"
        trigger={trigger}
        content={content}
        size="xl"
      />
    );
  }

  render() {
    const { totalCount } = this.props;

    const rightActionBar = <BarItems>{this.renderForm()}</BarItems>;

    const leftActionBar = (
      <HeaderDescription
        title="Grants Configurations"
        icon="/images/actions/25.svg"
        description=""
      />
    );

    const updatedProps = {
      title: 'Configs',
      content: this.renderContent(),
      leftActionBar,
      rightActionBar,
      totalCount
    };

    return <DefaultWrapper {...updatedProps} />;
  }
}

export default List;
