import React, { useEffect, useRef, useState } from 'react';

const CarColorChanger: React.FC = () => {
  console.log('CarColorChanger');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [color, setColor] = useState<string>('red');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Safeguard to ensure canvas is not null
    const ctx = canvas.getContext('2d');
    if (!ctx) return; // Safeguard to ensure context is not null

    const img = new Image();
    img.src = '/images/prius.png'; // Replace with the actual car image path
    img.onload = () => {
      imgRef.current = img;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  }, []);

  const applyColor = () => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Check if canvas exists
    const ctx = canvas.getContext('2d');
    if (!ctx || !imgRef.current) return; // Check if context and image are valid

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the original image
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);

    // Apply the color overlay
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Reset the global composite operation
    ctx.globalCompositeOperation = 'source-over';
  };

  return (
    <div>
      <canvas ref={canvasRef} width={500} height={300} />
      <div>
        <label htmlFor="colorPicker">Choose a color:</label>
        <select id="colorPicker" value={color} onChange={(e) => setColor(e.target.value)}>
          <option value="red">Red</option>
          <option value="blue">Blue</option>
          <option value="green">Green</option>
          <option value="yellow">Yellow</option>
        </select>
        <button onClick={applyColor}>Change Color</button>
      </div>
    </div>
  );
};

export default CarColorChanger;
