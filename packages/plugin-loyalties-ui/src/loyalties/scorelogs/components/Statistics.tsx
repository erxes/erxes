import { colors, dimensions, Icon } from '@erxes/ui/src';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';

const StaticValue = styledTS(styled.div)`
    font-weight: 600;
    font-size: 16px;
`;

const MainDescription = styledTS<{
  $expand: boolean;
}>(styled.div)`
    width: 100%;
    padding: ${dimensions.coreSpacing}px ${dimensions.unitSpacing}px;
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    font-size: 12px;
    position: relative;
    cursor: pointer;
  
    ${(props) => css`
      height: ${props.$expand === false && '0px'};
    `}
  
    h4 {
      margin: 0;
      padding-bottom: ${(props) => (props.$expand ? '5px' : '0')};
      font-size: ${(props) => (props.$expand ? '18px' : '15px')};
      font-weight: 500;
    }
`;

const Card = styledTS(styled.div)`
    flex-grow: 1;
    height: 74px;
    background-color: ${colors.bgLight};
    border: 1px solid ${colors.bgGray};
    border-radius: 8px;
    padding: 12px 24px;
    margin-right: 23px;

    &:last-child {
        margin-right: 0;
    }
`;

const CardTitle = styledTS(styled.div)`
    display: flex;
    align-items: center;
    white-space: nowrap;
    gap: 8px;
`;

const CardContent = styledTS(styled.div)`
    display: flex;
    justify-content: space-between;
`;

const STATISTIC_MAP = {
  totalPointEarned: { label: 'Total Point Earned', icon: 'file-search-alt' },
  totalPointBalance: { label: 'Points Balance', icon: 'calender' },
  activeLoyaltyMembers: { label: 'Active Loyalty Members', icon: 'user' },
  redemptionRate: { label: 'Redemption Rates', icon: 'chart-line' },
  mostRedeemedProductCategory: {
    label: 'Top Redeemed Product Catalogy',
    icon: 'chart-line',
  },
  monthlyActiveUsers: { label: 'Mounthly Active Users', icon: 'user' },
};

type Props = {
  statistics: any;
};

const Statistics = ({ statistics }: Props) => {
  const [expand, setExpand] = useState<boolean>(false);

  const onClick = () => {
    if (Object.keys(statistics)?.length) {
      setExpand(!expand);
    }
  };

  const renderContent = () => {
    if (!expand) {
      return <h4>Score Statistics</h4>;
    }

    return (
      <>
        {Object.entries(statistics).map(([key, value]: any) => {
          if (!STATISTIC_MAP[key] || !value) return <></>;

          if (key === 'redemptionRate') {
            value = `${value.toFixed(1)} %`;
          }

          return (
            <Card key={key}>
              <CardTitle>
                <Icon icon={STATISTIC_MAP[key].icon} size={14} />
                {STATISTIC_MAP[key].label}
              </CardTitle>
              <CardContent>
                <StaticValue>{value}</StaticValue>
              </CardContent>
            </Card>
          );
        })}
      </>
    );
  };

  return (
    <MainDescription $expand={expand} onClick={onClick}>
      {renderContent()}
    </MainDescription>
  );
};

export default Statistics;
