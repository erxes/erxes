import dayjs from 'dayjs';
import * as React from 'react';
import { IAutomation } from '../types';

type Props = {
  automation: IAutomation;
};

class AutomationRow extends React.Component<Props> {
  render() {
    const { automation } = this.props;

    return (
      <tr key={automation._id}>
        <td>{dayjs(automation.createdAt).format('YYYY-MM-DD HH:mm')}</td>
        <td>{automation.name}</td>
        <td>{automation.description}</td>
        <td>.</td>
      </tr>
    );
  }
}

export default AutomationRow;
