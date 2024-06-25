import * as React from 'react';
import asyncComponent from '../../AsyncComponent';
import { iconClose } from '../../icons/Icons';

const Form = asyncComponent(
  () => import(/* webpackChunkName: "Form" */ '../containers/Form')
);

const Callout = asyncComponent(
  () => import(/* webpackChunkName: "FormCallout" */ '../containers/Callout')
);

const ShoutboxLauncher = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "FormShoutboxLauncher" */ '../containers/ShoutboxLauncher'
    )
);

type Props = {
  isFormVisible: boolean;
  isCalloutVisible: boolean;
  containerClass: string;
  closePopup: () => void;
  loadType: string;
};

const App = (props: Props) => {
  const {
    loadType,
    closePopup,
    isFormVisible,
    isCalloutVisible,
    containerClass,
  } = props;

  const renderCloseButton = () => {
    if (loadType === 'shoutbox') {
      return null;
    }

    return (
      <a className="close" onClick={closePopup} title="Close">
        {iconClose()} {/* Assuming iconClose() is defined elsewhere */}
      </a>
    );
  };

  const renderForm = () => {
    if (isFormVisible) {
      return <Form />;
    }

    return null;
  };

  const renderCallout = () => {
    if (isCalloutVisible) {
      return <Callout />;
    }

    return null;
  };

  const renderShoutboxLauncher = () => {
    if (loadType === 'shoutbox') {
      return <ShoutboxLauncher />;
    }

    return null;
  };

  return (
    <div id="erxes-container" className="erxes-content">
      <div className={containerClass}>
        {renderCloseButton()}
        {renderCallout()}
        {renderForm()}
        {renderShoutboxLauncher()}
      </div>
    </div>
  );
};

export default App;
