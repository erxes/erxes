import React from 'react';
import { DefaultWrapper } from '../../common/utils';
import {
  BarItems,
  Button,
  HeaderDescription,
  ModalTrigger,
  Table,
  __,
} from '@erxes/ui/src';
import Row from './Row';
import Form from '../containers/Form';

type Props = {
  configs: any[];
  totalCount: number;
  remove: (variables: { _id: string }) => void;
};

const List: React.FC<Props> = (props) => {
  const { configs, remove, totalCount } = props;

  const renderContent = () => {
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
          {(configs || []).map((config) => (
            <Row key={config._id} config={config} remove={remove} />
          ))}
        </tbody>
      </Table>
    );
  };

  const renderForm = () => {
    const content = (props) => <Form {...props} />;

    const trigger = <Button btnStyle="success">{__('Add Config')}</Button>;

    return (
      <ModalTrigger
        title={__("Add Config")}
        trigger={trigger}
        content={content}
        size="xl"
      />
    );
  };

  const rightActionBar = <BarItems>{renderForm()}</BarItems>;

  const leftActionBar = (
    <HeaderDescription
      title={__("Grants Configurations")}
      icon="/images/actions/25.svg"
      description=""
    />
  );

  const updatedProps = {
    title: 'Configs',
    content: renderContent(),
    leftActionBar,
    rightActionBar,
    totalCount,
  };

  //test 

  return <DefaultWrapper {...updatedProps} />;
};

export default List;
