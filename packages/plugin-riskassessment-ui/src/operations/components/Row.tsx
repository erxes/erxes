import { FormControl, ModalTrigger, __ } from '@erxes/ui/src';
import moment from 'moment';
import React from 'react';
import Form from '../containers/Form';
type Props = {
  queryParams: any;
  operation: any;
  level: any;
  selectedItems: string[];
  handleSelect: (id: string) => void;
};

class Row extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const { operation, level, selectedItems } = this.props;

    const handleSelect = () => {
      this.props.handleSelect(operation._id);
    };

    const onClick = e => {
      e.stopPropagation();
    };

    const trigger = (
      <tr>
        <td onClick={onClick}>
          <FormControl
            componentClass="checkbox"
            checked={selectedItems.includes(operation._id)}
            onClick={handleSelect}
          />
        </td>
        <td>{__(`${'\u00A0 \u00A0 '.repeat(level)}  ${operation.code}`)}</td>
        <td>{__(operation.name)}</td>
        <td>{moment(operation.createdAt).format('lll')}</td>
        <td>{moment(operation.modifiedAt).format('lll')}</td>
        <td>{''}</td>
      </tr>
    );

    const content = props => <Form {...props} operation={operation} />;

    return (
      <ModalTrigger
        trigger={trigger}
        content={content}
        title="Edit Operation"
      />
    );
  }
}

export default Row;
