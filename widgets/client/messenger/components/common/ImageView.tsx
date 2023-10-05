import React, { useState } from 'react';

interface ImageViewerProps {
  imageUrl: string;
}

const ImageView: React.FC<ImageViewerProps> = ({ imageUrl }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <img
        src={imageUrl}
        alt='Thumbnail'
        onClick={openModal}
        style={{ cursor: 'pointer' }}
      />
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'auto',
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '5px',
              boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)',
              position: 'relative', // Corrected colon here
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                fontSize: '24px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
              onClick={closeModal}
            >
              &times;
            </span>
            <img src={imageUrl} alt='Full-size' />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageView;
