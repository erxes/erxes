import widgetConnect from '../widgetConnect';
import { App } from './containers';
import { connect, connection } from './connection';
import reducers from './reducers';
import './sass/style.scss';

// window.addEventListener('message', (event) => {
//   if (!(event.data.fromPublisher && event.data.setting)) {
//     return;
//   }
//
//   connection.data.topicId = event.data.setting.topic_id;
//   // notify parent window that connected
//   // window.parent.postMessage({
//   //   fromErxes: true,
//   //   fromKnowledgeBase: true,
//   //   action: 'connected',
//   //   connectionInfo: data,
//   //   setting: event.data.setting,
//   // }, '*');
//
//   ReactDOM.render(
//     <ApolloProvider store={createStore(reducers)} client={client}>
//       <App />
//     </ApolloProvider>,
//     document.getElementById('root'),
//   );
// });

widgetConnect({
  connectMutation: (event) => {
    const setting = event.data.setting;

    connection.setting = event.data.setting;

    // call connect mutation
    return connect({
      topicId: setting.topic_id,
      data: setting.data,
      browserInfo: setting.browserInfo,
    });
  },

  connectCallback: (data) => {
    // connection.data.topicId = data.setting.topic_id;
  },

  AppContainer: App,

  reducers,
});
