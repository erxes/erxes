import { Button, FormControl, Icon, Label, Tip } from '@erxes/ui/src';
import { isEnabled } from '@erxes/ui/src/utils/core';
import moment from 'moment';
import React from 'react';
import { FormContainer } from '../../styles';
import { RiskIndicatorsType } from '../common/types';

type IProps = {
  indicator: RiskIndicatorsType;
  selectedItems: string[];
  onChange: (id: string) => void;
  queryParams: any;
  handleDuplicate: (_id: string) => void;
  history: any;
};

const generateDate = (value, formatted?) => {
  if (formatted) {
    return value ? moment(value).format('MM/DD/YYYY HH:mm') : '-';
  }
  return value ? moment(value).fromNow() : '-';
};

class TableRow extends React.Component<IProps> {
  renderActions() {
    const { handleDuplicate, indicator } = this.props;

    return (
      <Button
        btnStyle="link"
        style={{ padding: '5px' }}
        onClick={handleDuplicate.bind(this, indicator._id)}
      >
        <Tip text="Duplicate this risk indicator" placement="bottom">
          <Icon icon="copy" />
        </Tip>
      </Button>
    );
  }

  render() {
    const { indicator, selectedItems, onChange, history } = this.props;

    const { _id, name, modifiedAt, createdAt, tags } = indicator;

    const onclick = e => {
      e.stopPropagation();
    };

    return (
      <tr
        key={_id}
        onClick={() => history.push(`/settings/risk-indicators/detail/${_id}`)}
      >
        <td onClick={onclick}>
          <FormControl
            componentClass="checkbox"
            checked={selectedItems.includes(_id)}
            onChange={() => onChange(_id)}
          />
        </td>
        <td>{name}</td>
        {isEnabled('tags') && (
          <td>
            <FormContainer gapBetween={5} row maxItemsRow={3}>
              {(tags || []).map(tag => (
                <Label key={tag._id} lblColor={tag.colorCode}>
                  {tag.name}
                </Label>
              ))}
            </FormContainer>
          </td>
        )}
        <Tip text={generateDate(createdAt, true)} placement="bottom">
          <td>{generateDate(createdAt)}</td>
        </Tip>
        <Tip text={generateDate(modifiedAt, true)} placement="bottom">
          <td>{generateDate(modifiedAt)}</td>
        </Tip>
        <td onClick={onclick}>{this.renderActions()}</td>
      </tr>
    );
  }
}

export default TableRow;
