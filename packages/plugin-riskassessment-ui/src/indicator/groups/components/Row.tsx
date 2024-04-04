import { FormControl, Label, ModalTrigger, __ } from '@erxes/ui/src';
import moment from 'moment';
import React from 'react';
import { FormContainer } from '../../../styles';
import { IIndicatorsGroups } from '../common/types';
import Form from '../containers/Form';
type Props = {
  indicatorsGroups: IIndicatorsGroups;
  selectedItems: string[];
  selectItem: (id) => void;
  queryParams: any;
};

class Row extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      indicatorsGroups,
      selectItem,
      selectedItems,
      queryParams
    } = this.props;

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
        <td>
          <FormContainer gapBetween={5} row maxItemsRow={3}>
            {(indicatorsGroups?.tags || []).map(tag => (
              <Label key={tag._id} lblColor={tag.colorCode}>
                {tag.name}
              </Label>
            ))}
          </FormContainer>
        </td>
        <td>{moment(indicatorsGroups.createdAt).format('lll')}</td>
        <td>{moment(indicatorsGroups.modifiedAt).format('lll')} </td>
        <td></td>
      </tr>
    );

    const content = props => (
      <Form {...props} detail={indicatorsGroups} queryParams={queryParams} />
    );

    return (
      <ModalTrigger
        trigger={trigger}
        enforceFocus={false}
        content={content}
        title="Edit Indicators Groups"
        size="xl"
      />
    );
  }
}

export default Row;
