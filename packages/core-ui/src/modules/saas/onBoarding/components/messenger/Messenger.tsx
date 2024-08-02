import {
  ButtonContainer,
  ColorChooserWrapper,
  SidebarContent,
} from "modules/saas/onBoarding/styles";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Button from "modules/common/components/Button";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormLabel from "@erxes/ui/src/components/form/Label";
import FormGroup from "@erxes/ui/src/components/form/Group";
import { IIntegration } from "@erxes/ui-inbox/src/settings/integrations/types";
import Icon from "modules/common/components/Icon";
import TwitterPicker from "react-color/lib/Twitter";
import { router } from "modules/common/utils";

type Props = {
  integration: IIntegration;
  integrationSave: (doc: any, _id?: string) => void;
  brandName: string;
  setBrandName: (name: string) => void;
  color: string;
  setColor: (color: string) => void;
};

function Messenger(props: Props) {
  const {
    integrationSave,
    integration,
    brandName,
    setBrandName,
    color,
    setColor,
  } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const [active, setActive] = useState(brandName ? true : false);

  const onSubmit = () => {
    const doc = {
      brandName,
      color,
    };

    if (integration && integration._id) {
      return integrationSave(
        { brandId: integration.brandId, ...doc },
        integration._id
      );
    }

    return integrationSave(doc);
  };

  const onChangeStep = () => {
    router.setParams(navigate, location, { steps: 1 });
  };

  return (
    <>
      <SidebarContent>
        <FormGroup className={`form-group ${active ? "active" : ""}`} controlId="messenger">
          <FormLabel uppercase={false}>Brand name</FormLabel>
          <FormControl
            defaultValue={brandName}
            name="name"
            onFocus={() => setActive(true)}
            onBlur={() => !brandName && setActive(false)}
            onChange={(e) => setBrandName((e.target as HTMLInputElement).value)}
          />
        </FormGroup>

        <FormGroup className="form-group color-accent">
          <FormLabel uppercase={false}>Color accent:</FormLabel>
          <ColorChooserWrapper>
            <TwitterPicker
              color={color}
              onChange={(e) => setColor(e.hex)}
              triangle="hide"
            />
          </ColorChooserWrapper>
        </FormGroup>
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
