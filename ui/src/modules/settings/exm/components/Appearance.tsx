import Icon from 'modules/common/components/Icon';
import { MobilePreview } from 'modules/leads/components/step/style';
import React from 'react';
import { AppearanceLayout, Colors, Logos, WelcomeContent } from '../styles';

export default function Appearance() {
  return (
    <div style={{ display: 'flex' }}>
      <AppearanceLayout>
        <Logos>
          <b>Logos</b>
          <div>
            <div>
              Favicon 16x16px
              <div>
                <Icon icon="doc" />
              </div>
            </div>
            <div>
              Square logo 000x000
              <div>
                <Icon icon="doc" />
              </div>
            </div>
            <div>
              Horizontal logo 000x000
              <div>
                <Icon icon="doc" />
              </div>
            </div>
          </div>
        </Logos>
        <Colors>
          <b>Colors</b>
          <div>
            <div>
              Background Color
              <div>
                Body
                <div></div>
              </div>
              <div>
                Header
                <div></div>
              </div>
              <div>
                Footer
                <div></div>
              </div>
            </div>
            <div>
              Tab Colors
              <div>
                Default
                <div></div>
              </div>
              <div>
                Selected
                <div></div>
              </div>
            </div>
            <div>
              Text Colors
              <div>
                Body text
                <div></div>
              </div>
              <div>
                Links
                <div></div>
              </div>
              <div>
                Link hovered
                <div></div>
              </div>
              <div>
                Link pressed
                <div></div>
              </div>
            </div>
            <div>
              Buttons
              <div>
                Default
                <div></div>
              </div>
              <div>
                Pressed
                <div></div>
              </div>
            </div>
          </div>
        </Colors>
        <WelcomeContent>
          <b>Welcome Content</b>
        </WelcomeContent>
      </AppearanceLayout>
      <MobilePreview />
    </div>
  );
}
