import Button from 'modules/common/components/Button';
import { FormControl } from 'modules/common/components/form';
import ControlLabel from 'modules/common/components/form/Label';
import Uploader from 'modules/common/components/Uploader';
import { __ } from 'modules/common/utils';
import { MobilePreview } from 'modules/leads/components/step/style';
import { ColorPick, ColorPicker } from 'modules/settings/styles';
import React, { useState } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import {
  AppearanceWrapper,
  AppSettings,
  Colors,
  FeatureRow,
  FeatureRowItem,
  Logos,
  UploadItems,
  WelcomeContent
} from '../styles';

type Props = { exm: any; edit: (variables: any) => void };

export default function Appearance(props: Props) {
  const { exm } = props;
  const [logo, setLogo] = useState(exm.logo || {});
  const [primaryColor, setColor] = useState('#673FBD');
  const [secondColor, setSecondColor] = useState('orange');
  const [title, setTitle] = useState(exm.welcomeContent || []);
  const [description, setContent] = useState(exm.welcomeContent.content || '');
  const popoverTopPrimary = (
    <Popover id="kb-color-picker">
      <TwitterPicker
        width="205px"
        triangle="hide"
        color={primaryColor || []}
        onChange={(e: any) => setColor(e.hex)}
      />
    </Popover>
  );

  const popoverTopSecond = (
    <Popover id="kb-color-picker">
      <TwitterPicker
        width="205px"
        triangle="hide"
        color={secondColor || []}
        onChange={(e: any) => setSecondColor(e.hex)}
      />
    </Popover>
  );

  const onSave = () => {
    props.edit({ _id: props.exm._id, logo });
  };

  return (
    <AppearanceWrapper>
      <AppSettings>
        <Logos>
          <p>Logos</p>
          <ControlLabel>{__('Logo 128x128 or 256x256')}</ControlLabel>
          <Uploader
            defaultFileList={[logo]}
            onChange={(e: any) => setLogo(e[0])}
            single={true}
          />
        </Logos>
        <Colors>
          <p>Colors</p>
          <div>
            <div>
              <ControlLabel>{__('Primary color')}</ControlLabel>
              <OverlayTrigger
                trigger="click"
                rootClose={true}
                placement="bottom"
                overlay={popoverTopPrimary}
              >
                <ColorPick>
                  <ColorPicker style={{ backgroundColor: primaryColor }} />
                </ColorPick>
              </OverlayTrigger>
            </div>
            <div>
              <ControlLabel>{__('Secondary color')}</ControlLabel>
              <OverlayTrigger
                trigger="click"
                rootClose={true}
                placement="bottom"
                overlay={popoverTopSecond}
              >
                <ColorPick>
                  <ColorPicker style={{ backgroundColor: secondColor }} />
                </ColorPick>
              </OverlayTrigger>
            </div>
          </div>
        </Colors>
        <WelcomeContent>
          <p>Welcome content</p>
          <FeatureRow>
            <FeatureRowItem>
              <ControlLabel>{__('Title')}</ControlLabel>
              <FormControl
                value={title}
                placeholder="Title"
                onChange={(e: any) => setTitle(e.target.value)}
              />
            </FeatureRowItem>
            <FeatureRowItem>
              <ControlLabel>{__('Image')}</ControlLabel>
              <UploadItems>
                <input type="file" />
              </UploadItems>
            </FeatureRowItem>
          </FeatureRow>
          <ControlLabel>{__('Description')}</ControlLabel>
          <FormControl
            value={description}
            componentClass="textarea"
            placeholder="Description"
            onChange={(e: any) => setContent(e.target.value)}
          />
        </WelcomeContent>
        <Button btnStyle="success" onClick={onSave}>
          Save
        </Button>
      </AppSettings>
      <MobilePreview />
    </AppearanceWrapper>
  );
}
