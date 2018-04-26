import styled from 'styled-components';
import { colors } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';

const RichEditorRoot = styled.div`
  font-size: 14px;

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

    .public-DraftEditor-content {
      font-size: 13px;
      min-height: 100px;
      padding: 15px 20px;
    }
  }

  .RichEditor-controls {
    float: left;
    font-size: 13px;
    user-select: none;
    margin-bottom: 5px;
  }
`;

const RichEditorControlsRoot = styled.div`
  overflow: hidden;
  padding: 7px 20px 0;
`;

const RichEditorControls = styled.div`
  float: left;
  font-size: 13px;
  user-select: none;
  margin-bottom: 5px;

  .RichEditor-styleButton {
    color: ${colors.colorCoreGray};
    cursor: pointer;
    margin-right: 16px;
    padding: 2px 0;
    display: inline-block;
    min-width: 10px;
    text-align: center;

    &:hover {
      color: ${rgba(colors.colorPrimary, 0.7)};
    }
  }

  .RichEditor-activeButton {
    color: ${colors.colorPrimary};
  }
`;

export { RichEditorRoot, RichEditorControlsRoot, RichEditorControls };
