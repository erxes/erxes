import * as React from 'react';

import { AppConsumer } from '../../messenger/containers/AppContext';
import { IEmailParams, IIntegration } from '../../types';
import {
  __,
  checkLogicFulfilled,
  fixErrorMessage,
  loadMapApi,
  LogicParams,
  readFile,
} from '../../utils';
import { connection } from '../connection';
import {
  FieldValue,
  ICurrentStatus,
  IFieldError,
  IForm,
  IFormDoc,
  ILocationOption,
} from '../types';
import Field from './Field';
import TopBar from './TopBar';

type Props = {
  form: IForm;
  integration: IIntegration;
  currentStatus: ICurrentStatus;
  callSubmit?: boolean;

  hasTopBar: boolean;
  isSubmitting?: boolean;
  color?: string;
  extraContent?: string;
  invoiceLink?: string;

  onSubmit: (
    doc: IFormDoc,
    formCode: string,
    requiredPaymentAmount?: number
  ) => void;
  onCreateNew: () => void;
  sendEmail: (params: IEmailParams) => void;
  setHeight?: () => void;
};

type State = {
  doc: IFormDoc;
  currentPage: number;
  currentLocation?: ILocationOption;
  mapScriptLoaded?: boolean;
  qty?: number;
};

class Form extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    let currentLocation: ILocationOption | undefined;

    if (props.form.fields.findIndex((e) => e.type === 'map') !== -1) {
      currentLocation = {
        lat: connection.browserInfo.latitude,
        lng: connection.browserInfo.longitude,
      };
    }

    this.state = { doc: this.resetDocState(), currentPage: 1, currentLocation };
  }

  componentDidMount() {
    const { setHeight, form, integration } = this.props;

    if (setHeight) {
      setHeight();
    }

    if (integration.leadData.css) {
      const head = document.getElementsByTagName('head')[0];
      const style = document.createElement('style');
      style.setAttribute('type', 'text/css');

      style.appendChild(document.createTextNode(integration.leadData.css));

      head.appendChild(style);
    }

    if (form.fields.findIndex((e) => e.type === 'map') !== -1) {
      const googleMapScript = loadMapApi(
        form.googleMapApiKey || 'test',
        integration.languageCode || 'en'
      );

      googleMapScript.addEventListener('load', () => {
        this.setState({ mapScriptLoaded: true });
      });
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

    if (
      (this.props?.form?.fields || []).some(
        (field) => field?.pageNumber && field?.pageNumber > 1
      )
    ) {
      if (
        JSON.stringify(this.props?.currentStatus?.errors || []) !==
        JSON.stringify(nextProps?.currentStatus?.errors || [])
      ) {
        const errors = nextProps.currentStatus?.errors || [];
        if (!!errors?.length) {
          const errorField = nextProps.form.fields.find((field) =>
            errors.find((error) => error.fieldId === field._id)
          );

          const pageNumber = errorField?.pageNumber || 1;

          this.setState({
            currentPage: pageNumber,
          });
        }
      }
    }

    if (!this.props.callSubmit && nextProps.callSubmit) {
      this.onSubmit();
    }
  }

  // after any field value change, save it's value to state
  onFieldValueChange = ({
    fieldId,
    value,
    groupId,
  }: {
    fieldId: string;
    value: FieldValue;
    groupId?: string;
  }) => {
    const doc = this.state.doc;

    if (doc[fieldId].validation === 'multiSelect') {
      value = value.toString();
    }

    doc[fieldId].value = value;

    if (groupId) {
      doc[fieldId].groupId = groupId;
    }

    this.setState({ doc });
  };

  onQtyChange = (qty: number) => {
    this.setState({ qty });
  };

  onSubmit = () => {
    const doc: any = {};
    const { fields } = this.props.form;

    let subTotal = 0;

    for (const key of Object.keys(this.state.doc)) {
      const field = this.state.doc[key];

      doc[key] = field;

      if (field.type === 'multiSelect' || field.type === 'check') {
        doc[key] = {
          ...field,
          value: String(field.value).replace(new RegExp(',,', 'g'), ', '),
        };
      }

      if (field.type === 'productCategory') {
        const formField = fields.find((f) => f._id === key);
        if (!formField) {
          continue;
        }
        
        const { product, quantity } = field.value as any;

        if (formField.isRequired && field.value) {
          subTotal += product.unitPrice * quantity;
        }

        doc[key] = {
          ...field,
          product,
          productId: product._id,
        };
      }
    }

    this.props.onSubmit(doc, this.props.form.code, subTotal);
  };

  canChangePage = () => {
    const requiredFields = this.getCurrentFields().filter((f) => f.isRequired);

    for (const field of requiredFields) {
      const value = this.state.doc[field._id].value;

      if (this.state.doc[field._id].isHidden) {
        continue;
      }

      if (!value) {
        return false;
      }
    }

    return true;
  };

  onNextClick = () => {
    if (this.canChangePage()) {
      this.setState({ currentPage: this.state.currentPage + 1 });
    } else {
      alert(__('Please fill out required fields'));
    }
  };

  onbackClick = () => {
    this.setState({ currentPage: this.state.currentPage - 1 });
  };

  resetDocState() {
    const { form } = this.props;
    const doc: any = {};

    for (const field of form.fields) {
      let isHidden = false;

      if (
        field.type === 'productCategory' &&
        !connection.enabledServices.products
      ) {
        continue;
      }

      if (
        field.logicAction &&
        field.logicAction === 'show' &&
        field.logics &&
        field.logics.length > 0
      ) {
        isHidden = true;
      }

      let value = '';

      if (field.type === 'html') {
        value = field.content || '';
      }

      doc[field._id] = {
        text: field.text,
        type: field.type,
        validation: field.validation,
        value,
        isHidden,
        column: field.column,
        associatedFieldId: field.associatedFieldId || '',
      };
    }

    return doc;
  }

  getCurrentFields() {
    return this.props.form.fields.filter((f) => {
      const pageNumber = f.pageNumber || 1;
      if (pageNumber === this.state.currentPage) {
        return f;
      }

      return null;
    });
  }

  hideField(id: string) {
    const { doc } = this.state;

    if (doc[id].value !== '' || !doc[id].isHidden) {
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

  renderProgress() {
    const numberOfPages = this.props.form.numberOfPages || 1;
    const { currentPage } = this.state;

    if (numberOfPages === 1) {
      return null;
    }

    const percentage = ((currentPage / numberOfPages) * 100).toFixed(1);

    return (
      <div
        style={{
          background: this.props.color,
          opacity: 0.7,
          height: '13px',
          width: `${percentage}%`,
        }}
      >
        <div
          style={{
            textAlign: 'center',
            color: 'white',
            fontSize: 10,
          }}
        >{`${percentage}%`}</div>
      </div>
    );
  }

  renderFields() {
    const { currentStatus } = this.props;

    const fields = this.getCurrentFields();

    const errors = currentStatus.errors || [];
    const nonFieldError = errors.find((error) => !error.fieldId);

    const renderedFields = fields.map((field) => {
      if (
        field.type === 'productCategory' &&
        !connection.enabledServices.products
      ) {
        return null;
      }

      const fieldError = errors.find(
        (error: IFieldError) => error.fieldId === field._id
      );

      if (field.logics && field.logics.length > 0) {
        const logics: LogicParams[] = field.logics.map((logic) => {
          const { validation, value, type } =
            this.state.doc[logic.fieldId] || {};

          return {
            fieldId: logic.fieldId,
            operator: logic.logicOperator,
            logicValue: logic.logicValue,
            fieldValue: value,
            validation,
            type,
          };
        });

        const isLogicsFulfilled = checkLogicFulfilled(logics);

        if (field.logicAction && field.logicAction === 'show') {
          if (!isLogicsFulfilled) {
            this.hideField(field._id);
            return null;
          }
        }

        if (field.logicAction && field.logicAction === 'hide') {
          if (isLogicsFulfilled) {
            this.hideField(field._id);
            return null;
          }
        }
      }

      this.showField(field._id);

      return (
        <Field
          key={field._id}
          field={field}
          error={fieldError}
          onChange={this.onFieldValueChange}
          onQtyChange={this.onQtyChange}
          value={this.state.doc[field._id].value || ''}
          currentLocation={this.state.currentLocation}
          color={this.props.color}
          mapScriptLoaded={this.state.mapScriptLoaded}
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

  renderButtons() {
    const { currentPage } = this.state;
    const { form, isSubmitting, color } = this.props;
    const numberOfPages = form.numberOfPages || 1;

    const button = (
      title: any,
      action: React.MouseEventHandler<HTMLButtonElement>,
      disabled?: boolean,
      className?: string
    ) => {
      return (
        <button
          style={{ background: color }}
          type="button"
          onClick={action}
          className={`erxes-button btn-block ${
            isSubmitting ? 'disabled' : ''
          } ${className}`}
          disabled={disabled}
        >
          {title}
        </button>
      );
    };

    if (numberOfPages === 1) {
      return button(
        isSubmitting ? __('Loading ...') : form.buttonText || __('Send'),
        this.onSubmit,
        isSubmitting
      );
    }

    if (currentPage === numberOfPages) {
      return (
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex' }}>
            {button(__('Back'), this.onbackClick, isSubmitting, 'hasMargin')}
            {button(
              isSubmitting ? __('Loading ...') : form.buttonText || __('Send'),
              this.onSubmit,
              isSubmitting
            )}
          </div>
        </div>
      );
    }

    if (currentPage === 1 && numberOfPages > 1) {
      return button(__('Next'), this.onNextClick, isSubmitting);
    }

    return (
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex' }}>
          {button(__('Back'), this.onbackClick, isSubmitting, 'hasMargin')}
          {button(__('Next'), this.onNextClick, isSubmitting)}
        </div>
      </div>
    );
  }

  renderPayments() {
    const invoiceLink = this.props.invoiceLink;
    const { currentStatus } = this.props;

    const PaymentIframe = ({
      src,
      width,
      height,
    }: {
      src: string;
      width: string;
      height: string;
    }) => (
      <iframe src={src} width={width} height={height} scrolling="yes"></iframe>
    );

    if (!invoiceLink || currentStatus.status !== 'PAYMENT_PENDING') {
      return null;
    }

    return <PaymentIframe src={invoiceLink} width="100%" height="600px" />;
  }

  renderForm() {
    const { form, integration, extraContent } = this.props;

    return (
      <div className="erxes-form">
        {this.renderHead(form.title || integration.name)}
        {this.renderProgress()}
        <div className="erxes-form-content">
          <div className="erxes-description">{form.description}</div>

          {extraContent ? (
            <div dangerouslySetInnerHTML={{ __html: extraContent }} />
          ) : null}

          <div className="erxes-form-fields">{this.renderFields()}</div>

          {this.renderButtons()}
        </div>
      </div>
    );
  }

  renderSuccessImage(image: string, title: string) {
    if (!image) {
      return null;
    }

    return (
      <img onLoad={this.props.setHeight} src={readFile(image)} alt={title} />
    );
  }

  renderSuccessForm(
    thankTitle?: string,
    thankContent?: string,
    successImage?: string
  ) {
    const { form } = this.props;

    return (
      <div className="erxes-form">
        {this.renderHead(thankTitle || form.title)}
        <div className="erxes-form-content">
          <div className="erxes-callout-body">
            {this.renderSuccessImage(successImage || '', form.title)}
            {thankContent ||
              __('Thanks for your message. We will respond as soon as we can.')}
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
        thankContent,
        attachments,
        successImage,
      } = integration.leadData;

      // redirect to some url
      if (successAction === 'redirect') {
        window.open(redirectUrl);
      }

      // send email to user and admins
      if (successAction === 'email') {
        const emailField = form.fields.find(
          (f) => f.validation === 'email' || f.type === 'email'
        );

        if (emailField) {
          const email = doc[emailField._id].value as string;

          // send email to user
          if (email && fromEmail && userEmailTitle && userEmailContent) {
            sendEmail({
              toEmails: [email],
              fromEmail,
              title: userEmailTitle,
              content: userEmailContent,
              formId: connection.data.form._id,
              attachments,
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
            attachments,
          });
        }
      } // end successAction = "email"

      return this.renderSuccessForm(thankTitle, thankContent, successImage);
    }

    if (this.props.invoiceLink) {
      return this.renderPayments();
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
