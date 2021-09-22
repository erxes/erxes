import { ACTIONS, TRIGGERS } from 'modules/automations/constants';
import Table from 'modules/common/components/table';
import withTableWrapper from 'modules/common/components/table/withTableWrapper';
import { __ } from 'modules/common/utils';
import React from 'react';

import { IAutomationHistory } from '../../types';
import Row from './Row';

type Props = {
  histories: IAutomationHistory[];
};

class Histories extends React.Component<Props> {
  render() {
    const triggersByType = {};
    TRIGGERS.forEach(t => {
      triggersByType[t.type] = `${t.label} based`;
    });
    const actionsByType = {};
    ACTIONS.forEach(a => {
      actionsByType[a.type] = a.label;
    });

    const renderContent = () => {
      const { histories } = this.props;
      if (!histories.length) {
        return <div>the automation's history has not yet been created</div>;
      }

      return (
        <withTableWrapper.Wrapper>
          <Table whiteSpace="nowrap" bordered={true} hover={true}>
            <thead>
              <tr>
                <th>{__('Time')}</th>
                <th>{__('trigger')}</th>
                <th>{__('Title')}</th>
                <th>{__('Status')}</th>
                <th>{__('Description')}</th>
              </tr>
            </thead>
            <tbody id="automationHistories">
              {histories.map(history => (
                <Row
                  key={history._id}
                  history={history}
                  triggersByType={triggersByType}
                  actionsByType={actionsByType}
                />
              ))}
            </tbody>
          </Table>
        </withTableWrapper.Wrapper>
      );
    };

    return renderContent();
  }
}
export default Histories;
