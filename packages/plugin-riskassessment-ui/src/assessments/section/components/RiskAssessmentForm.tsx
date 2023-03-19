import { colors, Icon } from '@erxes/ui/src';
import { PopoverList } from '@erxes/ui/src/components/filterableList/styles';
import React from 'react';
import { RiskIndicatorsType } from '../../../indicator/common/types';
import { FormContainer } from '../../../styles';
import { DetailPopOver } from '../../common/utils';
import { AssessmentFilters } from '../common/types';
import RiskIndicatorForm from '../containers/RiskIndicatorForm';

type IndicatorsTypes = {
  _id: string;
  submitted: boolean;
} & RiskIndicatorsType;

type Props = {
  indicators: IndicatorsTypes[];
  filters: AssessmentFilters;
  closeModal: () => void;
  onlyPreview?: boolean;
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

    indicatorId = (props?.indicators || [])[0]?._id;
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
    const { filters, closeModal, onlyPreview } = this.props;
    const { indicatorId } = this.state;

    const updatedProps = {
      filters: { ...filters, indicatorId },
      closeModal,
      onlyPreview
    };

    return <RiskIndicatorForm {...updatedProps} />;
  }

  renderIndicatorList(indicators) {
    const { indicatorId } = this.state;

    const handleSelect = id => {
      this.setState({ indicatorId: id });
    };
    return indicators.map(indicator => (
      <li
        key={indicator._id}
        onClick={handleSelect.bind(this, indicator._id)}
        style={{
          backgroundColor: indicator._id === indicatorId ? colors.bgGray : ''
        }}
      >
        {indicator.group && <Icon icon="arrows-up-right" color="#3CCC38" />}
        {indicator.submitted && <Icon icon="check-1" />}
        {indicator.name}
      </li>
    ));
  }

  renderGroupList(indicators) {
    function getList(list: any[]) {
      const result: any = {};
      for (const item of list) {
        const indicatorIds = item.group.indicatorIds;
        const group = item.group;
        const key = group._id;
        if (indicatorIds.includes(item._id)) {
          result[key] = {
            _id: group._id,
            name: group.name,
            items: [...(result[key]?.items || []), item]
          };
        }
      }
      return result || {};
    }

    return Object.values(getList(indicators)).map(value => {
      const group = value as any;
      const indicators = group.items as IndicatorsTypes[];
      return (
        <li key={group._id}>
          <span>{group.name}</span>
          <div>{this.renderIndicatorList(indicators)}</div>
        </li>
      );
    });
  }

  renderList() {
    const { indicators } = this.props;

    if (!indicators?.length) {
      return;
    }

    if (indicators.some((indicator: any) => indicator.group)) {
      return this.renderGroupList(indicators);
    }
    if (
      indicators.length === 1 &&
      indicators.every((indicator: any) => !indicator.group)
    ) {
      return this.renderIndicatorList(indicators);
    }
  }

  render() {
    return (
      <div>
        <FormContainer justify="end">
          <DetailPopOver
            title="Indicators"
            icon="downarrow-2"
            withoutPopoverTitle
          >
            <PopoverList>{this.renderList()}</PopoverList>
          </DetailPopOver>
        </FormContainer>
        {this.renderForm()}
      </div>
    );
  }
}

export default RiskAssessmentForm;
