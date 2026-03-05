'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface HistoryEntry {
  value: string;
  changedAt: string;
  current?: boolean;
}

interface HistoryResponse {
  items: HistoryEntry[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export default function SubheaderHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchHistory = async (pageNum: number, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/settings/subheader-history?page=${pageNum}&limit=10`
      );
      
      if (!response.ok) {
        console.error('API responded with error:', response.status, response.statusText);
        throw new Error(`Failed to fetch history: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle both old array format and new paginated object format
      let items: HistoryEntry[];
      let totalCount: number;
      let hasMoreItems: boolean;
      
      if (Array.isArray(data)) {
        // Old format: direct array
        console.log('Using legacy array format');
        items = data;
        totalCount = data.length;
        hasMoreItems = false; // No pagination in old format
      } else if (data && typeof data === 'object' && Array.isArray(data.items)) {
        // New format: paginated response
        console.log('Using new paginated format');
        items = data.items;
        totalCount = data.total || 0;
        hasMoreItems = data.hasMore || false;
      } else {
        console.error('Invalid response format:', data);
        console.error('Response type:', typeof data);
        console.error('Is array?', Array.isArray(data));
        if (data && typeof data === 'object') {
          console.error('Available keys:', Object.keys(data));
        }
        if (!append) {
          setHistory([]);
        }
        return;
      }
      
      if (append) {
        setHistory(prev => [...prev, ...items]);
      } else {
        setHistory(items);
      }
      
      setHasMore(hasMoreItems);
      setTotal(totalCount);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch subheader history:', error);
      // Ensure history is set to empty array on error if not appending
      if (!append) {
        setHistory([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchHistory(page + 1, true);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loading, page]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center">
            <svg className="w-5 h-5 md:w-6 md:h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Subheader History
          </h2>
          <span className="text-xs md:text-sm text-gray-500 font-medium bg-gray-100 px-2 md:px-3 py-1 rounded-full">
            {total} {total === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        <div className="space-y-2 md:space-y-3">
          {history.map((entry, index) => (
            <div 
              key={index} 
              className={`p-3 md:p-4 rounded-lg border-l-4 transition-all ${
                entry.current 
                  ? 'bg-blue-50 border-blue-600' 
                  : 'bg-gray-50 border-gray-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base text-gray-900 font-medium mb-1 break-words">
                    {entry.value}
                  </p>
                  <div className="flex items-center text-xs md:text-sm text-gray-600">
                    <svg className="w-3 h-3 md:w-4 md:h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{formatDate(entry.changedAt)}</span>
                  </div>
                </div>
                {entry.current && (
                  <span className="inline-flex items-center px-2 md:px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full self-start">
                    Current
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Loading indicator for scroll */}
        {loadingMore && (
          <div className="flex justify-center items-center py-4 md:py-6">
            <div className="flex items-center space-x-2 text-blue-600">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm font-medium">Loading more...</span>
            </div>
          </div>
        )}

        {/* Intersection observer target */}
        <div ref={observerTarget} className="h-4"></div>

        {/* End of list indicator */}
        {!hasMore && history.length > 0 && (
          <div className="text-center py-4 md:py-6">
            <p className="text-xs md:text-sm text-gray-500">
              {history.length === total ? 'All history loaded' : `Showing all ${history.length} entries`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
