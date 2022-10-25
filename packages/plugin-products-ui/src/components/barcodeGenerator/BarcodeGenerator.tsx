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
  BarcodePrintContent
} from '../../styles';

type Props = {
  code: string;
};

const BarcodeGenerator = (props: Props) => {
  const { code = '' } = props;
  const [row, setRow] = useState<number>(1);
  const [column, setColumn] = useState<number>(1);
  const [width, setWidth] = useState<number>(1);
  const [height, setHeight] = useState<number>(50);
  const [fontSize, setFontSize] = useState<number>(13);

  const handleClickPrint = () => {
    let content: any = document.getElementById('barcodePrintable');
    let printElement: any = document.getElementById('ifmcontentstoprint');
    let printElementCW: any = printElement.contentWindow;
    printElementCW.document.open();
    printElementCW.document.write(
      `<div style='display: flex; width: 100vw; align-items: center; justify-content: center;'>`
    );
    printElementCW.document.write(content.innerHTML);
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
        <Barcode
          type="EAN13"
          value={code}
          width={width}
          height={height}
          fontSize={fontSize}
        />
      );
    }

    for (let index = 1; index <= row; index++) {
      renderRow.push(<BarcodePrintContent>{renderColumn}</BarcodePrintContent>);
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
          <FormLabel required={true}>Width</FormLabel>
          <FormControl
            name="width"
            type="number"
            defaultValue={width}
            onChange={(e: any) => setWidth(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel required={true}>Height</FormLabel>
          <FormControl
            name="height"
            type="number"
            defaultValue={height}
            onChange={(e: any) => setHeight(e.target.value)}
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
