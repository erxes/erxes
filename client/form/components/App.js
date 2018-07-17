import React from 'react';
import PropTypes from 'prop-types';
import { iconClose } from '../../icons/Icons';
import { Callout, Form, ShoutboxLauncher } from '../containers';

const propTypes = {
  isFormVisible: PropTypes.bool,
  isCalloutVisible: PropTypes.bool,
  containerClass:PropTypes.string,
  init: PropTypes.func,
  closePopup: PropTypes.func,
  setHeight: PropTypes.func,
  formData: PropTypes.object,
};

class App extends React.Component {
  componentDidMount() {
    this.props.init();
  }

  renderCloseButton() {
    const { formData, closePopup } = this.props;
    const { loadType } = formData;

    if (loadType === 'shoutbox') {
      return null;
    }

    return (
      <a className="close" onClick={closePopup} title="Close">
        {iconClose}
      </a>
    )
  }

  renderForm() {
    const { isFormVisible, setHeight } = this.props;

    if (isFormVisible) {
      return <Form setHeight={setHeight} />
    }

    return null;
  }

  renderCallout() {
    const { isCalloutVisible, formData, setHeight } = this.props;
    const { themeColor } = formData;

    if (isCalloutVisible) {
      return <Callout setHeight={setHeight} color={themeColor} formData={formData} />
    }

    return null;
  }

  renderShoutboxLauncher() {
    const { formData } = this.props;
    const { loadType, themeColor } = formData;

    if (loadType === 'shoutbox') {
      return <ShoutboxLauncher color={themeColor} />
    }

    return null;
  }

  render() {
    const { containerClass } = this.props;

    return (
      <div id="erxes-container">
        <div className={containerClass}>
          {this.renderCloseButton()}
          {this.renderCallout()}
          {this.renderForm()}
          {this.renderShoutboxLauncher()}
        </div>
      </div>
    )
  }
}

App.propTypes = propTypes;

export default App;
