import Select from 'react-select-plus';
import { ControlLabel, FormGroup, Sidebar, __ } from '@erxes/ui/src';
import React from 'react';

// import CompanySection from './sections/CompanySection';
import PortableItems from '@erxes/ui-cards/src/boards/components/portable/Items';
import options from '@erxes/ui-cards/src/deals/options';
// import CustomerSection from './sections/CustomerSection';
import { InsuranceItem } from '../../../../gql/types';
import CustomerSection from './sections/CustomerSection';
import CompanySection from './sections/CompanySection';
import ContractsSection from './sections/ContractsSection';

type Props = {
  item: InsuranceItem;
  // assets: any[];
  onUpdate: (data: any) => void;
};

export default class RightSidebar extends React.Component<Props> {
  onSelectCustomers = (datas: any) => {
    this.props.onUpdate({ customerIds: datas.map((d) => d._id) });
  };

  // onSelectCompanies = (datas: any) => {
  //   this.props.onUpdate({ companyIds: datas.map(d => d._id) });
  // };

  // onChangeAssets = values => {
  //   this.props.onUpdate({ assetIds: values.map(d => d.value) });
  // };

  render() {
    const { item } = this.props;

    return (
      <Sidebar wide={true}>
        {/* <FormGroup>
          <ControlLabel>{__('Select assets')}</ControlLabel>

          <Select
            value={building.assetIds}
            onChange={this.onChangeAssets}
            multi={true}
            options={assets.map(asset => {
              return { value: asset._id, label: asset.name };
            })}
          />
        </FormGroup> */}

        <ContractsSection item={item} />

        <CustomerSection
          item={item}
          onSelectCustomers={this.onSelectCustomers}
        />

        <CompanySection
          item={item}
          onSelectCustomers={this.onSelectCustomers}
        />

        <PortableItems
          data={{
            options: { ...options, title: 'Deal' },
          }}
          items={[item.deal as any]}
          onChangeItem={() => {
            console.log('onChangeItem');
          }}
        />
      </Sidebar>
    );
  }
}
