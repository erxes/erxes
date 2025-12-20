import React from 'react';

const Main = () => {
  console.log('ProductPlaces Main component is rendering');
  
  return (
    <div style={{
      padding: '50px',
      border: '5px solid green',
      backgroundColor: 'lightyellow',
      margin: '20px',
      fontSize: '24px'
    }}>
      <h1>🎉 PRODUCT PLACES IS WORKING! 🎉</h1>
      <p>If you see this, routing is working!</p>
      <p>URL: {window.location.href}</p>
      <p>Path: {window.location.pathname}</p>
    </div>
  );
};

export default Main;