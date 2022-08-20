import React from 'react';

export default contract => {
  return `
    <p>
      ${contract.number} дугаар бүхий гэрээний хэвлэлт
    </p>

    <p>
      ${contract.leaseAmount} төгрөгийн зээл авлаа
    </p>
  `;
};
