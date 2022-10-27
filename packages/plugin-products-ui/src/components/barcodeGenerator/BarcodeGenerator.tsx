import React, { useState, useEffect } from 'react';
import Barcode from 'react-barcode';
import QRCode from 'react-qr-code';

//erxes
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils';

// local
import LeftSidebar from './LeftSidebar';
import { BarcodeContentWrapper } from '../../styles';
import { BarcodeConfig, IProduct } from '../../types';

type Props = {
  barcode: string;
  product: IProduct;
  loading: boolean;
};

const BarcodeGenerator = (props: Props) => {
  const { barcode, product, loading } = props;

  const configStored: BarcodeConfig = JSON.parse(
    localStorage.getItem('erxes_product_barcodeGenerator_config') ||
      `{
      "row": 1,
      "column": 1,
      "width": 65,
      "height": 75,
      "margin": 0,
      "isProductName": true,
      "isBarcode": true,
      "barWidth": 2,
      "barHeight": 50,
      "fontSize": 13,
      "isQrcode": true,
      "qrSize": 128,
      "isPrice": true
    }`
  );

  // Hooks
  const [config, setConfig] = useState<BarcodeConfig>(configStored);
  const [printElement, setPrintElement] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem(
      'erxes_product_barcodeGenerator_config',
      JSON.stringify(config)
    );

    updatePrint();
  }, [config, product]);

  // Functions
  const handleChangeConfig = (key: string, value: any) => {
    const configCopy = { ...config };
    configCopy[key] = value;
    setConfig(configCopy);
  };

  const updatePrint = () => {
    const iframeElement: any = document.getElementById('ifmcontentstoprint');
    const barcode: any = document.getElementById('barcode');
    const qrcode: any = document.getElementById('qrcode');

    let printContentHTML = '';

    printContentHTML += `
      <div style="
        display: flex;
        flex-direction: column;
        width: 100vw;
        align-items: center;
        justify-content: center;
        font-family: 'Arial';
      ">
    `;

    for (let index = 1; index <= config.row; index++) {
      // BarcodeRow
      printContentHTML += `<div style="
          display: flex;
          align-items: center;
          justify-content: center;
        ">`;

      for (let index = 1; index <= config.column; index++) {
        // BarcodeItem
        printContentHTML += `
          <div style="
            width: ${config.width}mm;
            height: ${config.height}mm;
            margin: ${config.margin}mm;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: white;
          ">`;

        if (config.isProductName) {
          printContentHTML += `
            <div style=" width: 100%; text-align: center;">
              ${product.name && product.name}
            </div>`;
        }

        if (config.isBarcode) {
          printContentHTML += barcode.innerHTML;
        }

        if (config.isQrcode) {
          printContentHTML += qrcode.innerHTML;
        }

        // BarcodePrice
        if (config.isPrice)
          printContentHTML += `
            <div style="width: 100%; text-align: center; margin-top: 10px;">
              ${__('Price')}: ${product.unitPrice && product.unitPrice}
            </div>
          `;

        printContentHTML += `</div>`;
      }

      printContentHTML += `</div>`;
    }

    printContentHTML += `</div>`;

    iframeElement.contentWindow.document.body.innerHTML = printContentHTML;

    setPrintElement(iframeElement);
  };

  const handlePrint = () => {
    if (printElement) {
      printElement.contentWindow.focus();
      printElement.contentWindow.print();
    }
  };

  const title = product ? product.name : 'Unknown';

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Product & Service'), link: '/settings/product-service' },
    { title, link: `/settings/product-service/details/${product._id}` },
    { title: __('Barcode Generator') }
  ];

  const content = (
    <>
      <BarcodeContentWrapper id="barcodePrintable">
        <div id="barcode">
          <Barcode
            type="EAN13"
            value={barcode}
            fontSize={config.fontSize}
            width={config.barWidth}
            height={config.barHeight}
          />
        </div>
        <div id="qrcode">
          <QRCode value={barcode} size={config.qrSize} />
        </div>
      </BarcodeContentWrapper>
      <iframe
        id="ifmcontentstoprint"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          outline: 'none',
          backgroundColor: '#F0F0F0'
        }}
      />
    </>
  );

  return (
    <Wrapper
      header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
      leftSidebar={
        <LeftSidebar
          config={config}
          handleChangeConfig={handleChangeConfig}
          handlePrint={handlePrint}
        />
      }
      content={content}
    />
  );
};

export default BarcodeGenerator;
