import { colors, dimensions } from '@erxes/ui/src/styles';

import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const CallWrapper = styled.div`
  border: 1px solid ${colors.borderPrimary};
  border-radius: 20px 20px 20px 0;
  padding: ${dimensions.unitSpacing}px;
  width: 320px;
  background: ${colors.colorWhite};

  > div {
    h5 {
      margin: 0;
    }

    span {
      color: ${colors.colorCoreGray};
      text-transform: capitalize;
    }
  }
`;

const StatusIcon = styledTS<{ type?: string }>(styled.div)`
  width: 40px;
  height: 40px;
  border-radius: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) =>
    props.type === 'missed' || props.type === 'cancelled'
      ? colors.colorCoreRed
      : colors.colorSecondary};
  color: ${colors.colorWhite};
  flex-shrink: 0;
  margin-right: ${dimensions.unitSpacing}px;
`;

const StatusContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  > div {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
`;

const Audio = styled.div`
  flex: 1;

  audio {
    margin-top: ${dimensions.unitSpacing}px;
    height: 35px;
  }

  span {
    font-size: 11px;
    display: block;
    margin: 10px 0 5px 0;
  }
`;

const Download = styled.a`
  color: ${colors.textPrimary};
`;

export { CallWrapper, StatusIcon, Audio, StatusContent, Download };
