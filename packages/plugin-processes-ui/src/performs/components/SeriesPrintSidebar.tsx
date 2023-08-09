import React from 'react';
import Datetime from '@nateradebaugh/react-datetime';

//erxes
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormLabel from '@erxes/ui/src/components/form/Label';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Box from '@erxes/ui/src/components/Box';
import { FormWrapper, DateContainer } from '@erxes/ui/src/styles/main';
import { __ } from 'coreui/utils';

//local
import { SidebarContent } from '../../styles';
import { SeriesPrintConfig } from '../types';

type Props = {
  config: SeriesPrintConfig;
  handleChangeConfig: (key: string, value: any) => void;
  handlePrint: () => void;
};

const LeftSidebar = (props: Props) => {
  const { config, handleChangeConfig, handlePrint } = props;

  const renderGeneralSettings = () => (
    <Box name="barcodeGeneralSettings" title={__('General settings')} isOpen>
      <SidebarContent>
        <FormWrapper>
          <FormGroup>
            <FormLabel required={true}>{__('Row')}</FormLabel>
            <FormControl
              name="row"
              type="number"
              defaultValue={config.row}
              onChange={(e: any) =>
                handleChangeConfig('row', parseInt(e.target.value))
              }
            />
          </FormGroup>
          <FormGroup>
            <FormLabel required={true}>{__('Column')}</FormLabel>
            <FormControl
              name="column"
              type="number"
              defaultValue={config.column}
              onChange={(e: any) =>
                handleChangeConfig('column', parseInt(e.target.value))
              }
            />
          </FormGroup>
        </FormWrapper>
        <FormWrapper>
          <FormGroup>
            <FormLabel required={true}>{__('Width (mm)')}</FormLabel>
            <FormControl
              name="width"
              type="number"
              defaultValue={config.width}
              onChange={(e: any) =>
                handleChangeConfig('width', parseInt(e.target.value))
              }
            />
          </FormGroup>
          <FormGroup>
            <FormLabel required={true}>{__('Height (mm)')}</FormLabel>
            <FormControl
              name="height"
              type="number"
              defaultValue={config.height}
              onChange={(e: any) =>
                handleChangeConfig('height', parseInt(e.target.value))
              }
            />
          </FormGroup>
        </FormWrapper>
        <FormGroup>
          <FormLabel required={true}>{__('Margin (mm)')}</FormLabel>
          <FormControl
            name="margin"
            type="number"
            defaultValue={config.margin}
            onChange={(e: any) =>
              handleChangeConfig('margin', parseInt(e.target.value))
            }
          />
        </FormGroup>
        <FormGroup>
          <FormControl
            name="productName"
            componentClass="checkbox"
            defaultChecked={config.isSeriesNum}
            onChange={(e: any) =>
              handleChangeConfig('isSeriesNum', e.target.checked)
            }
          >
            {__('Show series text')}
          </FormControl>
        </FormGroup>
        <FormGroup>
          <FormLabel required={true}>{__('Product name font size')}</FormLabel>
          <FormControl
            name="productNameFontSize"
            type="number"
            defaultValue={config.productNameFontSize}
            onChange={(e: any) =>
              handleChangeConfig(
                'productNameFontSize',
                parseInt(e.target.value)
              )
            }
          />
        </FormGroup>
        <FormGroup>
          <FormLabel required={true}>{__('Price font size')}</FormLabel>
          <FormControl
            name="priceFontSize"
            type="number"
            defaultValue={config.priceFontSize}
            onChange={(e: any) =>
              handleChangeConfig('priceFontSize', parseInt(e.target.value))
            }
          />
        </FormGroup>
      </SidebarContent>
    </Box>
  );

  const renderBarcodeSettings = () => (
    <Box title={__('Barcode settings')}>
      <SidebarContent>
        <FormGroup>
          <FormControl
            name="barcode"
            componentClass="checkbox"
            defaultChecked={config.isBarcode}
            onChange={(e: any) =>
              handleChangeConfig('isBarcode', e.target.checked)
            }
          >
            {__('Show barcode')}
          </FormControl>
        </FormGroup>
        <FormWrapper>
          <FormGroup>
            <FormLabel required={true}>{__('Bar Width')}</FormLabel>
            <FormControl
              name="barWidth"
              type="number"
              defaultValue={config.barWidth}
              onChange={(e: any) =>
                handleChangeConfig('barWidth', parseInt(e.target.value))
              }
            />
          </FormGroup>
          <FormGroup>
            <FormLabel required={true}>{__('Bar Height')}</FormLabel>
            <FormControl
              name="barHeight"
              type="number"
              defaultValue={config.barHeight}
              onChange={(e: any) =>
                handleChangeConfig('barHeight', parseInt(e.target.value))
              }
            />
          </FormGroup>
        </FormWrapper>
        <FormGroup>
          <FormLabel required={true}>{__('Barcode Font Size (px)')}</FormLabel>
          <FormControl
            name="barcodeFontSize"
            type="number"
            defaultValue={config.barcodeFontSize}
            onChange={(e: any) =>
              handleChangeConfig('barcodeFontSize', parseInt(e.target.value))
            }
          />
        </FormGroup>
        <FormGroup>
          <FormLabel required={true}>
            {__('Barcode Description Font Size (px)')}
          </FormLabel>
          <FormControl
            name="barcodeDescriptionFontSize"
            type="number"
            defaultValue={config.barcodeDescriptionFontSize}
            onChange={(e: any) =>
              handleChangeConfig(
                'barcodeDescriptionFontSize',
                parseInt(e.target.value)
              )
            }
          />
        </FormGroup>
      </SidebarContent>
    </Box>
  );

  const renderQrcodeSettings = () => (
    <Box title={__('QRCode Settings')}>
      <SidebarContent>
        <FormWrapper>
          <FormGroup>
            <FormControl
              name="qrcode"
              componentClass="checkbox"
              defaultChecked={config.isQrcode}
              onChange={(e: any) =>
                handleChangeConfig('isQrcode', e.target.checked)
              }
            >
              {__('Show QRCode')}
            </FormControl>
          </FormGroup>
        </FormWrapper>
        <FormGroup>
          <FormLabel required={true}>{__('QR Size')}</FormLabel>
          <FormControl
            name="qrsize"
            type="number"
            defaultValue={config.qrSize}
            onChange={(e: any) =>
              handleChangeConfig('qrSize', parseInt(e.target.value))
            }
          />
        </FormGroup>
      </SidebarContent>
    </Box>
  );

  return (
    <Wrapper.Sidebar>
      {renderGeneralSettings()}
      {renderBarcodeSettings()}
      {renderQrcodeSettings()}

      <Button btnStyle="primary" onClick={handlePrint} block>
        {__('Print')}
      </Button>
    </Wrapper.Sidebar>
  );
};

export default LeftSidebar;
