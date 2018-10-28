import * as React from "react";
import { Field } from "../../../form/components";
import { IEmailParams, IIntegration } from "../../../types";
import { __ } from "../../../utils";
import { FieldValue, ICurrentStatus, IFieldError, IForm } from "../../types";

type Props = {
  form: IForm;
  integration: IIntegration;
  currentStatus: ICurrentStatus;
  onSubmit: (e: React.FormEvent<HTMLButtonElement>) => void;
  onCreateNew: () => void;
  sendEmail: (params: IEmailParams) => void;
};

type State = {
  doc: any;
};

export default class Form extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { doc: this.resetDocState() };
  }

  componentWillUpdate(nextProps: Props) {
    const currentStatus = this.props.currentStatus.status;
    const nextStatus = nextProps.currentStatus.status;

    // after successfull save and create new button, reset doc state
    if (currentStatus !== nextStatus && nextStatus === "INITIAL") {
      this.setState({ doc: this.resetDocState() });
    }
  }

  // after any field value change, save it's value to state
  onFieldValueChange = ({
    fieldId,
    value
  }: {
    fieldId: string;
    value: FieldValue;
  }) => {
    const doc = this.state.doc;

    doc[fieldId].value = value;

    this.setState({ doc });
  };

  onSubmit = () => {
    this.props.onSubmit(this.state.doc);
  };

  resetDocState() {
    const { form } = this.props;
    const doc: any = {};

    form.fields.forEach(field => {
      doc[field._id] = {
        text: field.text,
        type: field.type,
        validation: field.validation,
        value: ""
      };
    });

    return doc;
  }

  renderFields() {
    const { form, currentStatus } = this.props;
    const { fields } = form;
    const errors = currentStatus.errors || [];

    return fields.map(field => {
      const fieldError = errors.find(
        (error: IFieldError) => error.fieldId === field._id
      );

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

  renderForm() {
    const { form, integration } = this.props;

    return (
      <>
        <h4>{form.title || integration.name}</h4>
        <div className="erxes-form">
          <div className="erxes-form-content">
            <div className="erxes-description">{form.description}</div>
            {this.renderFields()}

            <button
              type="button"
              onClick={this.onSubmit}
              className="erxes-button btn-block"
            >
              {form.buttonText || __("Send")}
            </button>
          </div>
        </div>
      </>
    );
  }

  renderSuccessForm(thankContent?: string) {
    const { integration, form, onCreateNew } = this.props;

    return (
      <>
        <h4>{form.title || integration.name}</h4>
        <div className="erxes-form">
          <div className="erxes-form-content">
            <div className="erxes-result">
              <span>
                {thankContent ||
                  __(
                    "Thanks for your message. We will respond as soon as we can."
                  )}
              </span>
              <button className="erxes-button btn-block" onClick={onCreateNew}>
                {__("Create new")}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  render() {
    const { form, currentStatus, sendEmail, integration } = this.props;

    if (currentStatus.status === "SUCCESS") {
      const {
        successAction,
        redirectUrl,
        fromEmail,
        userEmailTitle,
        userEmailContent,
        adminEmails,
        adminEmailTitle,
        adminEmailContent,
        thankContent
      } = integration.formData;

      // redirect to some url
      if (successAction === "redirect") {
        window.open(redirectUrl);
      }

      // send email to user and admins
      if (successAction === "email") {
        const emailField = form.fields.find(f => f.validation === "email");

        if (emailField) {
          const email = this.state.doc[emailField._id].value;

          // send email to user
          if (email && fromEmail && userEmailTitle && userEmailContent) {
            sendEmail({
              toEmails: [email],
              fromEmail,
              title: userEmailTitle,
              content: userEmailContent
            });
          }

          // send email to admins
          if (
            adminEmails &&
            fromEmail &&
            adminEmailTitle &&
            adminEmailContent
          ) {
            sendEmail({
              toEmails: adminEmails.split(","),
              fromEmail,
              title: adminEmailTitle,
              content: adminEmailContent
            });
          }
        }
      }

      return this.renderSuccessForm(thankContent);
    }

    return this.renderForm();
  }
}
