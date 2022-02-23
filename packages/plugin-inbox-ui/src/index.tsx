import App from './App';
import '@erxes/ui/src/styles/global-styles.ts';
import 'erxes-icon/css/erxes.min.css';
import '@erxes/ui/src/styles/style.min.css';
import '@nateradebaugh/react-datetime/css/react-datetime.css';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

export default App;
