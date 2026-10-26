import React, { useState } from 'react';
import { useCms } from '../context/CmsContext';
import { BlogPost } from '../types';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { BookOpen, Clock, Calendar, ArrowRight, X } from 'lucide-react';

export const BlogPage: React.FC = () => {
  const { blogs, openBookingModal } = useCms();
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  return (
    <div className="py-12 bg-slate-50 text-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-red-600 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>ROAD TRIP INSIGHTS & DEVOTIONAL ITINERARIES</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
            Wayora Travel Guides
          </h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Expert recommendations from our senior highway chauffeurs. Highway toll updates, Ghat road driving timings, temple darshan protocols, and scenic lunch pitstops.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-red-300 transition-all shadow-xs hover:shadow-xl group flex flex-col justify-between"
            >
              <div>
                {/* Photo */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <ImageWithFallback
                    src={post.imageUrl}
                    alt={post.title}
                    fallbackTitle={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-bold text-red-600 border border-red-100 shadow-xs">
                    {post.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  {/* Unboxed Metadata */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                    <span>{post.publishedDate}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.readTime}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 pt-0 flex items-center justify-between border-t border-slate-100 mt-4">
                <button
                  onClick={() => setActivePost(post)}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => openBookingModal(post.title)}
                  className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-[11px] font-bold text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer shadow-xs"
                >
                  Book Route
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Article Detail Modal */}
        {activePost && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-5 text-slate-900 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                  <span className="text-red-600 font-bold">{activePost.category}</span>
                  <span>·</span>
                  <span>{activePost.publishedDate}</span>
                </div>
                <button
                  onClick={() => setActivePost(null)}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {activePost.title}
              </h2>

              <div className="h-56 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                <ImageWithFallback
                  src={activePost.imageUrl}
                  alt={activePost.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-line">
                {activePost.content}
                <p className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-medium">
                  To experience this journey with zero driving fatigue, reserve an air-conditioned sedan or Innova Crysta with Wayora Journeys. Doorstep pickup across Hyderabad, Secunderabad, and major transit hubs.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <button
                  onClick={() => setActivePost(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setActivePost(null);
                    openBookingModal(activePost.title);
                  }}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/25 cursor-pointer transition-all"
                >
                  Book This Tour
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
