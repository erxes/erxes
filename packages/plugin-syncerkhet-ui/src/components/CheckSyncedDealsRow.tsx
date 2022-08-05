import { FormControl } from '@erxes/ui/src/components/form';
import Tip from '@erxes/ui/src/components/Tip';
import React from 'react';
import Button from '@erxes/ui/src/components/Button';

type Props = {
  deal: any;
  history: any;
  isChecked: boolean;
  isUnsynced: boolean;
  toggleBulk: (deal: any, isChecked?: boolean) => void;
  toSync: (dealIds: string[]) => void;
};

class Row extends React.Component<Props> {
  render() {
    const { deal, toggleBulk, isChecked, isUnsynced } = this.props;

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(deal, e.target.checked);
      }
    };

    const onClick = e => {
      e.stopPropagation();
    };

    const onClickSync = e => {
      e.stopPropagation();
      this.props.toSync([deal._id]);
    };

    const onTrClick = () => {};

    const { name, amount, createdAt, stageChangedDate, modifiedAt } = deal;

    return (
      <tr onClick={onTrClick}>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked || isUnsynced}
            componentClass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>{name}</td>
        <td>
          {Object.keys(amount).map(a => `${amount[a].toLocaleString()} ${a}`)}
        </td>
        <td>{createdAt}</td>
        <td>{modifiedAt}</td>
        <td>{stageChangedDate}</td>
        <td>
          {isUnsynced && (
            <Tip text="Sync">
              <Button btnStyle="link" onClick={onClickSync} icon="sync" />
            </Tip>
          )}
        </td>
      </tr>
    );
  }
}

export default Row;
