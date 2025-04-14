import {
  ActionButtons,
  Button,
  FormControl,
  ModalTrigger,
  TextInfo,
} from '@erxes/ui/src/components';
import * as dayjs from 'dayjs';
import React from 'react';
import { Link } from 'react-router-dom';
import Form from '../containers/Form';
import { ICouponCampaign } from '../types';

type Props = {
  couponCampaign: ICouponCampaign;
  toggleBulk: (couponCampaign: ICouponCampaign, isChecked?: boolean) => void;
  isChecked: boolean;
};

const Row = (props: Props) => {
  const { couponCampaign, toggleBulk, isChecked } = props;

  const { _id, title, startDate, kind, endDate, finishDateOfUse, status } =
    couponCampaign;

  const renderForm = (formProps) => {
    const updatedProps = {
      ...formProps,
      couponCampaign,
    };

    return <Form {...updatedProps} />;
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(couponCampaign, e.target.checked);
    }
  };

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
      <td>{dayjs(startDate).format('YYYY-MM-DD')}</td>
      <td>{dayjs(endDate).format('YYYY-MM-DD')}</td>
      <td>{dayjs(finishDateOfUse).format('YYYY-MM-DD')}</td>
      <td>{kind}</td>
      <td>
        <TextInfo>{status}</TextInfo>
      </td>
      <td onClick={onClick}>
        <ActionButtons>
          <Link to={`/coupons?campaignId=${_id}`}>
            <Button btnStyle="link" icon="list-2" />
          </Link>
        </ActionButtons>
      </td>
    </tr>
  );

  return (
    <ModalTrigger
      size={'lg'}
      title="Edit coupon campaign"
      trigger={trigger}
      autoOpenKey="showCouponCampaignModal"
      content={renderForm}
    />
  );
};

export default Row;
