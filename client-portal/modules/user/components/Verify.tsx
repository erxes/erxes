import React from 'react';

type Props = {
  verify: any;
};

function VerifyComponent(props: Props) {
  return (
    <div>
      <p className='sub-title'>Та google эрхээр нэвтрэхдээ итгэлтэй байна уу</p>
      <button className='mt-1 with-shadow' onClick={() => props.verify()}>
        Зөвшөөрөх
      </button>
    </div>
  );
}

export default VerifyComponent;
