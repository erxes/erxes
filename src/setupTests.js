import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import WebSocket from 'ws';

// no WebSocket implementation on node environment
Object.assign(global, { WebSocket });

configure({ adapter: new Adapter() });
