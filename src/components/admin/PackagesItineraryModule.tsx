import React, { useState } from 'react';
import { TourPackage, DayItinerary, AdminRole } from '../../types';
import {
  Compass, Plus, Edit2, Trash2, Star, CheckCircle2, 
  MapPin, Calendar, Clock, Tag, ShieldCheck, Mountain, 
  X, Check, Eye, AlertCircle
} from 'lucide-react';

interface PackagesItineraryModuleProps {
  packages: TourPackage[];
  currentRole: AdminRole;
  onAddPackage: (pkg: Omit<TourPackage, 'id'>) => void;
  onUpdatePackage: (id: string, pkg: Partial<TourPackage>) => void;
  onDeletePackage: (id: string) => void;
  onToggleFeatured: (id: string) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const PackagesItineraryModule: React.FC<PackagesItineraryModuleProps> = ({
  packages,
  currentRole,
  onAddPackage,
  onUpdatePackage,
  onDeletePackage,
  onToggleFeatured,
  showToast,
}) => {
  const [selectedPackage, setSelectedPackage] = useState<TourPackage | null>(packages[0] || null);
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false);
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState<TourPackage['category']>('spiritual');
  const [desc, setDesc] = useState('');
  const [duration, setDuration] = useState('2–3 days');
  const [price, setPrice] = useState(16800);
  const [ratePerKm, setRatePerKm] = useState(15);
  const [distanceKm, setDistanceKm] = useState(1120);
  const [imgUrl, setImgUrl] = useState('');
  const [recommendedCar, setRecommendedCar] = useState('Toyota Innova Crysta');
  const [highlights, setHighlights] = useState('Temple Darshan, Scenic Ghats, Doorstep Pickup');
  const [seasonality, setSeasonality] = useState<TourPackage['seasonality']>('All Year');
  const [terrainVehicles, setTerrainVehicles] = useState<string>('Toyota Innova Crysta, Toyota Fortuner VIP');

  // Itinerary Editor State
  const [itineraryDays, setItineraryDays] = useState<DayItinerary[]>([
    {
      dayNumber: 1,
      title: 'Departure & Scenic Highway Transit',
      highlights: ['Early morning doorstep pickup', 'Highway breakfast oasis', 'Hotel check-in'],
      description: 'Comfortable air-conditioned cruise with professional chauffeur handling highway toll lanes.',
      hotelNotes: 'Standard 4-star luxury partner hotel.',
    },
    {
      dayNumber: 2,
      title: 'Main Temple Darshan & Sightseeing Tour',
      highlights: ['VIP Darshan entry queue support', 'Local heritage temples', 'Evening sunset point'],
      description: 'Chauffeur assists with reserved temple parking and luggage safeguarding.',
    },
  ]);

  const isOperatorOrAdmin = currentRole === 'Super Admin' || currentRole === 'Fleet Dispatcher';

  const openNewPackageModal = () => {
    setEditingPkgId(null);
    setTitle('');
    setTagline('');
    setCategory('spiritual');
    setDesc('');
    setDuration('2–3 days');
    setPrice(18000);
    setRatePerKm(15);
    setDistanceKm(1200);
    setImgUrl('https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1000&q=80');
    setRecommendedCar('Innova Crysta or Dzire');
    setHighlights('Doorstep Pickup, Chilled AC, Temple Darshan');
    setSeasonality('All Year');
    setTerrainVehicles('Toyota Innova Crysta, Maruti Suzuki Ertiga');
    setIsPkgModalOpen(true);
  };

  const openEditPackageModal = (pkg: TourPackage) => {
    setEditingPkgId(pkg.id);
    setTitle(pkg.title);
    setTagline(pkg.tagline);
    setCategory(pkg.category);
    setDesc(pkg.description);
    setDuration(pkg.duration);
    setPrice(pkg.fromPrice);
    setRatePerKm(pkg.ratePerKm);
    setDistanceKm(pkg.estimatedDistanceKm);
    setImgUrl(pkg.imageUrl);
    setRecommendedCar(pkg.recommendedCar);
    setHighlights(pkg.highlights.join(', '));
    setSeasonality(pkg.seasonality || 'All Year');
    setTerrainVehicles((pkg.terrainRestrictedVehicles || ['Toyota Innova Crysta']).join(', '));
    if (pkg.itinerary && pkg.itinerary.length > 0) {
      setItineraryDays(pkg.itinerary);
    }
    setIsPkgModalOpen(true);
  };

