'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface ImageData {
  id: string;
  imageUrl: string;
  date: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<ImageData[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [editingImage, setEditingImage] = useState<ImageData | null>(null);
  const [editDate, setEditDate] = useState('');
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const token = window.localStorage.getItem('token');
      if (!token) {
        router.push('/admin');
        return;
      }

      // Verify token is valid by making a test request
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/images`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // Token is invalid, redirect to login
          window.localStorage.removeItem('token');
          router.push('/admin');
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        window.localStorage.removeItem('token');
        router.push('/admin');
      } finally {
        setIsChecking(false);
      }
    };

    verifyAuth();
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchImages();
    }
  }, [isAuthenticated]);

  const fetchImages = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/images`);
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const token = window.localStorage.getItem('token');
      const encodedId = encodeURIComponent(id);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/images/${encodedId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Delete failed');

      setMessage('Image deleted successfully!');
      fetchImages(); // Refresh the list
    } catch (error: any) {
      setMessage('Error: ' + error.message);
    }
  };

  const handleEdit = (image: ImageData) => {
    setEditingImage(image);
    setEditDate(image.date);
    setReplaceFile(null);
  };

  const handleUpdateDate = async () => {
    if (!editingImage) return;

    try {
      const token = window.localStorage.getItem('token');
      const encodedId = encodeURIComponent(editingImage.id);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/images/${encodedId}/update-date`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ date: editDate }),
      });

      if (!response.ok) throw new Error('Update failed');

      setMessage('Image date updated successfully!');
      setEditingImage(null);
      fetchImages();
    } catch (error: any) {
      setMessage('Error: ' + error.message);
    }
  };

  const handleReplaceImage = async () => {
    if (!editingImage || !replaceFile) return;

    try {
      const token = window.localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', replaceFile);
      formData.append('date', editDate);

      const encodedId = encodeURIComponent(editingImage.id);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/images/${encodedId}/replace`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Replace failed');

      setMessage('Image replaced successfully!');
      setEditingImage(null);
      setReplaceFile(null);
      fetchImages();
    } catch (error: any) {
      setMessage('Error: ' + error.message);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setMessage('Please select an image');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = window.localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('date', date);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/images/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      setMessage('Image uploaded successfully!');
      setImageFile(null);
      fetchImages(); // Refresh the list
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-900 text-xl font-semibold">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-blue-100 mt-1">Manage your daily images</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white hover:bg-gray-100 text-blue-700 font-bold py-3 px-6 rounded-lg transition-all shadow-lg"
            >
              Logout
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg shadow-lg ${message.includes('Error') ? 'bg-red-500/90 text-white' : 'bg-green-500/90 text-white'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-blue-700">Upload New Image</h2>
            <p className="text-gray-600 mt-1">Add a new daily image with date</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="shadow-lg appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="shadow-lg appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {imageFile && (
                <div className="mt-4 border-2 border-blue-600 rounded-lg overflow-hidden">
                  <img 
                    src={URL.createObjectURL(imageFile)} 
                    alt="Preview" 
                    className="max-w-full h-64 object-contain bg-gray-50"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-lg disabled:opacity-50 transition-all shadow-lg"
            >
              {loading ? 'Uploading...' : 'Upload Image'}
            </button>
          </form>
        </div>

        {/* Images List */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold mb-6 text-blue-700">Uploaded Images</h2>
          
          {loadingImages ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading images...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500">No images uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {images.map((image) => (
                <div key={image.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-xl hover:border-blue-500 transition-all">
                  <div className="flex gap-4">
                    <img 
                      src={image.imageUrl} 
                      alt={`Image for ${image.date}`}
                      className="w-28 h-28 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-xl text-blue-700">{formatDate(image.date)}</p>
                      <p className="text-sm text-gray-600 mt-1">Uploaded: {formatDate(image.createdAt)}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleEdit(image)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-lg transition-all shadow-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(image.id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 rounded-lg transition-all shadow-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-blue-700">Edit Image</h2>
                <button
                  onClick={() => {
                    setEditingImage(null);
                    setReplaceFile(null);
                  }}
                  className="text-gray-600 hover:text-gray-900 text-3xl transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Current Image */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-3">
                  Current Image
                </label>
                <div className="border-2 border-blue-600 rounded-lg overflow-hidden">
                  <img 
                    src={editingImage.imageUrl} 
                    alt="Current" 
                    className="max-w-full h-64 object-contain bg-gray-50 w-full"
                  />
                </div>
              </div>

              {/* Date Input */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-3">
                  Image Date
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="shadow-lg appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Replace Image Option */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-3">
                  Replace Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReplaceFile(e.target.files?.[0] || null)}
                  className="shadow-lg appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {replaceFile && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-3 font-semibold">New Image Preview:</p>
                    <div className="border-2 border-green-500 rounded-lg overflow-hidden">
                      <img 
                        src={URL.createObjectURL(replaceFile)} 
                        alt="New Preview" 
                        className="max-w-full h-64 object-contain bg-gray-50 w-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {replaceFile ? (
                  <button
                    onClick={handleReplaceImage}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg"
                  >
                    Replace Image & Update Date
                  </button>
                ) : (
                  <button
                    onClick={handleUpdateDate}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg"
                  >
                    Update Date Only
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingImage(null);
                    setReplaceFile(null);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
