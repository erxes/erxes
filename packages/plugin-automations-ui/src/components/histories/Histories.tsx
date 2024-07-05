import { IAutomation, IAutomationHistory, ITrigger } from '../../types';

import EmptyState from '@erxes/ui/src/components/EmptyState';
import React from 'react';
import Row from './Row';
import Table from '@erxes/ui/src/components/table';
import { __ } from '@erxes/ui/src/utils/core';
import withTableWrapper from '@erxes/ui/src/components/table/withTableWrapper';
import { Pagination } from '@erxes/ui/src';

type Props = {
  automation: IAutomation;
  histories: IAutomationHistory[];
  triggersConst: ITrigger[];
  actionsConst: any[];
  totalCount: number;
};

class Histories extends React.Component<Props> {
  render() {
    const { histories, triggersConst, actionsConst, totalCount, automation } =
      this.props;

    const triggersByType = {};
    triggersConst.forEach(t => {
      triggersByType[t.type] = `${t.label} based`;
    });

    const actionsByType = {};
    actionsConst.forEach(a => {
      actionsByType[a.type] = a.label;
    });

    if (!histories || histories.length === 0) {
      return (
        <EmptyState
          image="/images/actions/5.svg"
          text="History has not yet been created"
        />
      );
    }

    return (
      <withTableWrapper.Wrapper>
        <Table $whiteSpace="nowrap" $bordered={true} $hover={true}>
          <thead>
            <tr>
              <th>{__('Title')}</th>
              <th>{__('Description')}</th>
              <th>{__('Trigger')}</th>
              <th>{__('Status')}</th>
              <th>{__('Time')}</th>
              <th>{__('Action')}</th>
            </tr>
          </thead>
          <tbody id="automationHistories">
            {histories.map(history => (
              <Row
                key={history._id}
                automation={automation}
                history={history}
                triggersByType={triggersByType}
                actionsByType={actionsByType}
                constants={{ actionsConst, triggersConst }}
              />
            ))}
          </tbody>
        </Table>
        <Pagination count={totalCount} hidePerPageChooser perPage={13} />
      </withTableWrapper.Wrapper>
    );
  }
}

export default Histories;
