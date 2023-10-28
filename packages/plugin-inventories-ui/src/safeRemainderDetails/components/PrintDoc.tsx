import dayjs from 'dayjs';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// erxes
import Button from '@erxes/ui/src/components/Button';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  safeRemainder: any;
  safeRemainderItems: any[];
};

const displayNumber = (value: number) => {
  return (value || 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
};

export default function List(props: Props) {
  const { safeRemainder, safeRemainderItems } = props;

  const breadcrumb = [
    { title: __('Safe Remainders'), link: '/inventories/safe-remainders' },
    { title: __('Safe Remainder') }
  ];

  // Hooks
  const [printElement, setPrintElement] = useState<any>(null);

  useEffect(() => {
    updatePrint();

    if (printElement) {
      printElement.contentWindow.focus();
      printElement.contentWindow.print();
    }
  }, []);

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
        <div class="center title">
          <h2>Тоолсон</h2>
        </div>
        <div>
          <span><Strong>Date: </Strong>
            ${dayjs(safeRemainder.beginDate).format(
              'YYYY-MM-DD HH:mm'
            )} - ${dayjs(safeRemainder.endDate).format('YYYY-MM-DD HH:mm')}
          </span>
          <span>
            <Strong>Branch: </Strong>
            ${safeRemainder.branch && safeRemainder.branch.title}
          </span>
          <span>
            <Strong>Department: </Strong>
            ${safeRemainder.department && safeRemainder.department.title}
          </span>
        </div>
        <table>
        <thead>
          <tr>
            <th>${__('Product')}</th>
            <th>${__('Date')}</th>
            <th>${__('Live')}</th>
            <th>${__('UOM')}</th>
            <th>${__('Status')}</th>
            <th>${__('Safe')}</th>
            <th>${__('Diff')}</th>
          </tr>
        </thead>
    `;

    for (const remainderItem of safeRemainderItems) {
      const {
        product,
        modifiedAt,
        count,
        preCount,
        uom,
        status
      } = remainderItem;

      printContentHTML += `<tr>
        <td>${product && `${product.code} - ${product.name} `}</td>
        <td>${moment(modifiedAt).format('YYYY/MM/DD HH:mm:ss')}</td>
        <td class="text-right">
          ${displayNumber(preCount)}
        </td>
        <td>${uom}</td>
        <td>${status}</td>
        <td class="text-right">
          ${displayNumber(count)}
        </td>
        <td class="text-right">
          ${displayNumber(count - preCount)}
        </td>
      </tr>`;
    }

    printContentHTML += `
      </table>
      <div>
        <p className="signature">
          <label>Тооллого хийсэн:</label>
          <span> _____________________</span>
          <span>/${safeRemainder.modifiedUser?.details?.fullName || ''}/</span>
        </p>
        <p className="signature">
          <label>Хянасан:</label>
          <span> _____________________</span>
        </p>
      </div>
      
      </div></div>
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
          padding: 10mm;
          margin-top: -15mm;
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

        box-shadow: 1px solid black;
        border-collapse: collapse;

        thead {
          th {
            border: 1px solid #eee;
            border-top: none;
            text-align: center;
          }
        }

        tbody {
          td {
            border-bottom: none;
            text-align: center;
          }

          tr td {
            padding-top: 0px;
            padding-bottom: 1px;
          }
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
      header={
        <Wrapper.Header
          title={__('Remainder detail')}
          breadcrumb={breadcrumb}
        />
      }
      actionBar={
        <Wrapper.ActionBar
          right={
            <>
              <Link
                to={`/inventories/safe-remainders/details/${props.safeRemainder._id}/${location.search}`}
              >
                <Button btnStyle="success" icon="check-circle" size="small">
                  {__('Back')}
                </Button>
              </Link>
              <Button
                btnStyle="success"
                icon="check-circle"
                size="small"
                onClick={handlePrint}
              >
                {__('Print')}
              </Button>
            </>
          }
        />
      }
      content={content}
      transparent={true}
    />
  );
}
