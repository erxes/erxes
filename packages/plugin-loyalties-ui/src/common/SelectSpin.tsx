import React from 'react';
import { SelectWithSearch } from '@erxes/ui/src/components';
import { IOption } from '@erxes/ui/src/types';
import { queries } from '../configs/spinCampaign/graphql';
import { ISpinCampaign } from '../configs/spinCampaign/types';

type Props = {
  label: string;
  name: string;
  initialValue?: any;
  onSelect: (value: string | string[], name: string) => void;
  customOption?: {
    value: string;
    label: string;
    avatar?: string;
  };
  multi?: boolean;
};

class SelectSpinCampaign extends React.Component<Props> {
  render() {
    const {
      label,
      name,
      initialValue,
      onSelect,
      multi,
      customOption
    } = this.props;

    function generateSpinCampaignOptions(
      array: ISpinCampaign[] = []
    ): IOption[] {
      return array.map(spinCampaign => ({
        value: spinCampaign._id || '-',
        label: spinCampaign.title || '-'
      }));
    }

    return (
      <SelectWithSearch
        label={label}
        queryName="spinCampaigns"
        name={name}
        initialValue={initialValue}
        generateOptions={generateSpinCampaignOptions}
        onSelect={onSelect}
        customQuery={queries.spinCampaigns}
        customOption={customOption}
        multi={multi}
      />
    );
  }
}

export default SelectSpinCampaign;
