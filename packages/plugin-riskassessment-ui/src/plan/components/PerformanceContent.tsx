import React from 'react';
import { IPLan } from '../common/types';
import { ITicket } from '@erxes/ui-cards/src/tickets/types';
import { ITask } from '@erxes/ui-cards/src/tasks/types';
import { IDeal } from '@erxes/ui-cards/src/deals/types';
import PortableCard from '../common/PortableCard';
import { Divider, FormContainer, ScheduleCard } from '../../styles';
import { __ } from '@erxes/ui/src';

type Props = {
  plan: { cardIds?: string[]; dashboard?: any } & IPLan;
};

const commonStyles = {
  minWidth: '250px',
  maxWidth: '350px'
};

class Performance extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const { plan } = this.props;
    const { configs, dashboard } = plan;

    const performancePercentage = (
      (dashboard?.submittedAssessmentCount || 0) / dashboard?.totalCards || 0
    ).toFixed(2);

    const resolvedPercentage = (
      0 / (dashboard?.submittedAssessmentCount || 0) || 0
    ).toFixed(2);

    return (
      <FormContainer column padding="25px">
        <FormContainer row gap padding="25px">
          <ScheduleCard {...commonStyles}>
            <h3>{dashboard?.totalCards || 0}</h3>
            <span>{__('Total Cards')}</span>
          </ScheduleCard>
          <ScheduleCard {...commonStyles}>
            <h3>{dashboard?.averangeAssessment || 0}</h3>
            <span>{__('Avarange Assessment')}</span>
          </ScheduleCard>
          <ScheduleCard {...commonStyles}>
            <h3>
              {dashboard?.submittedAssessmentCount || 0}/{dashboard?.totalCards}
            </h3>
            <h4>({performancePercentage}%)</h4>
            <span>{__('Performance')}</span>
          </ScheduleCard>
          <ScheduleCard {...commonStyles}>
            <h3>
              {dashboard.resolvedCardsCount}/
              {dashboard?.submittedAssessmentCount}
            </h3>
            <h4>({resolvedPercentage}%)</h4>
            <span>{__('Resolved')}</span>
          </ScheduleCard>
        </FormContainer>
        <>
          <Divider />
          {(plan?.cardIds || []).map(cardId => (
            <PortableCard id={cardId} type={configs.cardType} />
          ))}
        </>
      </FormContainer>
    );
  }
}

export default Performance;
