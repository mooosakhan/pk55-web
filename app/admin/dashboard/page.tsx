'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface BannerData {
  discountPercentage: number;
  date: string;
  heading: string;
  description: string;
  imageUrl: string;
}

export default function AdminDashboard() {
  const [banner, setBanner] = useState<BannerData>({
    discountPercentage: 25,
    date: '',
    heading: '',
    description: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem('token');
    if (!token) {
      router.push('/admin');
      return;
    }

    fetchBannerData();
  }, [router]);

  const fetchBannerData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/banner`);
      const data = await response.json() as BannerData;
      setBanner(data);
    } catch (error) {
      console.error('Failed to fetch banner data:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = window.localStorage.getItem('token');
      
      // Upload image if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/banner/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!uploadResponse.ok) throw new Error('Image upload failed');
        const uploadData = await uploadResponse.json() as { imageUrl: string };
        banner.imageUrl = uploadData.imageUrl;
      }

      // Update banner data
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/banner`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(banner),
      });

      if (!response.ok) throw new Error('Update failed');

      setMessage('Banner updated successfully!');
      setImageFile(null);
    } catch (error: any) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem('token');
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Logout
            </button>
          </div>

          {message && (
            <div className={`mb-4 p-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Heading
              </label>
              <input
                type="text"
                value={banner.heading}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBanner({ ...banner, heading: e.currentTarget.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Discount Percentage
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={banner.discountPercentage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBanner({ ...banner, discountPercentage: parseInt(e.currentTarget.value) })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Date
              </label>
              <input
                type="date"
                value={banner.date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBanner({ ...banner, date: e.currentTarget.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Description
              </label>
              <textarea
                value={banner.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBanner({ ...banner, description: e.currentTarget.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 h-24"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Background Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageFile(e.currentTarget.files?.[0] || null)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              />
              {banner.imageUrl && (
                <p className="text-sm text-gray-600 mt-2">Current: {banner.imageUrl}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Banner'}
            </button>
          </form>
        </div>

        {/* Preview */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Preview</h2>
          <div className="relative h-96 overflow-hidden rounded-lg">
            <img
              src={banner.imageUrl || '/assets/bg.webp'}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center text-white space-y-4">
                <h1 className="text-5xl font-bold">{banner.heading}</h1>
                <div className="text-7xl font-extrabold text-yellow-400">
                  {banner.discountPercentage}% OFF
                </div>
                <p className="text-xl">{banner.date}</p>
                <p className="text-lg max-w-2xl">{banner.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
