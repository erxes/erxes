import React from 'react';
import Datetime from '@nateradebaugh/react-datetime';

//erxes
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormLabel from '@erxes/ui/src/components/form/Label';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { FormWrapper, DateContainer } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';

//local
import { SidebarTitle } from '../../styles';
import { BarcodeConfig } from '../../types';

type Props = {
  config: BarcodeConfig;
  handleChangeConfig: (key: string, value: any) => void;
  handlePrint: () => void;
};

const LeftSidebar = (props: Props) => {
  const { config, handleChangeConfig, handlePrint } = props;

  return (
    <Wrapper.Sidebar>
      <SidebarTitle>{__('General settings')}</SidebarTitle>
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
          name="addDate"
          componentClass="checkbox"
          defaultChecked={config.isDate}
          onChange={(e: any) => handleChangeConfig('isDate', e.target.checked)}
        >
          {__('Add date')}
        </FormControl>
      </FormGroup>
      <FormGroup>
        <FormLabel>{__('Date')}</FormLabel>
        <DateContainer>
          <Datetime
            dateFormat="MM/DD/YYYY"
            closeOnSelect={true}
            utc={true}
            timeFormat={false}
            defaultValue={new Date(config.date)}
            onChange={(e: any) => handleChangeConfig('date', e.getTime())}
          />
        </DateContainer>
      </FormGroup>
      <FormGroup>
        <FormControl
          name="productName"
          componentClass="checkbox"
          defaultChecked={config.isProductName}
          onChange={(e: any) =>
            handleChangeConfig('isProductName', e.target.checked)
          }
        >
          {__('Show product name')}
        </FormControl>
      </FormGroup>
      <FormGroup>
        <FormControl
          name="price"
          componentClass="checkbox"
          defaultChecked={config.isPrice}
          onChange={(e: any) => handleChangeConfig('isPrice', e.target.checked)}
        >
          {__('Show price')}
        </FormControl>
      </FormGroup>
      <SidebarTitle>{__('Barcode settings')}</SidebarTitle>
      <FormWrapper>
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
      </FormWrapper>
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
        <FormLabel required={true}>{__('Font Size')}</FormLabel>
        <FormControl
          name="font size"
          type="number"
          defaultValue={config.fontSize}
          onChange={(e: any) =>
            handleChangeConfig('fontSize', parseInt(e.target.value))
          }
        />
      </FormGroup>
      <SidebarTitle>{__('QRCode settings')}</SidebarTitle>
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
      <Button btnStyle="primary" onClick={handlePrint} block>
        {__('Print')}
      </Button>
    </Wrapper.Sidebar>
  );
};

export default LeftSidebar;
