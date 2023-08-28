import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { SUBMENU } from '../../constants';
import LeftSidebar from './LogLeftSidebar';

type Props = {
  params: any;
  remaindersLog: any;
};

const RemaindersLog = (props: Props) => {
  const { remaindersLog, params } = props;

  const [printElement, setPrintElement] = useState<any>(null);

  useEffect(() => {
    updatePrint();
  }, [params, remaindersLog]);

  const updatePrint = () => {
    const iframeElement: any = document.getElementById('ifmcontentstoprint');

    let printContentHTML = '';

    printContentHTML += `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <link rel="stylesheet" href="https://nmgplugins.s3.us-west-2.amazonaws.com/ebarimt/print.css" media="print">
    </head>
    <body>
      <div class="wrapper">
      <div class="paper">
          <div><span>Date: ${dayjs(params.beginDate).format(
            'YYYY-MM-DD HH:mm'
          )} - ${dayjs(params.endDate).format('YYYY-MM-DD HH:mm')}</span></div>
          <table>
          <thead>
            <th>Code</th>
            <th>Name</th>
            <th>First balance</th>
            <th>Receipt</th>
            <th>Spend</th>
            <th>Final balance</th>
          </thead>
    `;

    for (const branchId of Object.keys(remaindersLog)) {
      const branchValue = remaindersLog[branchId];
      const branch = branchValue.branch || '';
      const branchValues = branchValue.values || ({} as any);

      printContentHTML += `<tr>
        <td colspan="2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${branch}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>`;
      for (const departmentId of Object.keys(branchValues)) {
        const departmentValue = branchValues[departmentId];
        const department = departmentValue.department || {};
        const departmentValues = departmentValue.values || ({} as any);

        printContentHTML += `<tr>
          <td colspan="2">&nbsp;&nbsp;&nbsp;&nbsp;${department}</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>`;

        for (const productId of Object.keys(departmentValues)) {
          const productValue = departmentValues[productId];
          const product = productValue.product || {};
          const values = productValue.values || ({} as any);

          printContentHTML += `<tr>
            <td colspan="2">${product}</td>
            <td>${(values.begin || 0).toLocaleString()}</td>
            <td>${(values.receipt || 0).toLocaleString()}</td>
            <td>${(values.spend || 0).toLocaleString()}</td>
            <td>${(values.end || 0).toLocaleString()}</td>
          </tr>`;

          if (params.isDetailed) {
            for (const perform of values.performs || []) {
              printContentHTML += `<tr class='detail'>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;${dayjs(perform.date).format(
                  'YYYY-MM-DD HH:mm'
                )}</td>
                <td>${perform.spec}</td>
                <td></td>
                <td>${(perform.item.receipt || 0).toLocaleString()}</td>
                <td>${(perform.item.spend || 0).toLocaleString()}</td>
                <td></td>
              </tr>`;
            }
          }
        }
      }
    }

    printContentHTML += `
      </table></div></div>
      <style type="text/css">
        html {
          color: #000;
          font-size: 13px;
          font-family: Arial 'Helvetica Neue' Helvetica sans-serif;
        }

        body {
          margin: 0;
        }

        .wrapper {
          color: #000;
          display: flex;
          width: 100vw;
          align-items: center;
          justify-content: center;
        }

        .paper {
          min-width: 210mm;
          min-height: 297mm;
          padding: 5mm;
          background-color: white;
        }

        .splitter {
          text-align: center;
          border-bottom: 1px dashed #444
        }

        table {
          width: 100%;
          max-width: 100%;
        }

        .detail {
          color: #444;
          font-style: italic;
        }

        table tr td  {
          border-bottom: 1px solid #eeeeee;
        }

        table thead th {
          padding: 5px;
          border-top: 1px dashed #444;
          border-bottom: 1px dashed #444;
          text-align: left;
        }

        table tbody tr {
          padding: 0px;
          text-align: left;
          border-bottom: 1px solid #444
        }

        .center {
          text-align: center;
        }

        p {
          margin-bottom: 10px;
          margin-top: 5px;
        }

        .text-right {
          text-align: right;
        }

        .inventory-info {
          font-weight: bold;
        }

        .total {
          margin-top: 30px;
        }

        .total label {
          font-weight: bold;
        }
      </style>
      </body>

      </html>
    `;

    iframeElement.contentWindow.document.body.innerHTML = printContentHTML;

    setPrintElement(iframeElement);
  };

  const handlePrint = () => {
    if (printElement) {
      printElement.contentWindow.focus();
      printElement.contentWindow.print();
    }
  };

  const content = (
    <>
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
      header={<Wrapper.Header title={__('Remainders LOG')} submenu={SUBMENU} />}
      leftSidebar={<LeftSidebar handlePrint={handlePrint} />}
      content={content}
      transparent={true}
    />
  );
};

export default RemaindersLog;
