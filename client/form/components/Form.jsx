import React from 'react';
import PropTypes from 'prop-types';
import Field from './Field';
import { TopBar } from './';
import { SUCCESS, INITIAL } from '../constants';

export default class Form extends React.Component {
  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    this.onFieldValueChange = this.onFieldValueChange.bind(this);

    this.state = { doc: this.resetDocState() };
  }

  componentWillUpdate(nextProps) {
    const currentStatus = this.props.currentStatus.status;
    const nextStatus = nextProps.currentStatus.status;

    // after successfull save and create new button, reset doc state
    if ((currentStatus !== nextStatus) && nextStatus === INITIAL) {
      this.setState({ doc: this.resetDocState() });
    }
  }

  // after any field value change, save it's value to state
  onFieldValueChange({ fieldId, value }) {
    const doc = this.state.doc;

    doc[fieldId].value = value;

    this.setState({ doc });
  }

  onSubmit() {
    this.props.onSubmit(this.state.doc);
  }

  resetDocState() {
    const doc = {};

    this.props.form.fields.forEach((field) => {
      doc[field._id] = {
        text: field.text,
        type: field.type,
        validation: field.validation,
        value: '',
      };
    });

    return doc;
  }

  renderFields() {
    const { form, currentStatus } = this.props;
    const fields = form.fields;
    const errors = currentStatus.errors || [];

    return fields.map((field) => {
      const fieldError = errors.find(error => error.fieldId === field._id);

      return (
        <Field
          key={field._id}
          field={field}
          error={fieldError}
          onChange={this.onFieldValueChange}
        />
      );
    });
  }

  renderForm(color) {
    const { __ } = this.context;
    const { form, integrationName } = this.props;

    return (
      <div className="erxes-form">
        <TopBar title={form.title || integrationName} color={color} />
        <div className="erxes-form-content">
          <div className="erxes-description">{form.description}</div>
          {this.renderFields()}

          <button
            style={{ background: color }}
            type="button"
            onClick={this.onSubmit}
            className="btn btn-block"
          >
            {form.buttonText || __('Send')}
          </button>
        </div>
      </div>
    );
  }

  renderSuccessForm(thankContent, color) {
    const { integrationName, onCreateNew } = this.props;
    const { __ } = this.context;

    return (
      <div className="erxes-form">
        <TopBar title={integrationName} color={color} />
        <div className="erxes-form-content">
          <div className="erxes-result">
            <span>
              {
                __(thankContent) ||
                __('Thanks for your message. We will respond as soon as we can.')
              }
            </span>
            <button style={{ background: color }} className="btn" onClick={onCreateNew}>{__('Create new')}</button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { form, currentStatus, sendEmail, formConfig } = this.props;
    const color = form.themeColor || '';

    if (currentStatus.status === SUCCESS) {
      const {
        successAction,
        redirectUrl,
        fromEmail,
        userEmailTitle,
        userEmailContent,
        adminEmails,
        adminEmailTitle,
        adminEmailContent,
        thankContent,
      } = formConfig;

      // redirect to some url
      if (successAction === 'redirect') {
        window.open(redirectUrl);
      }

      // send email to user and admins
      if (successAction === 'email') {
        const emailField = form.fields.find(f => f.validation === 'email');

        if (emailField) {
          const email = this.state.doc[emailField._id].value;

          // send email to user
          sendEmail([email], fromEmail, userEmailTitle, userEmailContent);

          // send email to admins
          sendEmail([adminEmails], fromEmail, adminEmailTitle, adminEmailContent);
        }
      }

      return this.renderSuccessForm(thankContent, color);
    }

    return this.renderForm(color);
  }
}

Form.propTypes = {
  integrationName: PropTypes.string,

  formConfig: PropTypes.shape({
    successAction: PropTypes.string,
    thankContent: PropTypes.string,
  }),

  form: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    buttonText: PropTypes.string,
    themeColor: PropTypes.string,
    featuredImage: PropTypes.string,

    fields: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string.isRequired,
      type: PropTypes.string,
      check: PropTypes.string,
      text: PropTypes.string,
      description: PropTypes.string,
      options: PropTypes.arrayOf(PropTypes.string),
      isRequired: PropTypes.bool,
      order: PropTypes.number,
      validation: PropTypes.string,
    })),
  }),

  currentStatus: PropTypes.shape({
    status: PropTypes.string,
  }),

  onSubmit: PropTypes.func,
  onCreateNew: PropTypes.func,
  sendEmail: PropTypes.func,
};

Form.contextTypes = {
  __: PropTypes.func
};
