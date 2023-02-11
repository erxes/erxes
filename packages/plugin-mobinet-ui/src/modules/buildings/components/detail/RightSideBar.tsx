import Select from 'react-select-plus';
import { ControlLabel, FormGroup, Sidebar, __ } from '@erxes/ui/src';
import React from 'react';
import { IBuilding } from '../../types';
import CompanySection from './sections/CompanySection';
import PortableItems from '@erxes/ui-cards/src/boards/components/portable/Items';
import options from '@erxes/ui-cards/src/tickets/options';
import CustomerSection from './sections/CustomerSection';

type Props = {
  building: IBuilding;
  assets: any[];
  onUpdate: (data: any) => void;
};

export default class RightSidebar extends React.Component<Props> {
  onSelectCustomers = (datas: any) => {
    this.props.onUpdate({ customerIds: datas.map(d => d._id) });
  };

  onSelectCompanies = (datas: any) => {
    this.props.onUpdate({ companyIds: datas.map(d => d._id) });
  };

  onChangeAssets = values => {
    this.props.onUpdate({ assetIds: values.map(d => d.value) });
  };

  render() {
    const { building, assets } = this.props;
    const ticketIds = building.ticketIds || [];

    let title = 'Active tickets';

    if (ticketIds.length > 0) {
      title += ` (${ticketIds.length})`;
    }

    return (
      <Sidebar wide={true}>
        <FormGroup>
          <ControlLabel>{__('Select assets')}</ControlLabel>

          <Select
            value={building.assetIds}
            onChange={this.onChangeAssets}
            multi={true}
            options={assets.map(asset => {
              return { value: asset._id, label: asset.name };
            })}
          />
        </FormGroup>

        <CustomerSection
          building={building}
          onSelectCustomers={this.onSelectCustomers}
        />

        <CompanySection
          building={building}
          onSelectCompanies={this.onSelectCompanies}
        />

        <PortableItems
          data={{
            options: { ...options, title },
            hideExtraButton: true
          }}
          items={building.tickets}
          onChangeItem={() => {
            console.log('onChangeItem');
          }}
        />
      </Sidebar>
    );
  }
}
