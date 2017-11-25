import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';

const EditorActions = styled.div`
  padding: 0 20px 10px 20px;
  text-align: left;
  position: relative;
  color: ${colors.colorCoreGray};
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-grow: 1;

  i {
    margin: 0;
  }

  button {
    float: left;
    display: block;
    margin-top: 10px;
  }

  hr {
    position: absolute;
    top: 0;
    margin: 0 auto;
  }
`;

const EditorWrapper = styled.div`
  textarea {
    border-bottom: none;
    box-sizing: border-box;
    padding-left: ${dimensions.coreSpacing}px;
  }
`;

export { EditorActions, EditorWrapper };
