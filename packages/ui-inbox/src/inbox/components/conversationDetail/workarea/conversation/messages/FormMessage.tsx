import dayjs from 'dayjs';
import FilePreview from '@erxes/ui/src/components/FilePreview';
import React from 'react';
import { IMessage } from '../../../../../types';
import {
  CellWrapper,
  FormTable,
  FieldWrapper,
  FormMessageInput
} from '../styles';
import {
  PreviewTitle,
  PreviewBody,
  BodyContent,
  PrintButton
} from '@erxes/ui/src/components/step/preview/styles';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { FieldItem } from '@erxes/ui-forms/src/forms/styles';
import Select from 'react-select-plus';
import Tip from '@erxes/ui/src/components/Tip';
import Button from '@erxes/ui/src/components/Button';
import { __ } from '@erxes/ui/src/utils';
import ReactToPrint, { PrintContextConsumer } from 'react-to-print';
import ErrorBoundary from '@erxes/ui/src/components/ErrorBoundary';

type Props = {
  message: IMessage;
};

export default class FormMessage extends React.Component<Props, {}> {
  private componentRef;

  displayValue(data) {
    if (data.validation === 'date') {
      return dayjs(data.value).format('YYYY/MM/DD');
    }

    if (data.validation === 'datetime') {
      return dayjs(data.value).format('YYYY/MM/DD HH:mm');
    }

    if (data.type === 'html') {
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: data.value
          }}
        />
      );
    }

    if (data.type === 'map') {
      const description = data.value.description || '';
      return `Latitude: ${data.value.lat}, Longitude: ${data.value.lng} - ${description}`;
    }

    if (['file', 'avatar', 'company_avatar'].includes(data.type)) {
      let fileUrl = data.value || '';

      if (Array.isArray(data.value) && data.value.length > 0) {
        fileUrl = data.value[0].url;
      }

      return (
        <CellWrapper>
          <FilePreview fileUrl={fileUrl} />
        </CellWrapper>
      );
    }

    return data.value || '-';
  }

  renderMultiSelect(value: string) {
    const selectValues = value.split(',');

    return (
      <Select
        value={value}
        options={selectValues.map(e => ({ value: e, label: e }))}
        multi={true}
      />
    );
  }

  renderField(field) {
    return (
      <FieldWrapper key={field._id} column={field.column}>
        <FieldItem>
          <FormGroup>
            <ControlLabel ignoreTrans={true} required={field.isRequired}>
              {field.text}
            </ControlLabel>
            {field.type === 'multiSelect' ? (
              this.renderMultiSelect(field.value)
            ) : (
              <ErrorBoundary>
                <FormMessageInput>{this.displayValue(field)}</FormMessageInput>
              </ErrorBoundary>
            )}
          </FormGroup>
        </FieldItem>
      </FieldWrapper>
    );
  }

  renderPrintBtn() {
    return (
      <PrintButton>
        <ReactToPrint content={() => this.componentRef}>
          <PrintContextConsumer>
            {({ handlePrint }) => (
              <Tip text={__('Print responses')} placement="top">
                <Button btnStyle="link" onClick={handlePrint} icon="print" />
              </Tip>
            )}
          </PrintContextConsumer>
        </ReactToPrint>
      </PrintButton>
    );
  }

  render() {
    const { formWidgetData, content } = this.props.message;

    return (
      <FormTable ref={el => (this.componentRef = el)}>
        <PreviewTitle style={{ backgroundColor: '#6569DF' }}>
          <div>{content}</div>
        </PreviewTitle>
        <PreviewBody embedded="embedded">
          <BodyContent>
            {formWidgetData.map(field => this.renderField(field))}
          </BodyContent>
        </PreviewBody>
        {this.renderPrintBtn()}
      </FormTable>
    );
  }
}
