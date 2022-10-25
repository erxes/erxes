import React, { useState } from 'react';
import Barcode from 'react-barcode';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormLabel from '@erxes/ui/src/components/form/Label';
import FormGroup from '@erxes/ui/src/components/form/Group';

// local
import {
  BarcodeInputWrapper,
  BarcodePrintWrapper,
  BarcodeColumn,
  BarcodeWrapper
} from '../../styles';

type Props = {
  code: string;
};

const BarcodeGenerator = (props: Props) => {
  const { code = '' } = props;
  const config: any = JSON.parse(
    localStorage.getItem('erxes_product_barcodeGenerator_config') || '{}'
  );

  const [row, setRow] = useState<number>(config.row ? config.row : 100);
  const [column, setColumn] = useState<number>(
    config.column ? config.column : 1
  );
  const [width, setWidth] = useState<number>(config.width ? config.width : 1);
  const [height, setHeight] = useState<number>(
    config.height ? config.height : 50
  );
  const [barWidth, setBarWidth] = useState<number>(
    config.barWidth ? config.barWidth : 2
  );
  const [barHeight, setBarHeight] = useState<number>(
    config.barHeight ? config.barHeight : 100
  );
  const [fontSize, setFontSize] = useState<number>(
    config.fontSize ? config.fontSize : 13
  );

  React.useEffect(() => {
    const config = {
      row,
      column,
      width,
      height,
      barWidth,
      barHeight,
      fontSize
    };

    localStorage.setItem(
      'erxes_product_barcodeGenerator_config',
      JSON.stringify(config)
    );
  }, [row, column, width, height, barWidth, barHeight, fontSize]);

  const handleClickPrint = () => {
    let printElement: any = document.getElementById('ifmcontentstoprint');
    let barcode: any = document.getElementById('barcode');
    let printElementCW: any = printElement.contentWindow;
    printElementCW.document.open();
    printElementCW.document.write(
      `<div style='
        display: flex;
        flex-direction: column;
        width: 100vw;
        align-items: center;
        justify-content: center;
      '>`
    );

    for (let index = 1; index <= column; index++) {
      printElementCW.document.write(
        `<div style='
          display: flex;
          align-items: center;
          justify-content: center;
        '>`
      );

      for (let index = 1; index <= row; index++) {
        printElementCW.document.write(
          `<div style='
            width: ${width}mm;
            height: ${height}mm;
            display: flex;
            align-items: center;
            justify-content: center;
          '>`
        );
        printElementCW.document.write(barcode.innerHTML);

        printElementCW.document.write(`</div>`);
      }

      printElementCW.document.write(`</div>`);
    }

    // printElementCW.document.write(content.innerHTML);
    printElementCW.document.write(`</div>`);
    printElementCW.document.close();
    printElementCW.focus();
    printElementCW.print();
  };

  const renderBarcode = () => {
    let renderRow: any = [];
    let renderColumn: any = [];

    for (let index = 1; index <= column; index++) {
      renderColumn.push(
        <BarcodeWrapper width={width} height={height} id="barcode">
          <Barcode
            type="EAN13"
            value={code}
            fontSize={fontSize}
            width={barWidth}
            height={barHeight}
          />
        </BarcodeWrapper>
      );
    }

    for (let index = 1; index <= row; index++) {
      renderRow.push(<BarcodeColumn>{renderColumn}</BarcodeColumn>);
    }

    return renderRow;
  };

  return (
    <>
      <iframe
        id="ifmcontentstoprint"
        style={{
          height: '0px',
          width: '0px',
          position: 'absolute',
          display: 'flex'
        }}
      />
      <BarcodeInputWrapper>
        <FormGroup>
          <FormLabel required={true}>Row</FormLabel>
          <FormControl
            name="row"
            type="number"
            defaultValue={row}
            onChange={(e: any) => setRow(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel required={true}>Column</FormLabel>
          <FormControl
            name="column"
            type="number"
            defaultValue={column}
            onChange={(e: any) => setColumn(e.target.value)}
          />
        </FormGroup>
      </BarcodeInputWrapper>
      <BarcodeInputWrapper>
        <FormGroup>
          <FormLabel required={true}>Width (mm)</FormLabel>
          <FormControl
            name="width"
            type="number"
            defaultValue={width}
            onChange={(e: any) => setWidth(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel required={true}>Height (mm)</FormLabel>
          <FormControl
            name="height"
            type="number"
            defaultValue={height}
            onChange={(e: any) => setHeight(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel required={true}>Bar Width</FormLabel>
          <FormControl
            name="barWidth"
            type="number"
            defaultValue={barWidth}
            onChange={(e: any) => setBarWidth(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel required={true}>Bar Height</FormLabel>
          <FormControl
            name="barHeight"
            type="number"
            defaultValue={barHeight}
            onChange={(e: any) => setBarHeight(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel required={true}>Font Size</FormLabel>
          <FormControl
            name="font size"
            type="number"
            defaultValue={fontSize}
            onChange={(e: any) => setFontSize(e.target.value)}
          />
        </FormGroup>
      </BarcodeInputWrapper>
      <BarcodeInputWrapper>
        <Button btnStyle="primary" onClick={handleClickPrint}>
          Print
        </Button>
      </BarcodeInputWrapper>
      <BarcodePrintWrapper id="barcodePrintable">
        {renderBarcode()}
      </BarcodePrintWrapper>
    </>
  );
};

export default BarcodeGenerator;
