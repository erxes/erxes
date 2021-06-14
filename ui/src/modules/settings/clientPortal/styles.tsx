import colors from 'erxes-ui/lib/styles/colors';
import { FlexContent } from 'modules/layout/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const Domain = styled(FlexContent)`
  align-items: flex-end;

  span {
    font-size: 14px;
    font-weight: 500;
    flex: initial;
  }
`;

export const StyledUrl = styled.div`
  color: ${colors.colorCoreGray};
  font-weight: normal;
  font-size: 0.8rem;
`;

export const Circle = styledTS<{ active: boolean }>(styled.div)`
  display: inline-box;
  margin-right: 6px;
  background-color: ${props =>
    props.active ? colors.colorCoreGreen : 'white'};
  width: 14px;
  height: 14px;
  border-radius: 7px;
  border: 0.5px lightGray solid;
`;

export const Full = styled.div`
  width: 100%;
  display: flex;

  > div:first-child {
    padding-right: 20px;
  }
`;

export const Half = styled.div`
  width: 50%;
`;

export const SelectsWrap = styled.div`
  > div:first-child {
    padding-bottom: 10px;
  }
`;

export const ButtonWrap = styled.div`
  text-align: right;
`;

export const TitleWrap = styled.div`
  h2 {
    font-size: 15px;
  }
`;

export const CheckCircleWrap = styled.div`
display: flex;

>div:first-child{
    button{
      padding-left: 0px
    }
  }
div{
  button{
    padding-top: 10px
    display: flex;
    align-items: center;
  }
}
`;

export const ColorPickerWrap = styled.div`
  display: grid;
  width: 90%;
  grid-template-columns: 30% 30% 30% 30%;
  margin-top: 10px;
`;

export const Wrap = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px label {
    margin-right: 10px;
  }

  div {
    div {
      div:first-child {
        height: 17px;
        width: 43px;
      }

      div:nth-child(2) {
        height: 15px;
        width: 15px;
      }
    }
  }
`;
