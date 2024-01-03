import colors from '@erxes/ui/src/styles/colors';
import dimensions from '@erxes/ui/src/styles/dimensions';
import styled from 'styled-components';

const SettingsContent = styled.div`
  padding: 30px;
`;

const QpaySectionStyle = styled.div`
  padding: 0px 10px;
`;

const QpayButtonStyle = styled.div`
  padding: 5px 35%;
`;

const QpayImageStyle = styled.div`
  padding: 0px 5%;
`;

export const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: ${dimensions.coreSpacing}px;

  > div {
    margin: 0 ${dimensions.unitSpacing}px;
  }

  > span {
    font-weight: 500;

    &.active {
      color: ${colors.colorCoreGray};
    }
  }
`;

export { SettingsContent, QpaySectionStyle, QpayButtonStyle, QpayImageStyle };
