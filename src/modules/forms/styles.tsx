import { colors, dimensions } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const FlexRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  > label {
    font-weight: 500;
  }
`;

const FlexWrapper = styled.span`
  flex: 1;
`;

const Field = styledTS<{ isGreyBg?: boolean }>(styled.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 40%;
  height: 100px;
  float: left;
  background: ${props => (props.isGreyBg ? colors.bgLight : colors.colorWhite)};
  border: 1px solid ${colors.borderPrimary};
  border-radius: 2px;
  margin: 0 20px 20px 0px;
  padding: 20px;
  transition: all ease 0.5s;
  box-shadow: 0 5px 15px rgba(0,0,0,.08);

  > span {
    margin-top: 10px;
    color: #666;
  }

  &:hover {
    cursor: pointer;
    box-shadow: 0 10px 20px ${rgba(colors.colorCoreDarkGray, 0.12)}
  }
`;

const Options = styled.div`
  display: inline-block;
  width: 100%;
  margin-top: 10px;
`;

const LeftSection = styled.div`
  border-right: 1px solid ${colors.borderDarker};
  padding-right: ${dimensions.coreSpacing}px;
  width: 100%;
`;

const PreviewSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${dimensions.coreSpacing}px;
`;

const Preview = styled.div`
  width: 80%;
`;

const ShowPreview = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: ${dimensions.coreSpacing}px;
  color: ${colors.colorCoreGray};
  font-size: 14px;

  > i {
    margin-right: ${dimensions.unitSpacing}px;
  }
`;

export {
  Field,
  Options,
  Preview,
  ShowPreview,
  LeftSection,
  PreviewSection,
  FlexRow,
  FlexWrapper
};
