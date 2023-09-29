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
  const bankButtons = document.getElementById('bank-buttons');

  deeplink.href = '';
  deeplink.innerHTML = '';

  let isMobile = false;

  if (
    /Mobi/.test(navigator.userAgent) ||
    navigator.userAgent === 'Android' ||
    navigator.userAgent === 'iPhone' ||
    navigator.userAgent === 'Social Pay' || 
    navigator.userAgent === 'socialpay'
  ) {
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
    intervalId = setInterval(async function() {
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

    storepayBtn.addEventListener('click', function() {
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

    checkButton.addEventListener('click', function() {
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

  // hide bank buttons
  bankButtons.style.display = 'none';

  if (apiResponse.deeplink && isMobile) {
    deeplink.style.display = 'block';
    deeplink.href = apiResponse.deeplink;
    deeplink.target = 'blank';
    deeplink.innerHTML = `Open in ${paymentObj.kind}`;

    window.location.href = apiResponse.deeplink;
    window.open(apiResponse.deeplink, 'blank');
  }

  if (['qpay', 'qpayQuickqr'].includes(data.invoice.paymentKind) && isMobile) {
    // hide qr image
    image.style.display = 'none';
    bankButtons.style.display = 'block';

    // clear previous bank buttons
    while (bankButtons.firstChild) {
      bankButtons.removeChild(bankButtons.firstChild);
    }

    const urls = apiResponse.urls || [];

    urls.map((bankUrl) => {
      const bankButton = document.createElement('button');
      bankButton.classList.add('bank');
      bankButton.innerHTML = `<img src="${bankUrl.logo}" class="urlLogo">`;
      bankButton.addEventListener('click', function() {
        window.open(bankUrl.link, 'blank');
        window.location.href = bankUrl.link;
      });
      document.getElementById('bank-buttons').appendChild(bankButton);
    });
  }

  let amountValue = data.invoice.amount;

  if (data.invoice.couponAmount) {
    amountValue = data.invoice.amount - data.invoice.couponAmount;
    amountValue = amountValue < 0 ? 0 : amountValue;
  }

  amount.innerHTML =
    amountValue.toLocaleString(undefined, {
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

async function onCouponClick(invoiceData, prefix) {
  const url = `${prefix}/pl:payment/gateway/monpay/coupon`;

  const body = {
    invoiceData: JSON.parse(invoiceData),
    couponCode: document.getElementById('coupon-input').value,
  };

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status !== 200) {
    const responseText = document.getElementById('coupon-response');
    responseText.style.display = 'block';
    responseText.innerHTML = 'Купон хүчингүй байна';
    return;
  }

  const { invoice } = await response.json();

  // if coupon applied hide coupon input
  if (invoice.couponCode && invoice.couponAmount) {
    document.getElementById('monpay-coupon').style.display = 'none';
  }

  // update invoice amount

  let amount = invoice.amount - invoice.couponAmount;

  if (amount < 0) {
    amount = 0;
  }

  document.getElementById('payment-amount').innerHTML =
    amount.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    }) + ' ₮';
}
