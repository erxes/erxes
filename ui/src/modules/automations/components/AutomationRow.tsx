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
        <td>{automation.name}</td>
        <td>{automation.description}</td>
        <td>{automation.status}</td>
        <td>.</td>
      </tr>
    );
  }
}

export default AutomationRow;
