async function onPaymentClick(payment, invoiceData, prefix) {
  const modalContent = document.querySelector('.modal-content');
  const image = document.getElementById('qr-code');
  const title = document.getElementById('paymentKind');
  const amount = document.getElementById('amount');
  const checkButton = document.getElementById('checkButton');
  const responseText = document.getElementById('apiMessage');
  const alertBlock = document.querySelector('.alert');
  const storepayBtn = document.getElementById('storepayBtn');
  const storepayInput = document.getElementById('storepayInput');
  const loader = document.querySelector('.loader');
  const deeplink = document.getElementById('deeplink');

  deeplink.href = ""
  deeplink.innerHTML = "";
    
  let isMobile = false;

  if (/Mobi/.test(navigator.userAgent)) {
    isMobile = true;
  }
  image.src = '';

  storepayBtn.style.display = 'none';
  storepayInput.style.display = 'none';

  let intervalId;

  responseText.style.display = 'none';
  responseText.innerHTML = '';

  const payments = [
    'qpay',
    'socialpay',
    'monpay',
    'storepay',
    'pocket',
    'wechatpay',
    'paypal',
    'qpayQuickqr',
  ];

  modalContent.classList.remove(...payments.map((p) => `${p}-modal`));

  const paymentObj = JSON.parse(payment);
  const invoiceObj = JSON.parse(invoiceData);

  const url = `${prefix}/pl:payment/gateway/updateInvoice`;

  const body = {
    selectedPaymentId: paymentObj._id,
    invoiceData: invoiceObj,
    paymentKind: paymentObj.kind,
  };

  loader.style.display = 'block';
  image.style.display = 'none';
  checkButton.style.display = 'none';

  const modalClass = paymentObj.kind.toLowerCase().includes('qpay')
    ? 'qpay-modal'
    : `${paymentObj.kind.toLowerCase()}-modal`;

  modalContent.classList.add(modalClass);

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (data.status === 'paid') {
    responseText.style.display = 'block';
    responseText.innerHTML =
      'Payment settled successfully, you can close this window now';
    loader.style.display = 'none';
    return;
  }

  const { apiResponse } = data.invoice;

  if (data.invoice._id) {
    intervalId = setInterval(async function () {
      const response = await fetch(`${prefix}/pl:payment/checkInvoice`, {
        method: 'POST',
        body: JSON.stringify({ invoiceId: data.invoice._id }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const paymentData = await response.json();

      if (paymentData.status === 'paid') {
        clearInterval(intervalId);
        const message = {
          fromPayment: true,
          message: 'paymentSuccessfull',
          invoiceId: data.invoice._id,
          contentType: data.invoice.contentType,
          contentTypeId: data.invoice.contentTypeId,
        };

        if (window.opener) {
          window.opener.postMessage(message, '*');
        }
        window.parent.postMessage(message, '*');

        responseText.style.display = 'block';
        responseText.innerHTML =
          'Payment settled successfully, you can close this window now';
      }
    }, 3000);
  }

  if (apiResponse.error && apiResponse.error === 'mobileNumber required') {
    checkButton.style.display = 'none';

    storepayBtn.style.display = 'block';
    storepayInput.style.display = 'block';
    responseText.style.display = 'block';
    responseText.innerHTML = 'Утасны дугаараа оруулна уу';

    storepayBtn.addEventListener('click', function () {
      onStorePayClick(paymentObj, invoiceObj, prefix);
    });
  }

  if (apiResponse.error && apiResponse.error !== 'mobileNumber required') {
    checkButton.style.display = 'none';

    alertBlock.style.display = 'block';
    alertBlock.innerHTML = apiResponse.error;
  }

  if (apiResponse.text) {
    responseText.style.display = 'block';
    responseText.innerHTML = apiResponse.text;
  }

  if (apiResponse.qrData) {
    const qrData = apiResponse.qrData;
    image.src = qrData;
    image.style.display = 'block';
    checkButton.style.display = 'block';
    alertBlock.style.display = 'none';

    checkButton.addEventListener('click', function () {
      fetch(`${prefix}/pl:payment/gateway/manualCheck`, {
        method: 'POST',
        body: JSON.stringify({ invoiceId: data.invoice._id }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.status === 'paid') {
            const message = {
              fromPayment: true,
              message: 'paymentSuccessfull',
              invoiceId: data.invoice._id,
              contentType: data.invoice.contentType,
              contentTypeId: data.invoice.contentTypeId,
            };

            if (window.opener) {
              window.opener.postMessage(message, '*');
            }
            window.parent.postMessage(message, '*');

            responseText.style.display = 'block';
            responseText.innerHTML =
              'Payment settled successfully, you can close this window now';

            clearInterval(intervalId);
          }
        });
    });
  }
  console.log('isMobile', isMobile)
  if (apiResponse.deeplink && isMobile) {
    deeplink.href = apiResponse.deeplink;
    deeplink.target = '_blank';
    deeplink.innerHTML = `Open in ${paymentObj.kind}`;
  }



  amount.innerHTML =
    invoiceObj.amount.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    }) + ' ₮';

  title.innerHTML = paymentObj.title;

  loader.style.display = 'none';
}

async function onStorePayClick(payment, invoice, prefix) {
  // Get the phone number input value
  const phoneNumber = document.getElementById('storepayInput').value;
  const responseText = document.getElementById('apiMessage');

  const url = `${prefix}/pl:payment/gateway/storepay`;

  const body = {
    selectedPaymentId: payment._id,
    invoiceData: invoice,
    paymentKind: payment.kind,
    phone: phoneNumber,
  };

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  const { apiResponse } = data.invoice;

  if (apiResponse.error && apiResponse.error !== 'mobileNumber required') {
    checkButton.style.display = 'none';
    const alertBlock = document.querySelector('.alert');
    alertBlock.style.display = 'block';
    alertBlock.innerHTML = apiResponse.error;
  }

  if (apiResponse.text) {
    responseText.style.display = 'block';
    responseText.innerHTML = apiResponse.text;
  }
}
