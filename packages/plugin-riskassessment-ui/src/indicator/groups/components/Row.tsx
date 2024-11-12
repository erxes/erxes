import { Button, FormControl, Label, __ } from '@erxes/ui/src';

import moment from 'moment';
import React from 'react';
import { FormContainer } from '../../../styles';
import { IIndicatorsGroups } from '../common/types';

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
    const { indicatorsGroups, selectItem, selectedItems, queryParams } =
      this.props;

    const onClick = e => {
      e.stopPropagation();
    };

    return (
      <tr key={indicatorsGroups._id}>
        <td onClick={onClick}>
          <FormControl
            componentclass="checkbox"
            checked={selectedItems.includes(indicatorsGroups._id)}
            onChange={selectItem.bind(this, indicatorsGroups._id)}
          />
        </td>
        <td>{__(indicatorsGroups.name)}</td>
        <td>
          <FormContainer $gapBetween={5} $row $maxItemsRow={3}>
            {(indicatorsGroups?.tags || []).map(tag => (
              <Label key={tag._id} lblColor={tag.colorCode}>
                {tag.name}
              </Label>
            ))}
          </FormContainer>
        </td>
        <td>{moment(indicatorsGroups.createdAt).format('lll')}</td>
        <td>{moment(indicatorsGroups.modifiedAt).format('lll')} </td>
        <td>
          <Button
            btnStyle="link"
            icon="edit-1"
            href={`/settings/risk-indicators-groups/edit/${indicatorsGroups._id}`}
          />
        </td>
      </tr>
    );
  }
}

export default Row;
