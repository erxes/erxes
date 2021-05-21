import dayjs from 'dayjs';
import FilePreview from 'modules/common/components/FilePreview';
import React from 'react';
import { IMessage } from '../../../../../types';
import { CellWrapper, FormTable } from '../styles';
import {
  PreviewTitle,
  PreviewBody,
  BodyContent
} from 'modules/leads/components/step/preview/styles';
import FieldsPreview from 'modules/forms/components/FieldsPreview';

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

    return data.value;
  }

  renderRow(data, index: string) {
    return (
      <tr key={index}>
        <td style={{ width: '40%' }}>
          <b>{data.text}:</b>
        </td>
        <td style={{ width: '60%' }}>{this.displayValue(data)}</td>
      </tr>
    );
  }

  render() {
    const { formWidgetData, content } = this.props.message;
    console.log(formWidgetData, content);
    return (
      <FormTable>
        <PreviewTitle style={{ backgroundColor: '#6569DF' }}>
          <div>{content}</div>
        </PreviewTitle>
        <PreviewBody embedded="embedded">
          <BodyContent>
            <FieldsPreview fields={formWidgetData || []} currentPage={1} />
          </BodyContent>
        </PreviewBody>
      </FormTable>
    );
  }
}
