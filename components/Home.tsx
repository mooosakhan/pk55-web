'use client';

import React, { useState, useEffect } from 'react';

interface BannerData {
  discountPercentage: number;
  date: string;
  heading: string;
  description: string;
  imageUrl: string;
}

export default function HeroSection() {
  const getDefaultDiscount = () => {
    // Get current time in Pakistani timezone (PKT is UTC+5)
    const now = new Date();
    const pakistaniTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));
    const hour = pakistaniTime.getHours();
    
    // Night time (12 AM to 12 PM / 0-11): 70% discount
    // Day time (12 PM to 12 AM / 12-23): 50% discount
    return hour < 12 ? 70 : 50;
  };

  const [banner, setBanner] = useState<BannerData>({
    discountPercentage: getDefaultDiscount(), 
    date: new Date().toLocaleDateString('en-US'),
    heading: 'Special Offer',
    description: "Don't miss out on this amazing deal! Limited time offer on all products.",
    imageUrl: '/assets/bg.jpg',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/banner`)
      .then(res => res.json())
      .then((data) => {
        setBanner(data as BannerData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch banner data:', err);
        // Use default discount based on Pakistani time if API fails
        setBanner(prev => ({ ...prev, discountPercentage: getDefaultDiscount() }));
        setLoading(false);
      });
  }, []);

  const formattedDate = new Date(banner.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {loading ? (
        /* Loading Screen */
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white border-t-yellow-400 mb-4"></div>
            <p className="text-white text-xl font-semibold">Loading...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Background Image */}
          <img
            src={banner.imageUrl}
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />

          {/* Overlay Content */}
          <div className="absolute inset-0 z-10 flex flex-col items-center gap-5 justify-center bg-black/40">
          {/* Pk.55 */}
          <div className="inline-block bg-white/20 backdrop-blur-sm px-8 py-4 rounded-lg border-2 border-white/50">
            <h1 className="text-6xl md:text-8xl font-bold drop-shadow-lg text-blue-300">
              Pk.55
            </h1>
          </div>

          {/* Report */}
          <div className="inline-block bg-red-600/80 backdrop-blur-sm px-10 py-3 rounded-full border-2 border-red-300">
            <h2 className="text-4xl md:text-5xl font-bold drop-shadow-lg text-white">
              Report
            </h2>
          </div>

          {/* Discount */}
          <div className="inline-block bg-gradient-to-br from-blue-600/80 to-blue-800/80 backdrop-blur-sm px-16 py-8 rounded-full border-4 border-yellow-400">
            <div className="text-8xl md:text-9xl font-extrabold text-yellow-400 drop-shadow-2xl">
              {banner.discountPercentage}
            </div>
          </div>

          {/* Date */}
          <div className="inline-block bg-black/60 backdrop-blur-sm px-8 py-3 rounded-lg border-2 border-yellow-400">
            <p className="text-xl md:text-2xl font-medium drop-shadow-md text-yellow-400">
              Date: {formattedDate}
            </p>
          </div>

          {/* Website URL */}
          <div className="inline-block bg-blue-700/80 backdrop-blur-sm px-10 py-4 rounded-full border-4 border-white mt-8">
            <p className="text-2xl md:text-3xl font-bold drop-shadow-lg text-white">
              www.prizeboundrluckystar.co
            </p>
          </div>
      </div>
        </>
      )}
    </div>
  );
}