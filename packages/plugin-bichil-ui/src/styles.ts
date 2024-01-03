import { SimpleButton } from '@erxes/ui/src/styles/main';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const FileUpload = styled.div`
  input {
    display: none;
  }
`;

export const CustomRangeContainer = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
  display: flex;
  align-items: flex-end;
  > div {
    flex: 1;
    margin-right: 8px;
    input[type='text'] {
      border: none;
      width: 100%;
      height: 34px;
      padding: 5px 0;
      color: #444;
      border-bottom: 1px solid;
      border-color: #ddd;
      background: none;
      border-radius: 0;
      box-shadow: none;
      font-size: 13px;
    }
  }
`;

export const TimeclockInfo = styledTS<{
  activeShift?: boolean;
  color?: string;
  disabled?: boolean;
}>(styled.div)`
  width: ${props => (props.activeShift ? '92px' : 'max-content')};
  border: 2px solid ${props =>
    props.activeShift ? 'rgba(255,88,87,0.2)' : 'rgba(0, 177, 78, 0.1)'};
  border-radius: 20px;
  padding: 6px;
  margin: 5px auto;
  background-color: ${props =>
    props.color
      ? props.color
      : props.activeShift
      ? 'rgba(255,88,87,0.2)'
      : 'rgba(0, 177, 78, 0.1)'};

  pointer-events: ${props => (props.disabled ? 'none' : '')}
  opacity: ${props => (props.disabled ? '0.7' : '1')};
  cursor: pointer;
`;

export const RequestInfo = styledTS<{
  backgroundColor: string;
  borderColor?: string;
  textColor?: string;
  hoverContent?: string;
}>(styled.div)`
  width: 92px;
  overflow:hidden; 
  white-space:nowrap; 
  text-overflow: ellipsis;
  border: 2px solid ${props =>
    props.borderColor ? props.borderColor : props.backgroundColor};
  border-radius: 20px;
  padding: 6px;
  margin: 5px auto;
  background-color:${props => props.backgroundColor};
  color: white;
`;

export const BorderedTd = styled.td`
  background-color: white;
  border: 2px solid #eeeeee;
  text-align: center;
`;

export const ColorCorneredTd = styledTS<{ cornerColor: string }>(styled.td)`
  width: max-content;

  position: relative;
  padding: 5px;
  text-align: center;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 10px; /* Adjust the size of the colored corner */
    height: 10px; /* Adjust the size of the colored corner */
    background-color: ${props => props.cornerColor}; 
  }
`;

export const FlexCenter = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

export const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const FlexRowLeft = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const FlexRowEven = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 15px
  justify-content: space-evenly;
`;

export const ToggleButton = styled(SimpleButton)`
  margin-left: -5px;
  margin-right: 10px;
`;

export const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ColoredSquare = styledTS<{ color: string }>(styled.div)`
  width: 10px; /* Adjust the size of the colored corner */
  max-width:10px;
  height: 10px; /* Adjust the size of the colored corner */
  max-height:10px;
  background-color: ${props => props.color}; 
  }
`;

export const TimeclockTableWrapper = styled.div`
  .fixed-column {
    position: sticky;
    left: 0;
    background: #fff;
    z-index: 99;
  }
`;
