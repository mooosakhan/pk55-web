'use client';

import { useState, useEffect } from 'react';

interface HistoryEntry {
  value: string;
  changedAt: string;
  current?: boolean;
}

export default function SubheaderHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings/subheader-history`);
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch subheader history:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return null;
  }

  // Show only the current (most recent) entry by default
  const displayedHistory = isExpanded ? history : history.slice(0, 1);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Subheader History
          </h2>
          {history.length > 1 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center transition-colors"
            >
              {isExpanded ? (
                <>
                  Show less
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  Show all ({history.length})
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>

        <div className="space-y-3">
          {displayedHistory.map((entry, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg border-l-4 ${
                entry.current 
                  ? 'bg-blue-50 border-blue-600' 
                  : 'bg-gray-50 border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-900 font-medium mb-1">
                    {entry.value}
                  </p>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(entry.changedAt)}
                  </div>
                </div>
                {entry.current && (
                  <span className="ml-3 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                    Current
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {!isExpanded && history.length > 1 && (
          <p className="text-sm text-gray-500 mt-4 text-center">
            {history.length - 1} previous {history.length - 1 === 1 ? 'entry' : 'entries'} available
          </p>
        )}
      </div>
    </div>
  );
}
