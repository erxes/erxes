import React from 'react';
import { Button, ModalTrigger } from '@erxes/ui/src';
import moment from 'moment';
import Form from '../containers/Form';

type Props = {
  config: any;
  remove: (variables: { _id: string }) => void;
};

const Row: React.FC<Props> = (props) => {
  const { config, remove } = props;

  const onClick = (e) => {
    e.stopPropagation();
  };

  const handleRemove = () => {
    remove({ _id: config._id });
  };

  const content = (props) => <Form {...props} config={config} />;
  const trigger = (
    <tr>
      <td>{config.name || ''}</td>
      <td>{config.action || ''}</td>
      <td>
        {config?.createdAt ? moment(config?.createdAt).format('ll hh:mm') : '-'}
      </td>
      <td>
        {config?.modifiedAt
          ? moment(config?.modifiedAt).format('ll hh:mm')
          : '-'}
      </td>
      <td onClick={onClick}>
        <Button btnStyle="link" icon="trash-alt" onClick={handleRemove} />
      </td>
    </tr>
  );

  return (
    <ModalTrigger
      title="Config Detail"
      trigger={trigger}
      content={content}
      size="xl"
    />
  );
};

export default Row;
