import {
  Button,
  FormControl,
  Icon,
  ModalTrigger,
  Tip,
  __
} from '@erxes/ui/src';
import React from 'react';
import { IIndicatorsGroups } from '../common/types';
import Form from '../containers/Form';
import moment from 'moment';
type Props = {
  indicatorsGroups: IIndicatorsGroups;
  selectedItems: string[];
  selectItem: (id) => void;
};

class Row extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const { indicatorsGroups, selectItem, selectedItems } = this.props;

    const onClick = e => {
      e.stopPropagation();
    };

    const trigger = (
      <tr key={indicatorsGroups._id}>
        <td onClick={onClick}>
          <FormControl
            componentClass="checkbox"
            checked={selectedItems.includes(indicatorsGroups._id)}
            onChange={selectItem.bind(this, indicatorsGroups._id)}
          />
        </td>
        <td>{__(indicatorsGroups.name)}</td>
        <td>{moment(indicatorsGroups.createdAt).format('lll')}</td>
        <td>{moment(indicatorsGroups.modifiedAt).format('lll')} </td>
        <td></td>
      </tr>
    );

    const content = props => <Form {...props} detail={indicatorsGroups} />;

    return (
      <ModalTrigger
        trigger={trigger}
        content={content}
        title="Edit Indicators Groups"
        size="xl"
      />
    );
  }
}

export default Row;
