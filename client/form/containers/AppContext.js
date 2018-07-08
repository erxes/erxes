import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import client from '../../apollo-client';
import { connection } from '../connection';

const AppContext = React.createContext();

export const AppConsumer = AppContext.Consumer;

export class AppProvider extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isPopupVisible: false,
      isFormVisible: false,
      isCalloutVisible: false,
      currentStatus: { status: 'INITIAL' },
    }

    this.init = this.init.bind(this);
    this.showForm = this.showForm.bind(this);
    this.toggleShoutbox = this.toggleShoutbox.bind(this);
    this.showPopup = this.showPopup.bind(this);
    this.closePopup = this.closePopup.bind(this);
    this.saveForm = this.saveForm.bind(this);
    this.createNew = this.createNew.bind(this);
    this.sendEmail = this.sendEmail.bind(this);
  }

  /*
   * Decide which component will render initially
   */
  init() {
    const { data, hasPopupHandlers } = connection;
    const { formData } = data;
    const { loadType, callout } = formData;

    // if there is popup handler then do not show it initially
    if (loadType === 'popup' && hasPopupHandlers) {
      return null;
    }

    this.setState({ isPopupVisible: true });

    // if there is no callout setting then show form
    if (!callout) {
      return this.setState({ isFormVisible: true });
    }

    // If load type is shoutbox then hide form component initially
    if (callout.skip && loadType !== 'shoutbox') {
      return this.setState({ isFormVisible: true });
    }

    return this.setState({ isCalloutVisible: true });
  }

  /*
   * Will be called when user click callout's submit button
   */
  showForm() {
    this.setState({
      isCalloutVisible: false,
      isFormVisible: true,
    })
  }

  /*
   * Toggle circle button. Hide callout and show or hide form
   */
  toggleShoutbox(isVisible) {
    if(!isVisible) {
      // Increasing view count
      client.mutate({
        mutation: gql`
          mutation formIncreaseViewCount($formId: String!) {
            formIncreaseViewCount(formId: $formId)
          }`,

        variables: {
          formId: connection.data.formId,
        },
      });
    }

    this.setState({
      isCalloutVisible: false,
      isFormVisible: !isVisible
    });
  }

  /*
   * When load type is popup, Show popup and show one of callout and form
   */
  showPopup() {
    const { data } = connection;
    const { formData } = data;
    const { callout } = formData;

    this.setState({ isPopupVisible: true });

    // if there is no callout setting then show form
    if (!callout) {
      return this.setState({ isFormVisible: true });
    }

    if (callout.skip) {
      return this.setState({ isFormVisible: true });
    }

    return this.setState({ isCalloutVisible: true });
  }

  /*
   * When load type is popup, Hide popup
   */
  closePopup() {
    this.setState({
      isPopupVisible: false,
      isCalloutVisible: false,
      isFormVisible: false,
    })

    // Increasing view count
    client.mutate({
      mutation: gql`
        mutation formIncreaseViewCount($formId: String!) {
          formIncreaseViewCount(formId: $formId)
        }`,

      variables: {
        formId: connection.data.formId,
      },
    });
  }

  /*
   * Save user submissions
   */
  saveForm(doc) {
    const submissions = Object.keys(doc).map((fieldId) => {
      const { value, text, type, validation } = doc[fieldId];

      return {
        _id: fieldId,
        type,
        text,
        value,
        validation,
      };
    });

    client.mutate({
      mutation: gql`
        mutation saveForm($integrationId: String!, $formId: String!,
          $submissions: [FieldValueInput], $browserInfo: JSON!) {
          saveForm(integrationId: $integrationId, formId: $formId,
            submissions: $submissions, browserInfo: $browserInfo) {
              status
              messageId
              errors {
                fieldId
                code
                text
              }
          }
        }`,

      variables: {
        integrationId: connection.data.integrationId,
        formId: connection.data.formId,
        browserInfo: connection.browserInfo,
        submissions,
      },
    })

    .then(({ data }) => {
      const { status, errors } = data.saveForm;

      this.setState({
        currentStatus: {
          status: status === 'ok' ? 'SUCCESS' : 'ERROR',
          errors,
        }
      });
    });
  }

  /*
   * Redisplay form component after submission
   */
  createNew() {
    this.setState({ currentStatus: { status: 'INITIAL' }});
  }

  /*
   * Send email to submitted user after successfull submission
   */
  sendEmail(toEmails, fromEmail, title, content) {
    client.mutate({
      mutation: gql`
        mutation sendEmail($toEmails: [String], $fromEmail: String,
          $title: String, $content: String) {
          sendEmail(toEmails: $toEmails, fromEmail: $fromEmail,
            title: $title, content: $content)
        }`,

      variables: {
        toEmails,
        fromEmail,
        title,
        content,
      },
    });
  }

  render() {
    return (
      <AppContext.Provider
        value={{
          ...this.state,
          init: this.init,
          showForm: this.showForm,
          toggleShoutbox: this.toggleShoutbox,
          showPopup: this.showPopup,
          closePopup: this.closePopup,
          saveForm: this.saveForm,
          createNew: this.createNew,
          sendEmail: this.sendEmail,
        }}
      >
        {this.props.children}
      </AppContext.Provider>
    )
  }
}

AppProvider.propTypes = {
  children: PropTypes.object,
}
