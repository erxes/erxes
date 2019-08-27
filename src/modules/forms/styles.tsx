import { colors, dimensions } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { SelectWrapper } from '../common/components/form/styles';

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

const FieldItem = styledTS<{ selectType?: boolean; noPadding?: boolean }>(
  styled.div
)`
  padding: ${props => !props.noPadding && `0 ${dimensions.unitSpacing}px`};

  input,
  textarea,
  select {
    box-sizing: border-box;
    transition: all 0.3s ease-in-out;
    background: #faf9fb;
    border: 1px solid ${colors.colorShadowGray};
    border-radius: 5px !important;
    box-shadow: inset 0 1px 3px 0 rgba(0, 0, 0, 0.07);
    color: #1a1a1a;
    display: block;
    font-size: 14px;
    height: 36px;
    line-height: 1.42857143;
    margin-top: ${props => !props.selectType && `${dimensions.unitSpacing}px`};
    outline: 0;
    padding: 6px 15px;
    width: 100%;


    &:focus {
      border-color: ${colors.colorShadowGray};
      background: ${colors.colorWhite};
    }

    &:after {
      top: 22px;
    }
  }

  textarea {
    overflow: auto;
    height: auto;
  }

  .required {
    color: ${colors.colorCoreRed};
  }

  ${SelectWrapper} {
    margin-top: ${dimensions.unitSpacing}px;
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

const Title = styled.h4`
  font-size: 16px;
  margin-top: 40px;
  font-weight: 400;
`;

export {
  Field,
  FieldItem,
  Options,
  Preview,
  ShowPreview,
  LeftSection,
  PreviewSection,
  FlexRow,
  FlexWrapper,
  Title
};
