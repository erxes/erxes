import { ACTIONS, TRIGGERS } from 'modules/automations/constants';
import Table from 'modules/common/components/table';
import withTableWrapper from 'modules/common/components/table/withTableWrapper';
import { __ } from 'modules/common/utils';
import React from 'react';
import { IAutomationHistory } from '../../types';
import Row from './Row';
import EmptyState from 'modules/common/components/EmptyState';

type Props = {
  histories: IAutomationHistory[];
};

class Histories extends React.Component<Props> {
  render() {
    const { histories } = this.props;

    const triggersByType = {};
    TRIGGERS.forEach(t => {
      triggersByType[t.type] = `${t.label} based`;
    });

    const actionsByType = {};
    ACTIONS.forEach(a => {
      actionsByType[a.type] = a.label;
    });

    if (!histories || histories.length === 0) {
      return (
        <EmptyState
          image="/images/actions/8.svg"
          text="History has not yet been created"
        />
      );
    }

    return (
      <withTableWrapper.Wrapper>
        <Table whiteSpace="nowrap" bordered={true} hover={true}>
          <thead>
            <tr>
              <th>{__('Title')}</th>
              <th>{__('Description')}</th>
              <th>{__('Trigger')}</th>
              <th>{__('Status')}</th>
              <th>{__('Time')}</th>
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
  }
}

export default Histories;
