import { colors, dimensions } from 'modules/common/styles';

import { Formgroup } from 'modules/common/components/form/styles';
import { rgba } from 'modules/common/styles/color';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const FlexContent = styled.div`
  display: flex;

  ${Formgroup} {
    margin-right: 20px;
  }
`;

const FlexRow = styled(FlexContent)`
  justify-content: space-between;

  > i {
    color: ${colors.colorCoreRed};
    margin-right: 5px;
  }
`;

const CenterFlexRow = styled(FlexRow)`
  align-items: center;

  > p {
    margin: 0;
  }
`;

const StatusBox = styledTS<{ largePadding?: boolean; largeMargin?: boolean }>(
  styled.div,
)`
  padding: ${(props) => (props.largePadding ? '36px 40px' : '20px')};
  background: ${colors.colorWhite};
  position: relative;
  margin-bottom: ${(props) => (props.largeMargin ? '20px' : '10px')};
  border-radius: 3px;
  box-shadow: 0 3px 3px 0 rgba(0, 0, 0, 0.1);

  input {
    width: 410px;
  }
  textarea {
    width: 100%;
  }
`;

const StatusTitle = styled.h4`
  margin: 0 0 ${dimensions.coreSpacing * 1.5}px 0;
  font-size: 24px;
  font-weight: normal;

  b {
    font-weight: bold;
    color: ${colors.colorPrimaryDark};
  }

  em {
    color: #6569df;
  }
`;

const ControlWrapper = styled.div`
  width: 100%;
  font-size: 14px;

  > div {
    padding: 0;
  }

  table {
    span {
      font-size: 12px;
    }

    .odd {
      font-weight: bold !important;
    }
  }
`;

const Domain = styled(FlexContent)`
  align-items: flex-end;

  span {
    font-size: 14px;
    font-weight: 500;
    flex: initial;

    > input {
      width: 330px;
    }
  }
`;

const UpgradeButtons = styled(FlexContent)`
  justify-content: flex-end;
  margin-top: ${dimensions.unitSpacing}px;
  margin-bottom: ${dimensions.unitSpacing}px;
`;

const InfoBox = styled(FlexContent)`
  border-radius: 10px;
  align-items: center;
  height: 72px;
  padding: 0 30px;
  font-size: 14px;
  background: ${rgba(colors.colorCoreBlue, 0.1)};
  justify-content: space-between;

  > span i {
    margin-right: 10px;
    font-size: 16px;
    color: ${colors.colorCoreBlue};
  }
`;

const ColorPickerWrapper = styled.div`
  > div > div {
    width: 92px;
    height: 92px;
  }
`;

const ClearButton = styled.span`
  cursor: pointer;
`;

export {
  FlexRow,
  StatusBox,
  StatusTitle,
  UpgradeButtons,
  ControlWrapper,
  Domain,
  FlexContent,
  InfoBox,
  ClearButton,
  ColorPickerWrapper,
  CenterFlexRow,
};
