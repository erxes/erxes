import * as React from 'react';
import asyncComponent from '../../AsyncComponent';
import { iconClose } from '../../icons/Icons';
import { ICurrentStatus, IForm, IFormDoc } from '../types';
import { IEmailParams, IIntegration } from '../../types';

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
  isSubmitting?: boolean;
  currentStatus: ICurrentStatus;
  save: (
    doc: IFormDoc,
    formCode?: string,
    requiredPaymentAmount?: number
  ) => void;
  setHeight: () => void;
  createNew: () => void;
  sendEmail: (params: IEmailParams) => void;
  extraContent?: string;
  callSubmit: boolean;
  invoiceLink?: string;
  getIntegration: () => IIntegration;
  getForm: () => IForm;
};

class App extends React.Component<Props> {
  renderCloseButton() {
    const { loadType, closePopup } = this.props;

    if (loadType === 'shoutbox') {
      return null;
    }

    return (
      <a className="close" onClick={closePopup} title="Close">
        {iconClose()}
      </a>
    );
  }

  renderForm() {
    const {
      isFormVisible,
      isSubmitting,
      currentStatus,
      save,
      createNew,
      sendEmail,
      setHeight,
      extraContent,
      callSubmit,
      invoiceLink,
      getIntegration,
      getForm,
    } = this.props;

    if (isFormVisible) {
      return (
        <Form
          isSubmitting={isSubmitting}
          currentStatus={currentStatus}
          onSubmit={save}
          onCreateNew={createNew}
          sendEmail={sendEmail}
          setHeight={setHeight}
          extraContent={extraContent}
          callSubmit={callSubmit}
          invoiceLink={invoiceLink}
          getIntegration={getIntegration}
          getForm={getForm}
        />
      );
    }

    return null;
  }

  renderCallout() {
    const { isCalloutVisible } = this.props;

    if (isCalloutVisible) {
      return <Callout />;
    }

    return null;
  }

  renderShoutboxLauncher() {
    const { loadType } = this.props;

    if (loadType === 'shoutbox') {
      return <ShoutboxLauncher />;
    }

    return null;
  }

  render() {
    const { containerClass } = this.props;

    return (
      <div id="erxes-container" className="erxes-content">
        <div className={containerClass}>
          {this.renderCloseButton()}
          {this.renderCallout()}
          {this.renderForm()}
          {this.renderShoutboxLauncher()}
        </div>
      </div>
    );
  }
}

export default App;
