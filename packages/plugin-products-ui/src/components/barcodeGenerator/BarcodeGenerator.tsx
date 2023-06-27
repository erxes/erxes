import React, { useState, useEffect } from 'react';
import Barcode from 'react-barcode';
import QRCode from 'react-qr-code';
import dayjs from 'dayjs';

//erxes
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils';

// local
import LeftSidebar from './LeftSidebar';
import { BarcodeContentWrapper } from '../../styles';
import { BarcodeConfig, IProduct } from '../../types';
import { dateToShortStr } from '@erxes/ui/src/utils/core';

type Props = {
  barcode: string;
  product: IProduct;
};

const BarcodeGenerator = (props: Props) => {
  const { barcode, product } = props;

  const configStored: BarcodeConfig = {
    ...{
      row: 1,
      column: 1,
      width: 80,
      height: 100,
      margin: 0,
      date: Date.now(),
      isDate: false,
      isProductName: true,
      productNameFontSize: 11,
      isPrice: true,
      priceFontSize: 11,

      isBarcode: true,
      isBarcodeDescription: false,
      barWidth: 2,
      barHeight: 50,
      barcodeFontSize: 13,
      barcodeDescriptionFontSize: 8,

      isQrcode: true,
      qrSize: 128
    },
    ...JSON.parse(
      localStorage.getItem('erxes_product_barcodeGenerator_config') || '{}'
    )
  };

  if (new Date(configStored.date) < new Date()) {
    configStored.date = Date.now();
  }

  // Hooks
  const [config, setConfig] = useState<BarcodeConfig>(configStored);
  const [printElement, setPrintElement] = useState<any>(null);

  useEffect(() => {
    // If config date is in the past
    // Make it today
    const configCopy = { ...config };

    if (dayjs().isAfter(dayjs(config.date), 'date'))
      configCopy.date = Date.now();

    localStorage.setItem(
      'erxes_product_barcodeGenerator_config',
      JSON.stringify(configCopy)
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
            <div style="
              width: 100%;
              text-align: center;
              font-size: ${config.productNameFontSize}px !important;
            ">
              ${product.name && product.name}
            </div>`;
        }

        if (config.isBarcode) {
          printContentHTML += barcode.innerHTML;
        }

        if (config.isQrcode) {
          printContentHTML += qrcode.innerHTML;
        }

        if (config.isBarcodeDescription) {
          printContentHTML += `
            <div style="
              width: 100%;
              height: auto;
              font-size: ${config.barcodeDescriptionFontSize}px !important;
              text-align: justify;
            ">
              ${product.barcodeDescription && product.barcodeDescription}
            </div>
          `;
        }

        // BarcodePrice
        if (config.isPrice)
          printContentHTML += `
            <div style="
              width: 100%;
              text-align: center;
              margin-top: 10px;
              font-size: ${config.priceFontSize}px !important;
            ">
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

  const shortStr = dateToShortStr(config.date, 92, 'h');

  const content = (
    <>
      <BarcodeContentWrapper id="barcodePrintable">
        <div id="barcode">
          <Barcode
            type="EAN13"
            value={`${barcode}${config.isDate ? '_' + shortStr : ''}`}
            fontSize={config.barcodeFontSize}
            width={config.barWidth}
            height={config.barHeight}
          />
        </div>
        <div id="qrcode">
          <QRCode
            value={`${barcode}${config.isDate ? '_' + shortStr : ''}`}
            size={config.qrSize}
            level="Q"
          />
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
      transparent={true}
    />
  );
};

export default BarcodeGenerator;
