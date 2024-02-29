import React, { useState } from 'react';
import { StatusBox, StatusTitle } from '../styles';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { Row } from '@erxes/ui-settings/src/styles';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  usePromoCode: (code: string) => void;
};

function PromoCodeForm(props: Props) {
  const [code, setCode] = useState('');

  const onChangeCode = (e: any) => {
    setCode(e.target.value);
  };

  const usePromoCode = () => {
    props.usePromoCode(code);
  };

  return (
    <StatusBox largePadding={true} largeMargin={true}>
      <FormGroup>
        <StatusTitle>{__('Promo Code')}</StatusTitle>
        <ControlLabel>
          {__('Type in any redeemable promo codes below')}.
        </ControlLabel>

        <Row>
          <FormControl name="redeemCode" value={code} onChange={onChangeCode} />
          <Button
            btnStyle="success"
            uppercase={false}
            icon="check-circle"
            onClick={usePromoCode}
          >
            Apply
          </Button>
        </Row>
      </FormGroup>
    </StatusBox>
  );
}

export default PromoCodeForm;
