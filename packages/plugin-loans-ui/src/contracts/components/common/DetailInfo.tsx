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
    if (!value) return <></>;
    return (
      <li>
        <FieldStyle>{__(`${label}`)}</FieldStyle>
        <SidebarCounter>{value || '-'}</SidebarCounter>
      </li>
    );
  };

  renderTeamMember = (label, field) => {
    const { contract } = this.props;
    if (!contract[field]) return <></>;
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
        {this.renderRow('Lease Type', contract.leaseType)}
        {this.renderRow(
          'Margin Amount',
          contract.marginAmount && contract.marginAmount.toLocaleString()
        )}
        {this.renderRow(
          'Lease Amount',
          contract.leaseAmount && contract.leaseAmount.toLocaleString()
        )}
        {this.renderRow(
          'Given Amount',
          contract.givenAmount && contract.givenAmount.toLocaleString()
        )}
        {this.renderRow(
          'Fee Amount',
          contract.feeAmount && contract.feeAmount.toLocaleString()
        )}
        {this.renderRow(
          'Stored Interest',
          contract.storedInterest && contract.storedInterest.toLocaleString()
        )}

        {this.renderRow(
          'Tenor (in months)',
          contract.tenor && contract.tenor.toLocaleString()
        )}
        {this.renderRow(
          'Interest Month',
          contract.interestRate && (contract.interestRate / 12).toLocaleString()
        )}
        {this.renderRow(
          'Interest Rate',
          contract.interestRate && contract.interestRate.toLocaleString()
        )}
        {contract.leaseType === 'linear' &&
          this.renderRow(
            'Commitment interest',
            contract.commitmentInterest &&
              contract.commitmentInterest.toLocaleString()
          )}
        {this.renderRow('Loan Repayment', contract.repayment)}
        {this.renderRow('Start Date', dayjs(contract.startDate).format('ll'))}
        {this.renderRow('Schedule Days', contract.scheduleDays.join(','))}
        {this.renderRow(
          'Loss Percent',
          contract.unduePercent && contract.unduePercent.toLocaleString()
        )}
        {this.renderRow('Loss calc type', contract.undueCalcType)}
        {this.renderRow(
          'Debt Limit',
          contract.debt && contract.debt.toLocaleString()
        )}
        {this.renderRow(
          'Insurance On Year',
          contract.insuranceAmount && contract.insuranceAmount.toLocaleString()
        )}

        {this.renderRow(
          'Salvage Amount',
          contract.salvageAmount && contract.salvageAmount.toLocaleString()
        )}
        {this.renderRow(
          'Salvage Percent',
          contract.salvagePercent && contract.salvagePercent.toLocaleString()
        )}
        {this.renderRow(
          'Salvage Tenor',
          contract.salvageTenor && contract.salvageTenor.toLocaleString()
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
