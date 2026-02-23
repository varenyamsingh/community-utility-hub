'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface Booking {
  id: string;
  itemId: string;
  borrowerId: string;
  startDate: string;
  endDate: string;
  status: string;
  item: {
    id: string;
    title: string;
  };
}

export default function Dashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchBookings = useCallback(async (ownerId: string) => {
    try {
      const res = await fetch(`http://localhost:3001/bookings/owner/${ownerId}`);
      const data = await res.json();
      // Ensure data is always an array
      if (Array.isArray(data)) {
        setBookings(data);
      } else if (data && Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      } else {
        console.log('Bookings API response:', data);
        setBookings([]);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setBookings([]);
    }
  }, []);

  const handleComplete = async (bookingId: string) => {
    try {
      await fetch(`http://localhost:3001/bookings/${bookingId}/complete`, {
        method: 'PATCH',
      });
      // Refresh bookings
      const user = localStorage.getItem('user_id');
      if (user) {
        fetchBookings(user);
      }
    } catch (error) {
      console.error('Failed to complete booking:', error);
    }
  };

  useEffect(() => {
    // Get user from localStorage (set by Auth component)
    const user = localStorage.getItem('user_id');
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchBookings(user);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [fetchBookings]);

  const pendingRequests = bookings.filter((b) => b.status === 'pending');
  const currentRentals = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'active'
  );

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="gradient-text">Owner Dashboard</span>
            </h1>
            <p className="text-gray-400">Manage your tool rentals and bookings</p>
          </div>
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Stats Cards */}
          <div className="premium-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Pending Requests</p>
                <p className="text-2xl font-bold text-white">{pendingRequests.length}</p>
              </div>
            </div>
          </div>
          
          <div className="premium-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Active Rentals</p>
                <p className="text-2xl font-bold text-white">{currentRentals.length}</p>
              </div>
            </div>
          </div>
          
          <div className="premium-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Bookings</p>
                <p className="text-2xl font-bold text-white">{bookings.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Pending Requests</h2>
          </div>
          
          {pendingRequests.length === 0 ? (
            <div className="premium-card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-400">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((booking) => (
                <div
                  key={booking.id}
                  className="premium-card p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">{booking.item.title}</h3>
                        <p className="text-gray-400 text-sm mt-1">
                          <span className="text-gray-500">Period:</span>{' '}
                          {new Date(booking.startDate).toLocaleDateString()} -{' '}
                          {new Date(booking.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Borrower: {booking.borrowerId.substring(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleComplete(booking.id)}
                      className="btn-primary flex items-center gap-2 whitespace-nowrap"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve & Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Current Rentals */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Current Rentals</h2>
          </div>
          
          {currentRentals.length === 0 ? (
            <div className="premium-card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-400">No active rentals</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentRentals.map((booking) => (
                <div
                  key={booking.id}
                  className="premium-card p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">{booking.item.title}</h3>
                        <p className="text-gray-400 text-sm mt-1">
                          {new Date(booking.startDate).toLocaleDateString()} -{' '}
                          {new Date(booking.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-medium border border-green-500/30">
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
