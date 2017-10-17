import { injectGlobal } from 'styled-components';
import 'ionicons/css/ionicons.min.css';
import { typography, colors } from './';

injectGlobal`
  html {
    height: 100%;
  }

  body {
		font-family: 'Montserrat', 'Helvetica Neue', 'Helvetica', 'Arial',  sans-serif;
    margin: 0;
    font-size: ${typography.fontSizeBody}px;
    line-height: ${typography.lineHeightBody};
    color: ${colors.textPrimary};
    height: 100%;
    background: ${colors.bgMain};

    > div {
      height: 100%;
    }
  }
`;
