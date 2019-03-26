import { colors } from 'modules/common/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const RichEditorRoot = styledTS<{ bordered: boolean }>(styled.div)`
  font-size: 14px;
  position: relative;
  padding-top: 36px;
  border: ${props => props.bordered && `1px solid ${colors.borderDarker}`};
  margin-top: ${props => props.bordered && '10px'};

  .RichEditor-editor {
    border-top: 1px solid ${colors.borderPrimary};
    cursor: text;

    .public-DraftEditorPlaceholder-root {
      padding: 15px 20px;
      position: absolute;
      color: ${colors.colorCoreGray};
      font-size: 13px;
    }

    .public-DraftEditorPlaceholder-inner {
      color: ${colors.colorCoreLightGray};
    }

    blockquote {
      border-left: 5px solid #DEE4E7;
      color: #888;
      font-style: italic;
      padding: 10px 20px;
    }

    .public-DraftEditor-content {
      font-size: 13px;
      min-height: ${props => (props.bordered ? '180px' : '100px')};
      padding: 15px 20px;

      a {
        text-decoration: underline;
      }
    }
  }  
`;

const RichEditorControlsRoot = styled.div`
  overflow: hidden;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  padding: 0 7px;
  background: ${colors.colorWhite};

  > div {
    box-shadow: none;
    background: none;
    border: 0;
    border-radius: 0;

    input {
      width: 100%;
      height: 36px;
      font-size: 14px;
    }

    button {
      color: ${colors.colorCoreGray};
      height: 36px;
      width: 36px;
      padding: 0;
      background: none;
      font-size: 16px;
      font-weight: 500;
      transition: background 0.3s ease;

      &:hover {
        cursor: pointer;
      }

      svg {
        height: 36px;
        width: 18px;
      }
    }
  }

  select {
    background: none;
    border: none;
    height: 36px;
    outline: 0;
    color: ${colors.colorCoreGray};
    display: inline-block;
    vertical-align: top;
  }
`;

export { RichEditorRoot, RichEditorControlsRoot };