  const handleSavePackageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const highlightsArr = highlights.split(',').map((s) => s.trim()).filter(Boolean);
    const terrainArr = terrainVehicles.split(',').map((s) => s.trim()).filter(Boolean);
    const categoryLabels: Record<string, string> = {
      spiritual: 'Spiritual',
      hill: 'Hill Station',
      beach: 'Beach & Coastal',
      heritage: 'Heritage',
    };

    if (editingPkgId) {
      onUpdatePackage(editingPkgId, {
        title,
        tagline,
        category,
        categoryLabel: categoryLabels[category],
        description: desc,
        duration,
        fromPrice: Number(price),
        ratePerKm: Number(ratePerKm),
        estimatedDistanceKm: Number(distanceKm),
        imageUrl: imgUrl,
        recommendedCar,
        highlights: highlightsArr,
        seasonality,
        terrainRestrictedVehicles: terrainArr,
        itinerary: itineraryDays,
      });
      showToast(`Tour package ${title} updated successfully`, 'success');
    } else {
      onAddPackage({
        title,
        tagline,
        category,
        categoryLabel: categoryLabels[category],
        description: desc,
        duration,
        fromPrice: Number(price),
        ratePerKm: Number(ratePerKm),
        estimatedDistanceKm: Number(distanceKm),
        imageUrl: imgUrl,
        recommendedCar,
        highlights: highlightsArr,
        featured: false,
        seasonality,
        terrainRestrictedVehicles: terrainArr,
        itinerary: itineraryDays,
        inclusionsList: ['Chilled AC Vehicle', 'All State Highway Tolls Included', 'Chauffeur Night Stay & Food Allowance'],
        exclusionsList: ['Monument & Darshan Tickets', 'Personal Meals & Shopping'],
      });
      showToast(`New tour package ${title} published to consumer portal`, 'success');
    }
    setIsPkgModalOpen(false);
  };

  const handleAddDay = () => {
    const nextDayNum = itineraryDays.length + 1;
    setItineraryDays([
      ...itineraryDays,
      {
        dayNumber: nextDayNum,
        title: `Day ${nextDayNum} - Scenic Return & Heritage Pitstops`,
        highlights: ['Sightseeing & local markets', 'Return doorstep cruise'],
        description: 'Smooth driving back to destination city with leisurely tea stops.',
      },
    ]);
  };

  return (
    <div className="space-y-6">

      {/* TOP HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <h3 className="text-base font-black text-slate-900">Curated Tour Packages & Multi-Day Itineraries CMS</h3>
          <p className="text-xs text-slate-500">
            Author and edit spiritual pilgrimages, hill station escapes, and coastal loops with terrain vehicle locking.
          </p>
        </div>

        {isOperatorOrAdmin && (
          <button
            onClick={openNewPackageModal}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Tour Package</span>
          </button>
        )}
      </div>

      {/* 2-COLUMN LAYOUT: PACKAGES GRID + ITINERARY VIEWER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: PACKAGES CARDS */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg)}
                className={`rounded-3xl border bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                  selectedPackage?.id === pkg.id ? 'ring-2 ring-red-600 border-red-500' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={pkg.imageUrl}
                      alt={pkg.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-600 text-white shadow-2xs">
                        {pkg.categoryLabel}
                      </span>
                      {pkg.seasonality && (
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-black/75 text-white backdrop-blur-xs">
                          {pkg.seasonality}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFeatured(pkg.id);
                        showToast(`Featured state updated for ${pkg.title}`, 'info');
                      }}
                      className={`absolute top-3 right-3 p-1.5 rounded-full cursor-pointer transition-all ${
                        pkg.featured ? 'bg-amber-400 text-black shadow-md' : 'bg-black/50 text-white hover:bg-black/80'
                      }`}
                      title="Toggle Featured on Consumer Home"
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <div>
                      <h4 className="font-black text-slate-900 text-base">{pkg.title}</h4>
                      <p className="text-xs text-rose-700 font-bold">{pkg.tagline}</p>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{pkg.description}</p>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">From Price</span>
                        <span className="font-extrabold text-slate-900 text-sm">₹{pkg.fromPrice.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Duration</span>
                        <span className="font-bold text-slate-700">{pkg.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Controls */}
                {isOperatorOrAdmin && (
                  <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                    <span className="text-[10px] font-semibold text-slate-500">
                      {pkg.recommendedCar}
                    </span>

                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditPackageModal(pkg);
                        }}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                        title="Edit Package & Itinerary"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete package ${pkg.title}?`)) {
                            onDeletePackage(pkg.id);
                          }
                        }}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-red-600 rounded-xl cursor-pointer"
                        title="Delete Package"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: SELECTED ITINERARY PREVIEW & TERRAIN LOCK INSPECTOR */}
        {selectedPackage && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5 h-fit sticky top-6">
            <div className="border-b pb-3">
              <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider block">
                Itinerary Inspector
              </span>
              <h4 className="text-lg font-black text-slate-900">{selectedPackage.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{selectedPackage.duration} · {selectedPackage.estimatedDistanceKm} km round trip</p>
            </div>

            {/* Terrain Vehicle Restriction Badge */}
            <div className="bg-rose-50/70 p-3 rounded-2xl border border-rose-200/80 space-y-1">
              <span className="text-[10px] font-extrabold text-rose-800 uppercase flex items-center gap-1">
                <Mountain className="w-3.5 h-3.5 text-red-600" />
                Terrain Vehicle Enforcements
              </span>
              <p className="text-xs text-slate-700">
                Allowable models: <b>{(selectedPackage.terrainRestrictedVehicles || ['Innova Crysta', 'Fortuner VIP']).join(', ')}</b>
              </p>
            </div>

            {/* Inclusions */}
            {selectedPackage.inclusionsList && (
              <div className="space-y-1.5 text-xs">
                <span className="font-extrabold text-slate-900 block">Standard Package Inclusions:</span>
                <ul className="space-y-1 text-slate-600">
                  {selectedPackage.inclusionsList.map((inc, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-[11px]">
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Day-by-Day Timeline */}
            <div className="space-y-3 pt-2">
              <span className="font-extrabold text-slate-900 text-xs block">Day-by-Day Journey Breakdown:</span>
              {(selectedPackage.itinerary || itineraryDays).map((day) => (
                <div key={day.dayNumber} className="relative pl-5 border-l-2 border-red-500/50 space-y-1 text-xs">
                  <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-red-600 ring-2 ring-white" />
                  <h5 className="font-extrabold text-slate-900 text-xs">
                    Day {day.dayNumber}: {day.title}
                  </h5>
                  <p className="text-[11px] text-slate-600">{day.description}</p>
                  {day.highlights && day.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {day.highlights.map((h, hi) => (
                        <span key={hi} className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {isOperatorOrAdmin && (
              <button
                onClick={() => openEditPackageModal(selectedPackage)}
                className="w-full py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer transition-all"
              >
                Edit Complete Package & Itinerary
              </button>
            )}
          </div>
        )}
      </div>

      {/* PACKAGE BUILDER & ITINERARY EDITOR MODAL */}
      {isPkgModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {editingPkgId ? 'Edit Tour Package & Itinerary' : 'Create New Multi-Day Tour Package'}
                </h3>
                <p className="text-xs text-slate-500">Configure route highlights, pricing, and terrain vehicle locks.</p>
              </div>
              <button
                onClick={() => setIsPkgModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePackageSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Package Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Srisailam Forest & Jyotirlinga Tour"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Catchy Tagline</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sacred Forest & Mallikarjuna Temple"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="spiritual">Spiritual Pilgrimage</option>
                    <option value="hill">Hill Station</option>
                    <option value="beach">Beach & Coastal</option>
                    <option value="heritage">Heritage & Kingdom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Duration</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2–3 days"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Seasonality Badge</label>
                  <select
                    value={seasonality}
                    onChange={(e) => setSeasonality(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="All Year">All Year</option>
                    <option value="Monsoon & Winter">Monsoon & Winter</option>
                    <option value="Summer Peak">Summer Peak</option>
                    <option value="Festival Special">Festival Special</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Starting Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Rate / Km (₹)</label>
                  <input
                    type="number"
                    required
                    value={ratePerKm}
                    onChange={(e) => setRatePerKm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Round-trip Distance (km)</label>
                  <input
                    type="number"
                    required
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Terrain Restricted Vehicles (comma-separated)</label>
                <input
                  type="text"
                  value={terrainVehicles}
                  onChange={(e) => setTerrainVehicles(e.target.value)}
                  placeholder="e.g. Toyota Innova Crysta, Toyota Fortuner VIP"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Detailed Description</label>
                <textarea
                  rows={2}
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Thumbnail Image URL</label>
                <input
                  type="text"
                  required
                  value={imgUrl}
                  onChange={(e) => setImgUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <button
                  type="button"
                  onClick={handleAddDay}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Itinerary Day
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPkgModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer shadow-sm"
                  >
                    Save & Publish Package
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

