import React from 'react';
import { colors, Icon } from '@erxes/ui/src';
import { FormContainer } from '../../../styles';
import { DetailPopOver } from '../../common/utils';
import { PopoverList } from '@erxes/ui/src/components/filterableList/styles';
import RiskIndicatorForm from '../containers/RiskIndicatorForm';

type Props = {
  cardId: string;
  cardType: string;
  indicators: any[];
  riskAssessmentId: string;
  userId: string;
  closeModal: () => void;
};

type State = {
  indicatorId: string;
};

class RiskAssessmentForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    let indicatorId = '';

    const indicator = (props?.indicators || []).find(
      indicator => !indicator.submitted
    );

    if (indicator) {
      indicatorId = indicator._id;
    }

    indicatorId = props?.indicators[0]?._id;
    this.state = {
      indicatorId
    };
  }

  componentDidUpdate(prevProps) {
    if (
      JSON.stringify(prevProps.indicators) !==
      JSON.stringify(this.props.indicators)
    ) {
      const indicator = (this.props?.indicators || []).find(
        indicator => !indicator.submitted
      );

      if (!indicator) {
        this.props.closeModal();
      }

      this.setState({ indicatorId: indicator?._id || '' });
    }
  }

  renderForm() {
    const {
      riskAssessmentId,
      userId,
      cardId,
      cardType,
      closeModal
    } = this.props;
    const { indicatorId } = this.state;

    const updatedProps = {
      riskAssessmentId,
      userId,
      indicatorId,
      cardId,
      cardType,
      closeModal
    };

    return <RiskIndicatorForm {...updatedProps} />;
  }

  render() {
    const { indicators } = this.props;
    const { indicatorId } = this.state;

    const handleSelect = id => {
      this.setState({ indicatorId: id });
    };

    return (
      <div>
        <FormContainer justify="end">
          <DetailPopOver
            title="Indicators"
            icon="downarrow-2"
            withoutPopoverTitle
          >
            <PopoverList>
              {(indicators || []).map(indicator => (
                <li
                  key={indicator._id}
                  onClick={handleSelect.bind(this, indicator._id)}
                  style={{
                    backgroundColor:
                      indicator._id === indicatorId ? colors.bgGray : ''
                  }}
                >
                  {indicator.submitted && <Icon icon="check-1" />}
                  {indicator.name}
                </li>
              ))}
            </PopoverList>
          </DetailPopOver>
        </FormContainer>
        {this.renderForm()}
      </div>
    );
  }
}

export default RiskAssessmentForm;
