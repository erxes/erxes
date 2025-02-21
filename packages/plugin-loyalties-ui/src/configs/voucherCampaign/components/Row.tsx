import {
  FormControl,
  Icon,
  ModalTrigger,
  TextInfo,
} from '@erxes/ui/src/components';
import Button from '@erxes/ui/src/components/Button';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import React from 'react';
import { Link } from 'react-router-dom';
import { VOUCHER_TYPES } from '../../../constants';
import Form from '../containers/Form';
import { IVoucherCampaign } from '../types';
import ConfigForm from '../containers/ConfigForm';
import { getEnv } from '@erxes/ui/src';
import queryString from "query-string";

type Props = {
  voucherCampaign: IVoucherCampaign;
  isChecked: boolean;
  toggleBulk: (voucherCampaign: IVoucherCampaign, isChecked?: boolean) => void;
};

class Row extends React.Component<Props> {
  modalContent = (props) => {
    const { voucherCampaign } = this.props;

    const updatedProps = {
      ...props,
      voucherCampaign,
    };

    return <Form {...updatedProps} />;
  };

  exportOrderRecords = (campaignId) => {
    const { REACT_APP_API_URL } = getEnv();
    const params = {campaignId};

    const stringified = queryString.stringify({
      ...params,
    });

    window.open(
      `${REACT_APP_API_URL}/pl:loyalties/file-export?${stringified}`,
      "_blank"
    );
  };

  renderForm = () => {

    const { voucherCampaign } = this.props;

    const {
      _id,
      codesCount,
      voucherType
    } = voucherCampaign;

    if(voucherType !== 'coupon') {
      return <></>
    }

    if(codesCount) {
      return <Button btnStyle='link' icon='download-3' onClick={() => this.exportOrderRecords(_id)}/>
    }

    const content = (formProps) => <ConfigForm campaignId={_id} {...formProps} />;

    const trigger = <Button btnStyle='link' icon='refresh-1' onClick={(e) => e.preventDefault()}/>;

    return (
      <ModalTrigger
        title="Generate Code"
        trigger={trigger}
        autoOpenKey="codeGenerate"
        content={content}
      />
    );
  };

  render() {
    const { voucherCampaign, toggleBulk, isChecked } = this.props;

    const onChange = (e) => {
      if (toggleBulk) {
        toggleBulk(voucherCampaign, e.target.checked);
      }
    };

    const onClick = (e) => {
      e.stopPropagation();
    };

    const {
      _id,
      title,
      voucherType,
      startDate,
      endDate,
      finishDateOfUse,
      status,
    } = voucherCampaign;

    const trigger = (
      <tr key={_id}>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentclass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>{title}</td>
        <td>{new Date(startDate).toLocaleDateString()}</td>
        <td>{new Date(endDate).toLocaleDateString()}</td>
        <td>{new Date(finishDateOfUse).toLocaleDateString()}</td>
        <td>{(VOUCHER_TYPES[voucherType] || {}).label}</td>
        <td>
          <TextInfo>{status}</TextInfo>
        </td>
        <td onClick={onClick}>
          <ActionButtons>
            {this.renderForm()}
            <Link to={`/vouchers?campaignId=${_id}`}>
              <Button btnStyle='link' icon='list-2' />
            </Link>
          </ActionButtons>
        </td>
      </tr>
    );

    return (
      <ModalTrigger
        size={'lg'}
        title="Edit voucher campaign"
        trigger={trigger}
        autoOpenKey="showProductModal"
        content={this.modalContent}
      />
    );
  }
}

export default Row;
