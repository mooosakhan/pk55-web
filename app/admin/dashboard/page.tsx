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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Banner'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
