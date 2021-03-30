import * as React from 'react';
import { AppConsumer } from '../../messenger/containers/AppContext';
import { IEmailParams, IIntegration } from '../../types';
import { __, checkLogicFulfilled, fixErrorMessage, LogicParams } from '../../utils';
import { connection } from '../connection';
import {
  FieldValue,
  ICurrentStatus,
  IFieldError,
  IForm,
  IFormDoc
} from '../types';
import { TopBar } from './';
import Field from './Field';

type Props = {
  form: IForm;
  integration: IIntegration;
  currentStatus: ICurrentStatus;
  callSubmit?: boolean;
  onSubmit: (doc: IFormDoc) => void;
  onCreateNew: () => void;
  sendEmail: (params: IEmailParams) => void;
  setHeight?: () => void;
  hasTopBar: boolean;
  isSubmitting?: boolean;
  color?: string;
  extraContent?: string;
};

type State = {
  doc: IFormDoc;
};

class Form extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { doc: this.resetDocState() };
  }

  componentDidMount() {
    if (this.props.setHeight) {
      this.props.setHeight();
    }
  }

  componentDidUpdate() {
    if (this.props.setHeight) {
      this.props.setHeight();
    }
  }

  componentWillUpdate(nextProps: Props) {
    const currentStatus = this.props.currentStatus.status;
    const nextStatus = nextProps.currentStatus.status;

    // after successfull save and create new button, reset doc state
    if (currentStatus !== nextStatus && nextStatus === 'INITIAL') {
      this.setState({ doc: this.resetDocState() });
    }

    if (!this.props.callSubmit && nextProps.callSubmit) {
      this.onSubmit();
    }
  }

  // after any field value change, save it's value to state
  onFieldValueChange = ({
    fieldId,
    value,
    associatedFieldId,
    groupId
  }: {
    fieldId: string;
    value: FieldValue;
    associatedFieldId?: string;
    groupId?: string;
  }) => {
    const doc = this.state.doc;

    if (doc[fieldId].validation === 'multiSelect') {
      value = value.toString();
    }

    doc[fieldId].value = value;

    if (associatedFieldId) {
      doc[fieldId].associatedFieldId = associatedFieldId;
    }

    if (groupId) {
      doc[fieldId].groupId = groupId;
    }

    this.setState({ doc });
  };

  onSubmit = () => {
    this.props.onSubmit(this.state.doc);
  };

  resetDocState() {
    const { form } = this.props;
    const doc: any = {};

    form.fields.forEach(field => {

      let isHidden = false;
      if (field.logicAction && field.logicAction === 'show' && field.logics && field.logics.length > 0) {
        isHidden = true;
      }

      doc[field._id] = {
        text: field.text,
        type: field.type,
        validation: field.validation,
        value: '',
        isHidden
      };
    });

    return doc;
  }

  hideField(id: string) {
    const { doc } = this.state;
    if (doc[id].value !== '') {
      doc[id].value = '';
      doc[id].isHidden = true;
      this.setState({ doc });
    }
  }

  showField(id: string) {
    const { doc } = this.state;

    if (doc[id].isHidden) {
      doc[id].value = '';
      doc[id].isHidden = false;
      this.setState({ doc });
    }
  }

  renderHead(title: string) {
    const { hasTopBar, color = '' } = this.props;

    if (hasTopBar) {
      return <TopBar title={title} color={color} />;
    }

    return <h4>{title}</h4>;
  }

  renderFields() {
    const { form, currentStatus } = this.props;
    const { fields } = form;

    const errors = currentStatus.errors || [];
    const nonFieldError = errors.find(error => !error.fieldId);

    const renderedFields = fields.map(field => {
      const fieldError = errors.find(
        (error: IFieldError) => error.fieldId === field._id
      );

      if (field.logics && field.logics.length > 0) {
        const logics: LogicParams[] = field.logics.map(logic => {
          const { validation, value, type } = this.state.doc[logic.fieldId]

          return { fieldId: logic.fieldId, operator: logic.logicOperator, logicValue: logic.logicValue, fieldValue: value, validation, type }
        })

        const isLogicsFulfilled = checkLogicFulfilled(logics)

        if (field.logicAction && field.logicAction === 'show') {
          if (!isLogicsFulfilled) {
            this.hideField(field._id)
            return null;
          }
        }

        if (field.logicAction && field.logicAction === 'hide') {
          if (isLogicsFulfilled) {
            this.hideField(field._id)
            return null;
          }
        }
      }

      this.showField(field._id)

      return (
        <Field
          key={field._id}
          field={field}
          error={fieldError}
          onChange={this.onFieldValueChange}
        />
      );
    });

    return (
      <>
        {nonFieldError ? (
          <p style={{ color: 'red' }}>{fixErrorMessage(nonFieldError.text)}</p>
        ) : null}
        {renderedFields}
      </>
    );
  }

  renderForm() {
    const { form, integration, color, isSubmitting, extraContent } = this.props;

    return (
      <div className="erxes-form">
        {this.renderHead(form.title || integration.name)}
        <div className="erxes-form-content">
          <div className="erxes-description">{form.description}</div>

          {extraContent ? (
            <div dangerouslySetInnerHTML={{ __html: extraContent }} />
          ) : null}

          <div className="erxes-form-fields">
            {this.renderFields()}
          </div>

          <button
            style={{ background: color }}
            type="button"
            onClick={this.onSubmit}
            className={`erxes-button btn-block ${isSubmitting ? 'disabled' : ''
              }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? __('Loading ...') : form.buttonText || __('Send')}
          </button>
        </div>
      </div>
    );
  }

  renderSuccessForm(thankTitle?: string, thankContent?: string) {
    const { integration, form } = this.props;

    return (
      <div className="erxes-form">
        {this.renderHead(thankTitle || form.title)}
        <div className="erxes-form-content">
          <div className="erxes-result">
            <p>
              {thankContent ||
                __(
                  'Thanks for your message. We will respond as soon as we can.'
                )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { form, currentStatus, sendEmail, integration } = this.props;
    const doc = this.state.doc;

    if (currentStatus.status === 'SUCCESS') {
      const {
        successAction,
        redirectUrl,
        fromEmail,
        userEmailTitle,
        userEmailContent,
        adminEmails,
        adminEmailTitle,
        adminEmailContent,
        thankTitle,
        thankContent
      } = integration.leadData;

      // redirect to some url
      if (successAction === 'redirect') {
        window.open(redirectUrl);
      }

      // send email to user and admins
      if (successAction === 'email') {
        const emailField = form.fields.find(
          f => f.validation === 'email' || f.type === 'email'
        );

        if (emailField) {
          const email = this.state.doc[emailField._id].value as string;

          // send email to user
          if (email && fromEmail && userEmailTitle && userEmailContent) {
            sendEmail({
              toEmails: [email],
              fromEmail,
              title: userEmailTitle,
              content: userEmailContent,
              formId: connection.data.form._id,
            });
          }
        }

        // send email to admins
        if (adminEmails && fromEmail && adminEmailTitle && adminEmailContent) {
          sendEmail({
            toEmails: adminEmails,
            fromEmail,
            title: adminEmailTitle,
            content: adminEmailContent,
            formId: connection.data.form._id,
          });
        }
      } // end successAction = "email"

      return this.renderSuccessForm(thankTitle, thankContent);
    }

    return this.renderForm();
  }
}

export default (props: Props) => (
  <AppConsumer>
    {({ getColor }) => {
      return (
        <Form
          {...props}
          // if lead is in a messenger, return messenger theme color (getColor())
          // else return lead theme color
          color={
            getColor ? getColor() : props.integration.leadData.themeColor || ''
          }
        />
      );
    }}
  </AppConsumer>
);
