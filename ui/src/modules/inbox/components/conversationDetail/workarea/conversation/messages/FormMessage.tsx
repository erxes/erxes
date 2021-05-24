import dayjs from 'dayjs';
import FilePreview from 'modules/common/components/FilePreview';
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
  BodyContent
} from 'modules/leads/components/step/preview/styles';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { FieldItem } from 'modules/forms/styles';
import Select from 'react-select-plus';

type Props = {
  message: IMessage;
};

export default class FormMessage extends React.Component<Props, {}> {
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

    if (['file', 'avatar', 'companyAvatar'].includes(data.type)) {
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
              <FormMessageInput>{this.displayValue(field)}</FormMessageInput>
            )}
          </FormGroup>
        </FieldItem>
      </FieldWrapper>
    );
  }

  render() {
    const { formWidgetData, content } = this.props.message;

    return (
      <FormTable>
        <PreviewTitle style={{ backgroundColor: '#6569DF' }}>
          <div>{content}</div>
        </PreviewTitle>
        <PreviewBody embedded="embedded">
          <BodyContent>
            {formWidgetData.map(field => this.renderField(field))}
          </BodyContent>
        </PreviewBody>
      </FormTable>
    );
  }
}
