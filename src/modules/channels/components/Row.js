import React from 'react';
import { Row as CommonRow } from '../common';
import { Label } from 'modules/common/components';
import { ChannelForm } from '../containers';
import { KIND_CHOICES } from 'modules/settings/integrations/constants';

class Row extends CommonRow {
  renderForm(props) {
    return <ChannelForm {...props} />;
  }

  getTypeName() {
    const kind = this.props.integration.kind;
    let type = 'defult';

    if (kind === KIND_CHOICES.FORM) {
      type = 'form';
    }

    if (kind === KIND_CHOICES.TWITTER) {
      type = 'twitter';
    }

    if (kind === KIND_CHOICES.FACEBOOK) {
      type = 'facebook';
    }

    return type;
  }

  render() {
    const { integration } = this.props;

    return (
      <tr>
        <td>{integration.name}</td>
        <td>
          <Label className={`label-${this.getTypeName()}`}>
            {integration.kind}
          </Label>
        </td>
        <td>{integration.brand ? integration.brand.name : ''}</td>

        {this.renderActions()}
      </tr>
    );
  }
}

export default Row;
