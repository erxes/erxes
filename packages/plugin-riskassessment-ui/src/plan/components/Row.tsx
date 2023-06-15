import { Button, FormControl, Icon, Tip, __ } from '@erxes/ui/src';
import moment from 'moment';
import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  plan: any;
  selectedItems: string[];
  handleSelect: (id: string) => void;
  queryParams: any;
};

class Row extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const { plan, selectedItems, handleSelect } = this.props;

    const onClick = e => {
      e.stopPropagation();
    };
    return (
      <tr>
        <td onClick={onClick}>
          <FormControl
            componentClass="checkbox"
            checked={selectedItems.includes(plan._id)}
            onClick={handleSelect.bind(this, plan._id)}
          />
        </td>
        <td>{__(plan.name)}</td>
        <td>{plan.createdAt ? moment(plan.createdAt).format('lll') : '-'}</td>
        <td>{plan.modifiedAt ? moment(plan.modifiedAt).format('lll') : '-'}</td>
        <td>
          <Link to={`/settings/risk-assessment-plans/edit/${plan._id}`}>
            <Button btnStyle="link">
              <Tip placement="bottom" text="Edit risk assessment config">
                <Icon icon="edit-3" />
              </Tip>
            </Button>
          </Link>
        </td>
      </tr>
    );
  }
}

export default Row;
