import React from 'react';
import { Link } from 'react-router-dom';
import { IConfig } from 'types';
import {
  LogoWrapper,
  ChooseType,
  Footer,
  PortraitViewWrapper,
  Type,
  AppWrapper
} from './style';
import Icon from 'modules/common/components/Icon';
import { FlexBetween, FlexCenter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';

type Props = {
  currentConfig: IConfig;
  onClickType: (type: string) => void;
};

export default class PortraitView extends React.Component<Props> {
  renderContent(color) {
    const { onClickType, currentConfig } = this.props;

    const uiOptions = currentConfig ? currentConfig.uiOptions : {};

    return (
      <ChooseType>
        <h4>
          Та үйлчилгээний <br /> төрлөө сонгоно уу?
        </h4>
        <FlexCenter>
          <Type color={color} onClick={() => onClickType('take')}>
            <img src="images/type1.png" alt="type" />
            {__('Take')}
          </Type>
          <Type color={color} onClick={() => onClickType('eat')}>
            <img src="images/type2.png" alt="type" />
            {__('Eat')}
          </Type>
        </FlexCenter>
        <AppWrapper>
          <img
            src={uiOptions.mobileAppImage || '/images/Phone-XI.png'}
            alt="mobile app"
          />
          <div>
            <h3>{__('Scan Me')}</h3>
            <img
              className="qrCode"
              src={uiOptions.qrCodeImage || '/images/qr-code.png'}
              alt="qr-code"
            />
          </div>
          <FlexCenter>
            <img className="app-download" src="/images/ios.png" alt="ios" />
            <img
              className="app-download"
              src="/images/android.png"
              alt="android"
            />
          </FlexCenter>
        </AppWrapper>
      </ChooseType>
    );
  }

  render() {
    const { currentConfig } = this.props;
    const { colors, bgImage, texts = {} } =
      currentConfig.uiOptions || ({} as any);

    return (
      <PortraitViewWrapper>
        <LogoWrapper>
          <Link to="/">
            <img
              src={bgImage ? bgImage : `/images/headerKiosk.png`}
              alt="logo"
            />
          </Link>
        </LogoWrapper>
        {this.renderContent(colors.primary)}
        <Footer color={colors.primary}>
          <FlexBetween>
            <span>
              <Icon icon="earthgrid" /> {texts ? texts.website : '' || ''}
            </span>
            <span>
              <Icon icon="phone" /> {texts ? texts.phone : '' || ''}
            </span>
          </FlexBetween>
        </Footer>
      </PortraitViewWrapper>
    );
  } // end render()
}
