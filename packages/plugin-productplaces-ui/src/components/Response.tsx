import React from 'react';

export default content => {
  return `
    <!DOCTYPE html>
    <html>

    <head>
      <meta charset="utf-8">
      <link rel="stylesheet" href="https://nmgplugins.s3.us-west-2.amazonaws.com/ebarimt/print.css" media="print">
      <script src="https://nmgplugins.s3.us-west-2.amazonaws.com/ebarimt/jquery.js"></script>
    </head>

    <body>
      <div class="wrapper">
      ${content}
      </div>
      <style type="text/css">
        /*receipt*/
        html {
          color: #000;
          font-size: 13px;
          font-family: Arial 'Helvetica Neue' Helvetica sans-serif;
        }

        body {
          margin: 0;
        }

        .wrapper {
        }

        .receipt {
          width: 270px;
        }

        .splitter {
          text-align: center;
          border-bottom: 1px dashed #444
        }

        table {
          width: 100%;
          max-width: 100%;

        }

        table tr:last-child td {
          border-bottom: 1px dashed #444;

        }

        table thead th {
          padding: 5px;
          border-top: 1px dashed #444;
          border-bottom: 1px dashed #444;
          text-align: left;
        }

        table tbody td {
          padding: 5px;
          text-align: left;
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
          margin-top: 10px;
        }

        .total label {
          font-weight: bold;
        }
      </style>
      <script>
        setTimeout(
          window.print(),
          150
        )
      </script>
    </body>

    </html>
  `;
};
