import React, { useState, useEffect } from "react";
import { Transition } from "@headlessui/react";

const Carousel = ({ items, intervalTime }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, intervalTime); // Change slide every 2 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [items.length]);

  return (
    <div className="relative w-full h-full">
      <div className="overflow-hidden">
        {items.map((item, index) => (
          <Transition
            key={index + 11}
            show={index === currentIndex}
            enter="transition-opacity duration-700"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-700"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            className="absolute inset-0"
          >
            <div
              className={`carousel-item ${currentIndex === index && "active"}`}
              key={item.id}
            >
              <div className="image-wrapper">
                <img
                  className="d-block w-100"
                  src={item.image}
                  alt={item.title}
                />
              </div>
              <div className="carousel-caption">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          </Transition>
        ))}
      </div>
      <div className="carousel-indicators">
        {items.map((item, index) => (
          <span
            aria-hidden="true"
            key={index + 67}
            className={currentIndex === index ? "active" : ""}
            onClick={() => setCurrentIndex(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
