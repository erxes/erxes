import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const LabelWrapper = styled.div`
  padding: ${dimensions.coreSpacing}px;
`;

const ColorChooserWrapper = styled.div`
  .twitter-picker {
    box-shadow: none !important;

    > div:nth-child(3) {
      padding: 15px 0px 0px 0px !important;

      input {
        width: 75% !important;
      }
    }
  }
`;

const Title = styled.h3`
  margin: 0;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid ${colors.borderPrimary};
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
  background: ${colors.bgLight};
  font-size: 11px;
  text-transform: uppercase;
  color: ${colors.colorCoreGray};
  border-radius: 4px 4px 0 0;
  transition: all ease 0.3s;
  align-items: center;

  > i {
    cursor: pointer;
    font-size: 16px;
  }
`;

const ChooseColor = styled.div`
  width: 260px;
`;

const PipelineLabelList = styled.div`
  ul {
    padding: ${dimensions.unitSpacing * 1.5}px ${dimensions.unitSpacing + 2}px
      ${dimensions.unitSpacing / 2}px ${dimensions.coreSpacing}px;
  }

  li {
    color: ${colors.colorWhite};
    font-weight: 500;
    margin-bottom: 5px;
    border-radius: 4px;
    padding: 3px 30px 3px 10px !important;
    transition: all ease 0.3s;

    &:before {
      color: ${colors.colorWhite} !important;
      font-weight: 700;
      left: auto;
      right: 7px;
    }

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      opacity: 0.88;
    }
  }
`;

const Label = styledTS<{ color: string; timeout?: number }>(styled.div)`
  background-color: ${props => props.color && props.color};
  white-space: nowrap;
  overflow: hidden;
  float: left;
  min-width: 40px;
  text-overflow: ellipsis;
  max-width: 600px;
  margin: 0 5px 5px 0;
  color: ${colors.colorWhite};
  font-weight: 500;
  border-radius: 4px;
  line-height: 1.2em;
  padding: 4px 10px;

  &:last-child {
    margin: 0px;
  }

  &:hover {
    opacity: 1;
  }

  ${props =>
    props.timeout &&
    `
    line-height: 0;

    span {
      display: block;
    }

    .erxes-label-enter-done {
      text-indent: 0px;
      line-height: 1.2em;
      transition: all ${props.timeout}ms ease-in;
    }

    span,
    .erxes-label-exit-done {
      line-height: 0em;
      text-indent: -699px;
      transition: all ${props.timeout}ms ease-out;
    }`}
`;

const LabelList = styled.div`
  display: inline-block;

  &:hover {
    cursor: pointer;
  }
`;

const ChooseLabelWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const ButtonContainer = styled.div`
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px
    ${dimensions.unitSpacing * 1.5}px ${dimensions.coreSpacing}px;
`;

export {
  LabelWrapper,
  Title,
  Label,
  LabelList,
  ButtonContainer,
  ChooseColor,
  ChooseLabelWrapper,
  PipelineLabelList,
  ColorChooserWrapper
};
