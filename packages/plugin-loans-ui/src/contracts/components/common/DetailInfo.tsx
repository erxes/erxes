import dayjs from 'dayjs';
import { FieldStyle, SidebarCounter, SidebarList } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import React from 'react';
import { WEEKENDS } from '../../../constants';
import { Description } from '../../styles';
import { IContract } from '../../types';

type Props = {
  contract: IContract;
};

class DetailInfo extends React.Component<Props> {
  renderRow = (label, value) => {
    return (
      <li>
        <FieldStyle>{__(`${label}`)}</FieldStyle>
        <SidebarCounter>{value || '-'}</SidebarCounter>
      </li>
    );
  };

  renderTeamMember = (label, field) => {
    const { contract } = this.props;

    return this.renderRow(
      label,
      contract[field]
        ? (contract[field].details && contract[field].details.fullName) ||
            contract[field].email
        : '-'
    );
  };

  render() {
    const { contract } = this.props;

    return (
      <SidebarList className="no-link">
        {this.renderRow(
          'Contract Type',
          contract.contractType ? contract.contractType.name : ''
        )}
        {this.renderRow('Contract Number', contract.number)}
        {this.renderRow('Status', contract.status)}
        {this.renderRow('Classification', contract.classification)}
        {this.renderRow(
          'Margin Amount',
          (contract.marginAmount || 0).toLocaleString()
        )}
        {this.renderRow(
          'Lease Amount',
          (contract.leaseAmount || 0).toLocaleString()
        )}
        {this.renderRow(
          'Fee Amount',
          (contract.feeAmount || 0).toLocaleString()
        )}
        {this.renderRow(
          'Tenor (in months)',
          (contract.tenor || 0).toLocaleString()
        )}
        {this.renderRow(
          'Interest Month',
          ((contract.interestRate || 0) / 12).toLocaleString()
        )}
        {this.renderRow(
          'Interest Rate',
          (contract.interestRate || 0).toLocaleString()
        )}
        {this.renderRow('Loan Repayment', contract.repayment)}
        {this.renderRow('Start Date', dayjs(contract.startDate).format('ll'))}
        {this.renderRow('Schedule Days', contract.scheduleDays.join(','))}
        {this.renderRow(
          'Loss Percent',
          (contract.unduePercent || 0).toLocaleString()
        )}
        {this.renderRow('Loss calc type', contract.undueCalcType)}
        {this.renderRow('Debt Limit', (contract.debt || 0).toLocaleString())}
        {this.renderRow(
          'Insurance On Year',
          (contract.insuranceAmount || 0).toLocaleString()
        )}

        {this.renderRow(
          'Salvage Amount',
          (contract.salvageAmount || 0).toLocaleString()
        )}
        {this.renderRow(
          'Salvage Percent',
          (contract.salvagePercent || 0).toLocaleString()
        )}
        {this.renderRow(
          'Salvage Tenor',
          (contract.salvageTenor || 0).toLocaleString()
        )}
        {this.renderTeamMember('Relationship officer', 'relationExpert')}
        {this.renderTeamMember('Leasing officer', 'leasingExpert')}
        {this.renderTeamMember('Risk officer', 'riskExpert')}
        <li>
          <FieldStyle>{__(`Weekends`)}</FieldStyle>
          <SidebarCounter>
            {contract.weekends.map(week => WEEKENDS[week]).join(', ')}
          </SidebarCounter>
        </li>
        <li>
          <FieldStyle>{__(`Use Holiday`)}</FieldStyle>
          <SidebarCounter>
            {(contract.useHoliday && 'Yes') || 'No'}
          </SidebarCounter>
        </li>
        <li>
          <FieldStyle>{__(`Description`)}</FieldStyle>
        </li>
        <Description
          dangerouslySetInnerHTML={{
            __html: contract.description
          }}
        />
      </SidebarList>
    );
  }
}

export default DetailInfo;
