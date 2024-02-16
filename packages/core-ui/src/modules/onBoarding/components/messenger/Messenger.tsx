import React, { useState } from 'react';
import Icon from 'modules/common/components/Icon';
import Form from 'react-bootstrap/Form';
import TwitterPicker from 'react-color/lib/Twitter';
import Button from 'modules/common/components/Button';
import {
  ButtonContainer,
  ColorChooserWrapper,
  SidebarContent,
} from 'modules/onBoarding/styles';
import { IIntegration } from '@erxes/ui-inbox/src/settings/integrations/types';
import { router } from 'modules/common/utils';

type Props = {
  history: any;
  integration: IIntegration;
  integrationSave: (doc: any, _id?: string) => void;
  brandName: string;
  setBrandName: (name: string) => void;
  color: string;
  setColor: (color: string) => void;
};

function Messenger(props: Props) {
  const {
    history,
    integrationSave,
    integration,
    brandName,
    setBrandName,
    color,
    setColor,
  } = props;

  const [active, setActive] = useState(brandName ? true : false);

  const onSubmit = () => {
    const doc = {
      brandName,
      color,
    };

    if (integration && integration._id) {
      return integrationSave(
        { brandId: integration.brandId, ...doc },
        integration._id,
      );
    }

    return integrationSave(doc);
  };

  const onChangeStep = () => {
    router.setParams(history, { steps: 1 });
  };

  return (
    <>
      <SidebarContent>
        <Form.Group className={active ? 'active' : ''} controlId="messenger">
          <Form.Label>Brand name</Form.Label>
          <Form.Control
            defaultValue={brandName}
            name="name"
            onFocus={() => setActive(true)}
            onBlur={() => !brandName && setActive(false)}
            onChange={(e) => setBrandName((e.target as HTMLInputElement).value)}
          />
        </Form.Group>

        <Form.Group className="color-accent">
          <Form.Label>Color accent:</Form.Label>
          <ColorChooserWrapper>
            <TwitterPicker
              color={color}
              onChange={(e) => setColor(e.hex)}
              triangle="hide"
            />
          </ColorChooserWrapper>
        </Form.Group>
      </SidebarContent>

      <ButtonContainer>
        <Button btnStyle="simple" onClick={onChangeStep} block={true}>
          <Icon icon="leftarrow" size={12} /> &nbsp; Back
        </Button>
        <Button onClick={onSubmit} block={true}>
          Next &nbsp; <Icon icon="rightarrow" size={12} />
        </Button>
      </ButtonContainer>
    </>
  );
}

export default Messenger;
