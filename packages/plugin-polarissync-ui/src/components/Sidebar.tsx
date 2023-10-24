import Box from '@erxes/ui/src/components/Box';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Icon from '@erxes/ui/src/components/Icon';
import {
  FieldStyle,
  SectionBodyItem,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import { __, isValidDate } from '@erxes/ui/src/utils/core';
import React from 'react';
import dayjs from 'dayjs';

export type Props = {
  polarisData?: any;
  updateData: () => void;
};

export default function Component(props: Props) {
  const { polarisData } = props;

  const reload = (
    <a
      href="#refresh"
      onClick={() => {
        props.updateData();
      }}
      tabIndex={0}
    >
      <Icon icon="refresh" size={8} />
    </a>
  );

  const keys = [
    'customer_code',
    'register_number',
    'phone_number',
    'lastname',
    'firstname',
    'birth_date',
    'email',
    'facebook',
    'emergency_contact_phone_number'
  ];

  const renderBody = () => {
    if (!polarisData || !polarisData.data) {
      return <EmptyState icon="piggybank" text="No data" />;
    }

    const renderCustomValue = (value: string) => {
      if (isValidDate(value)) {
        return dayjs(value).format('lll');
      }

      return value;
    };

    return (
      <SectionBodyItem>
        <SidebarList className="no-link">
          {keys.map((key, index) => (
            <li key={index}>
              <FieldStyle>{key.replace(/_/g, ' ')}</FieldStyle>
              <SidebarCounter>
                {renderCustomValue(polarisData.data[key])}
              </SidebarCounter>
            </li>
          ))}
          <li>
            <FieldStyle>{__('Last updated:')}</FieldStyle>
            <SidebarCounter>
              {dayjs(polarisData.updatedAt).format('lll')}
            </SidebarCounter>
          </li>
        </SidebarList>
      </SectionBodyItem>
    );
  };

  const renderLoanInfo = () => {
    if (!polarisData || !polarisData.data) {
      return <EmptyState icon="piggybank" text="No data" />;
    }
    type loan = {
      product_name: string;
      adv_amount: string;
      balance: string;
    };
    const loanData: loan[] = polarisData.data.loan_info;

    return (
      <SectionBodyItem>
        <SidebarList className="no-link">
          {loanData.map((data, index) => (
            <>
              <div
                key={index}
                style={{
                  backgroundColor: '#f0f0f0',
                  borderRadius: '8px',
                  margin: '5px'
                }}
              >
                <li>
                  <FieldStyle>{__('Product')}</FieldStyle>
                  <SidebarCounter>{data.product_name}</SidebarCounter>
                </li>

                <li>
                  <FieldStyle>{__('Advance amount')}</FieldStyle>
                  <SidebarCounter>
                    {Number(data.adv_amount || 0).toLocaleString()}
                  </SidebarCounter>
                </li>
                <li>
                  <FieldStyle>{__('Balance')}</FieldStyle>
                  <SidebarCounter>
                    {Number(data.balance || 0).toLocaleString()}
                  </SidebarCounter>
                </li>
              </div>
            </>
          ))}
        </SidebarList>
      </SectionBodyItem>
    );
  };

  const renderOthers = (type: string) => {
    if (!polarisData || !polarisData.data) {
      return <EmptyState icon="piggybank" text="No data" />;
    }
    type dataType = {
      name: string;
      balance: string;
    };

    let info: dataType[] = polarisData.data.saving_info || [];

    if (type === 'investment') {
      info = polarisData.data.investment_info || [];
    }

    return (
      <SectionBodyItem>
        <SidebarList className="no-link">
          {info.map((data, index) => (
            <>
              <div
                key={index}
                style={{
                  backgroundColor: '#f0f0f0',
                  borderRadius: '8px',
                  margin: '5px'
                }}
              >
                <li>
                  <FieldStyle>{__('Name')}</FieldStyle>
                  <SidebarCounter>{data.name}</SidebarCounter>
                </li>
                <li>
                  <FieldStyle>{__('Balance')}</FieldStyle>
                  <SidebarCounter>
                    {Number(data.balance || 0).toLocaleString()}
                  </SidebarCounter>
                </li>
              </div>
            </>
          ))}
        </SidebarList>
      </SectionBodyItem>
    );
  };

  return (
    <>
      <Box
        title={__('Polaris Customer info')}
        extraButtons={reload}
        isOpen={true}
        name="account"
      >
        {renderBody()}
      </Box>
      <Box
        title={__('Polaris Loan info')}
        extraButtons={reload}
        isOpen={true}
        name="loan"
      >
        {renderLoanInfo()}
      </Box>
      <Box
        title={__('Polaris Saving info')}
        extraButtons={reload}
        isOpen={true}
        name="saving"
      >
        {renderOthers('saving')}
      </Box>
      <Box
        title={__('Polaris Investment info')}
        extraButtons={reload}
        isOpen={true}
        name="investment"
      >
        {renderOthers('investment')}
      </Box>
    </>
  );
}
