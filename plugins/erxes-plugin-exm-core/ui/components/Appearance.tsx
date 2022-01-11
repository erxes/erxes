import Button from 'erxes-ui/lib/components/Button';
import { FormControl } from 'erxes-ui/lib/components/form';
import ControlLabel from 'erxes-ui/lib/components/form/Label';
import Uploader from 'erxes-ui/lib/components/Uploader';
import { __ } from 'erxes-ui/lib/utils';
import React, { useState } from 'react';
import {
  GeneralWrapper,
  Colors,
  Logos,
  AppearanceWrapper,
  WelcomeContent,
  XButton
} from '../styles';
import TwitterPicker from 'react-color/lib/Twitter';
import { ColorPick, ColorPicker } from '../styles';
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { IExm, IWelcomeContent } from '../types';

const getEmptyPage = () => ({
  _id: Math.random().toString(),
  image: undefined,
  title: '',
  content: ''
});

type Props = {
  exm: IExm;
  edit: (variables: IExm) => void;
};

export default function Appearance(props: Props) {
  const { exm, edit } = props;
  const exmLogo = exm.logo;
  const exmAppearance = exm.appearance;
  const exmPages = exm.welcomeContent || ([] as IWelcomeContent[]);
  const [logo, setLogo] = useState(exmLogo);
  const [appearance, setAppearance] = useState(
    exmAppearance
      ? {
          primaryColor: exmAppearance.primaryColor,
          secondaryColor: exmAppearance.secondaryColor
        }
      : { primaryColor: 'red', secondaryColor: 'green' }
  );

  const [welcomeContent, setWelcomeContent] = useState(
    exmPages.length > 0
      ? exmPages.map(e => ({
          _id: e._id,
          title: e.title,
          content: e.content,
          image: e.image
            ? {
                name: e.image.name,
                url: e.image.url,
                size: e.image.size,
                type: e.image.type
              }
            : undefined
        }))
      : [getEmptyPage()]
  );

  const onSave = () => {
    edit({
      _id: props.exm._id,
      logo: logo
        ? {
            name: logo.name,
            url: logo.url,
            size: logo.size,
            type: logo.type
          }
        : undefined,
      welcomeContent,
      appearance
    });
  };

  const onChangePageCount = (type: string, _id?: string) => {
    if (type === 'add') {
      setWelcomeContent([...welcomeContent, getEmptyPage()]);
    } else {
      const modifiedContents = welcomeContent.filter(f => f._id !== _id);

      setWelcomeContent(modifiedContents);
    }
  };

  const onChangeColor = (key: string, value: any) => {
    setAppearance({ ...appearance, [key]: value });
  };

  const onChangePageItem = (_id: string, key: string, value: any) => {
    const page = welcomeContent.find(f => f._id === _id);

    if (page) {
      page[key] = value;

      setWelcomeContent([...welcomeContent]);
    }
  };

  const onChangeAttachment = (e: any) => {
    setLogo(e);
  };

  const renderColorSelect = (item, color) => {
    const popoverBottom = (
      <Popover id='color-picker'>
        <TwitterPicker
          width='266px'
          triangle='hide'
          color={color}
          onChange={e => onChangeColor(item, e.hex)}
        />
      </Popover>
    );

    return (
      <OverlayTrigger
        trigger='click'
        rootClose={true}
        placement='bottom-start'
        overlay={popoverBottom}
      >
        <ColorPick>
          <ColorPicker
            style={{
              backgroundColor: color
            }}
          />
        </ColorPick>
      </OverlayTrigger>
    );
  };

  const renderWelcomeContent = (page, index: number) => {
    const image = welcomeContent[index].image;

    return (
      <div key={index}>
        <XButton
          style={{ float: 'right', background: 'transparent', border: 'none', cursor:'pointer' }}
          onClick={() => onChangePageCount('remove', page._id)}
          title={'Delete Page'}
        >
          X
        </XButton>
        <ControlLabel>Page {index + 1}</ControlLabel>
        <Uploader
          defaultFileList={image ? [image] : []}
          onChange={(e: any) => {
            return onChangePageItem(page._id, 'image', e[0]);
          }}
          single={true}
        />
        <FormControl
          name='title'
          placeholder='Title'
          value={page.title}
          onChange={(e: any) => {
            return onChangePageItem(page._id, 'title', e.target.value);
          }}
        />
        <FormControl
          name='description'
          placeholder='Description'
          componentClass='textarea'
          value={page.content}
          onChange={(e: any) => {
            return onChangePageItem(page._id, 'content', e.target.value);
          }}
        />
      </div>
    );
  };

  return (
    <AppearanceWrapper>
      <GeneralWrapper>
        <Logos>
          <p>Logos</p>
          <ControlLabel>{__('Logo 256x256 or 128x128')}</ControlLabel>
          {!logo ? 
            <div>
            <img 
              src={'https://i.pinimg.com/originals/3f/94/70/3f9470b34a8e3f526dbdb022f9f19cf7.jpg'} 
              alt={logo}
              width={128} 
              height={128} 
              title={'Logo'}
            />
            </div> 
          : 
            <div>
            </div> 
          }
          <div>
          <Uploader
            defaultFileList={logo ? [logo] : []}
            onChange={(e: any) => onChangeAttachment(e.length ? e[0] : null)}
            single={true}
          />
          </div>
        </Logos>
        <Colors>
          <p>Colors</p>
          <div>
            <div>
              <ControlLabel>{__('Primary color')}</ControlLabel>
              {renderColorSelect('primaryColor', appearance.primaryColor)}
            </div>
            <div>
              <ControlLabel>{__('Secondary color')}</ControlLabel>
              {renderColorSelect('secondaryColor', appearance.secondaryColor)}
            </div>
          </div>
        </Colors>
        <WelcomeContent>
          <p>Welcome content</p>
          <Button onClick={() => onChangePageCount('add')}>+ Add Page</Button>
          {welcomeContent.map((page, index) =>
            renderWelcomeContent(page, index)
          )}
        </WelcomeContent>
        <Button btnStyle='success' icon="check-circle" onClick={onSave}>
          Save
        </Button>
      </GeneralWrapper>
    </AppearanceWrapper>
  );
}
