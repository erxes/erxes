import '@nateradebaugh/react-datetime/css/react-datetime.css';
import * as React from "react";
import DumbApp from "../components/App";
import { AppConsumer, AppProvider } from "./AppContext";
import '../sass/style.min.css';

import * as dayjs from 'dayjs';
import * as localizedFormat from 'dayjs/plugin/localizedFormat';
import * as relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

type Props = {
  toggle: (isVisible?: boolean) => void;
  isMessengerVisible: boolean;
  saveBrowserInfo: () => void;
  showLauncher: boolean;
};

class App extends React.Component<Props> {
  componentDidMount() {
    window.addEventListener("message", event => {
      if (event.data.fromPublisher) {
        // receive show messenger command from publisher
        if (event.data.action === "showMessenger") {
          this.props.toggle(false);
        }
      }
    });
  }

  render() {
    return (
      <DumbApp
        isMessengerVisible={this.props.isMessengerVisible}
        saveBrowserInfo={this.props.saveBrowserInfo}
        showLauncher={this.props.showLauncher}
      />
    );
  }
}

const WithContext = () => (
  <AppProvider>
    <AppConsumer>
      {({ isMessengerVisible, saveBrowserInfo, getMessengerData, toggle }) => {
        return (
          <App
            toggle={toggle}
            isMessengerVisible={isMessengerVisible}
            saveBrowserInfo={saveBrowserInfo}
            showLauncher={getMessengerData().showLauncher}
          />
        );
      }}
    </AppConsumer>
  </AppProvider>
);

export default WithContext;
