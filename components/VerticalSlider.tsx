'use client';

import { useState, useEffect, useRef } from 'react';

interface ImageData {
  id: string;
  imageUrl: string;
  date: string;
  createdAt: string;
}

interface Settings {
  headerText: string;
  subheaderText: string;
}

export default function VerticalSlider() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [settings, setSettings] = useState<Settings>({
    headerText: 'DAILY PK 55 REPORT AND ALL KHABAR',
    subheaderText: 'Stay Updated with the Latest News'
  });
  const sliderRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);

  useEffect(() => {
    // Fetch settings
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`)
      .then(res => res.json())
      .then((data: Settings) => {
        setSettings(data);
      })
      .catch(err => console.error('Failed to fetch settings:', err));

    // Fetch images
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/images`)
      .then(res => res.json())
      .then((data: ImageData[]) => {
        setImages(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch images:', err);
        setLoading(false);
      });
  }, []);

  // Removed auto-play functionality

  const nextSlide = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (!touchStartY.current || !touchEndY.current) return;

    const distance = touchStartY.current - touchEndY.current;
    const isSwipeUp = distance > 50;
    const isSwipeDown = distance < -50;

    if (isSwipeUp) {
      nextSlide();
    }
    if (isSwipeDown) {
      prevSlide();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
          <p className="text-gray-900 text-xl font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-gray-900 text-2xl">No images available</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="md:min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header Text */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 mb-3">
            {settings.headerText}
          </h1>
          <div className="w-32 h-1.5 bg-gradient-to-r from-blue-600 to-blue-800 mx-auto rounded-full"></div>
          <p className="text-gray-600 mt-4 text-lg">{settings.subheaderText}</p>
        </div>

        {/* Slider Container */}
        <div className="relative bg-white rounded-2xl overflow-hidden   border-gray-200">
          <div
            ref={sliderRef}
            className="relative h-[450px] md:h-[550px]"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Images Container with vertical slide animation */}
            <div 
              className="absolute inset-0 transition-transform duration-500 ease-in-out"
              style={{ 
                transform: `translateY(-${currentIndex * 100}%)`,
              }}
            >
              {images.map((image, index) => (
                <div 
                  key={image.id} 
                  className="w-full h-[450px] md:h-[550px] flex items-center justify-center"
                >
                  <img
                    src={image.imageUrl}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>

            {/* Navigation Buttons - Desktop (side buttons) */}
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="hidden md:block absolute left-4 top-1/2 transform -translate-y-1/2 bg-blue-600/90 hover:bg-blue-700 text-white p-4 rounded-full transition-all z-10 disabled:opacity-20 disabled:cursor-not-allowed shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              disabled={currentIndex === images.length - 1}
              className="hidden md:block absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-600/90 hover:bg-blue-700 text-white p-4 rounded-full transition-all z-10 disabled:opacity-20 disabled:cursor-not-allowed shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Navigation Buttons - Mobile (top and bottom) */}
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="md:hidden absolute top-[-10px] left-1/2 transform -translate-x-1/2 text-black p-3 rounded-full transition-all z-10 disabled:opacity-20 disabled:cursor-not-allowed disabled:hidden" 
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              disabled={currentIndex === images.length - 1}
              className="md:hidden absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 text-black p-3 rounded-full transition-all z-10 disabled:opacity-20 disabled:cursor-not-allowed shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Slide Indicators */}
          <div className="hidden md:absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-blue-600 w-10' 
                    : 'bg-gray-300 hover:bg-gray-400 w-2.5'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Counter and Instructions */}
        {/* <div className="flex justify-between items-center mt-6 px-2">
          <p className="text-gray-400 text-sm">
            {currentIndex + 1} / {images.length}
          </p>
          <p className="text-gray-400 text-sm md:hidden">Swipe up/down to navigate</p>
          <p className="text-gray-400 text-sm hidden md:block">Use arrow buttons to navigate</p>
        </div> */}
      </div>
    </div>
  );
}
