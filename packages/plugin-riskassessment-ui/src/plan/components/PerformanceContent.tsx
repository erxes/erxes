import { __ } from '@erxes/ui/src';
import React from 'react';
import { Divider, FormContainer, ScheduleCard } from '../../styles';
import PortableCard from '../common/PortableCard';
import { IPLan } from '../common/types';

type Props = {
  plan: { cardIds?: string[]; dashboard?: any } & IPLan;
};

const commonStyles = {
  minWidth: '250px',
  maxWidth: '350px'
};

const handleNaN = value => {
  return isNaN(value) ? 0 : value;
};

const generatePercentage = (value1, value2) =>
  handleNaN(((value1 / value2) * 100).toFixed(2));

class Performance extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const { plan } = this.props;
    const { configs, dashboard } = plan || {};
    const {
      submittedAssessmentCount = 0,
      totalCards = 0,
      averangeAssessment = 0,
      resolvedCardsCount = 0
    } = dashboard || {};

    return (
      <FormContainer column padding="25px">
        <FormContainer row gap padding="25px">
          <ScheduleCard {...commonStyles}>
            <h3>{totalCards}</h3>
            <span>{__('Total Cards')}</span>
          </ScheduleCard>
          <ScheduleCard {...commonStyles}>
            <h3>{averangeAssessment}</h3>
            <span>{__('Avarange Assessment')}</span>
          </ScheduleCard>
          <ScheduleCard {...commonStyles}>
            <h3>
              {submittedAssessmentCount}/{totalCards}
            </h3>
            <h4>
              ({generatePercentage(submittedAssessmentCount, totalCards)}%)
            </h4>
            <span>{__('Performance')}</span>
          </ScheduleCard>
          <ScheduleCard {...commonStyles}>
            <h3>
              {resolvedCardsCount}/{submittedAssessmentCount}
            </h3>
            <h4>
              (
              {generatePercentage(resolvedCardsCount, submittedAssessmentCount)}
              %)
            </h4>
            <span>{__('Resolved')}</span>
          </ScheduleCard>
        </FormContainer>
        <>
          <Divider />
          {(plan?.cardIds || []).map(cardId => (
            <PortableCard key={cardId} id={cardId} type={configs.cardType} />
          ))}
        </>
      </FormContainer>
    );
  }
}

export default Performance;
