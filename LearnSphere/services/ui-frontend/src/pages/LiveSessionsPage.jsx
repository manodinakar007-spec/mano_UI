import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Video, Calendar, Clock, Users, BookmarkPlus, Wifi, CheckCircle, X } from 'lucide-react';
import { sessionApi } from '../utils/api.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const FORMAT_FILTER = ['All', 'webinar', 'workshop', 'mentoring', 'qa'];

function Toast({ message, onClose }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl animate-fade-up">
      <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-gray-400 hover:text-white transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function LiveSessionsPage() {
  const [format, setFormat] = useState('All');
  const [toast, setToast] = useState(null);
  const [reserved, setReserved] = useState({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ['live-sessions', { format }],
    queryFn: () => sessionApi.list({ format: format !== 'All' ? format : undefined }).then((r) => r.data),
    placeholderData: { sessions: PLACEHOLDER_SESSIONS },
    retry: 1,
  });

  // Always fall back to placeholder so sessions always have stable string IDs
  const sessions = (isError || !data?.sessions?.length)
    ? PLACEHOLDER_SESSIONS
    : data.sessions.map((s, i) => ({ ...s, id: String(s._id || s.id || i) }));

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function handleReserve(session) {
    const key = String(session.id);
    if (reserved[key]) return;
    setReserved((prev) => ({ ...prev, [key]: true }));
    setToast(`Spot reserved for "${session.title}"!`);
    setTimeout(() => setToast(null), 4000);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Live Sessions</h1>
        <p className="text-gray-500 mt-1">Join live webinars, workshops, and 1:1 mentoring with industry experts.</p>
      </div>

      {/* Format Filter */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {FORMAT_FILTER.map((f) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              format === f
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f === 'All' ? 'All Formats' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => {
            const isFull = session.enrolledCount >= session.capacity;
            const isReserved = !!reserved[String(session.id)];
            const seatsLeft = session.capacity - session.enrolledCount;

            return (
              <div key={session.id} className="card overflow-hidden flex flex-col">
                {/* Live Badge */}
                {session.isLive && (
                  <div className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5">
                    <Wifi className="h-3 w-3" /> LIVE NOW
                  </div>
                )}

                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="badge bg-brand-50 text-brand-700 capitalize">{session.format}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {session.price === 0 ? 'Free' : `$${session.price}`}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">{session.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{session.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-xs">
                      {session.instructor?.name?.[0]}
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{session.instructor?.name}</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(session.scheduledAt)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      {session.durationMinutes} minutes
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" />
                      <span>
                        {session.enrolledCount}/{session.capacity} seats
                        {!isFull && seatsLeft <= 10 && (
                          <span className="ml-1.5 text-amber-600 font-semibold">· Only {seatsLeft} left!</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Seat progress bar */}
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all ${isFull ? 'bg-gray-400' : 'bg-brand-500'}`}
                      style={{ width: `${Math.min(100, (session.enrolledCount / session.capacity) * 100)}%` }}
                    />
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleReserve(session)}
                      disabled={isFull || isReserved}
                      className={`w-full flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-lg transition-all duration-200 ${
                        isReserved
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                          : isFull
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'btn-primary hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      {isReserved ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Spot Reserved!
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="h-4 w-4" />
                          {isFull ? 'Session Full' : 'Reserve Spot'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Toast notification */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

const PLACEHOLDER_SESSIONS = [
  { id: '1', title: 'Kubernetes in Production: Lessons from the Trenches', description: 'Real-world war stories from running Kubernetes at scale across financial services workloads.', format: 'webinar', instructor: { name: 'Priya Mehta' }, scheduledAt: '2026-06-15T14:00:00Z', durationMinutes: 90, enrolledCount: 342, capacity: 500, price: 0, isLive: false },
  { id: '2', title: 'React 18 Deep Dive: Concurrent Features & Suspense', description: 'Hands-on workshop covering React 18 concurrent mode, Suspense, and the new hooks ecosystem.', format: 'workshop', instructor: { name: 'James Whitfield' }, scheduledAt: '2026-06-16T10:00:00Z', durationMinutes: 180, enrolledCount: 28, capacity: 30, price: 49, isLive: false },
  { id: '3', title: 'Ask Me Anything: Breaking into Data Science', description: 'Open Q&A with a senior data scientist from Netflix. No topic off-limits.', format: 'qa', instructor: { name: 'Sara Chen' }, scheduledAt: '2026-06-14T18:00:00Z', durationMinutes: 60, enrolledCount: 189, capacity: 200, price: 0, isLive: true },
  { id: '4', title: 'System Design Interview Masterclass', description: '1:1 mock system design interviews with live feedback from FAANG engineers.', format: 'mentoring', instructor: { name: 'Rohan Kapoor' }, scheduledAt: '2026-06-17T09:00:00Z', durationMinutes: 60, enrolledCount: 4, capacity: 5, price: 99, isLive: false },
];
