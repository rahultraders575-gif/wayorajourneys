import React, { useEffect } from 'react';
import { useCms, PageId } from '../context/CmsContext';

interface SeoMetadata {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  ogType?: string;
  ogImage?: string;
}

const PAGE_SEO_MAP: Record<PageId, SeoMetadata> = {
  home: {
    title: 'Wayora Journeys (Way Ora Journey) | #1 Outstation Cabs & Luxury Car Rental',
    description: 'Book luxury outstation cabs, one-way drops, airport transfers, and pilgrimage tour packages with Wayora Journeys (Way Ora Journey). Top-rated sanitized fleet (Innova Crysta, Fortuner VIP, Sedans), verified chauffeurs, transparent per-km fares & 24/7 instant dispatch across Hyderabad, Bangalore, Vijayawada, and South India.',
    keywords: 'way ora journey, wayora journeys, wayora, wayora journey, wayora cab, way ora cab, outstation cab, outstation cabs, car rental with driver, hyderabad outstation cabs, bangalore outstation cab, innova crysta rental, fortuner outstation taxi, airport taxi hyderabad, tirupati cab package, srisailam cab service, luxury car rental india',
    canonical: 'https://wayorajourneys.com/',
    ogImage: 'https://wayorajourneys.com/images/hero-car-booking.jpg',
  },
  booking: {
    title: 'Book Outstation Cab Online | Wayora Journeys - Best Per-Km Rates & Verified Chauffeurs',
    description: 'Instant online booking for intercity outstation cabs, round-trips, and one-way drops with Wayora Journeys (Way Ora Journey). Calculate live toll estimates, choose Innova Crysta or luxury sedans, and travel with verified captains.',
    keywords: 'outstation cab booking, online taxi booking, book cab hyderabad, one way drop cab, round trip outstation car rental, way ora journey booking, car with driver outstation, innova outstation fare',
    canonical: 'https://wayorajourneys.com/booking',
    ogImage: 'https://wayorajourneys.com/images/airport-vip.jpg',
  },
  packages: {
    title: 'Pilgrimage & Holiday Tour Packages | Tirupati, Srisailam, Araku - Wayora Journeys',
    description: 'Explore curated outstation pilgrimage and weekend getaway tour packages with Wayora Journeys (Way Ora Journey). Door-to-door cab packages to Tirupati Balaji, Srisailam, Shirdi, Araku Valley, and Goa with verified drivers.',
    keywords: 'tirupati tour package from hyderabad, srisailam cab package, shirdi tour package, pilgrimage taxi services, outstation holiday packages, wayora travels, way ora tour package, balaji darshan cab',
    canonical: 'https://wayorajourneys.com/tours',
    ogImage: 'https://wayorajourneys.com/images/tirupati.jpg',
  },
  fleet: {
    title: 'Luxury Fleet & Car Rental Rates | Innova Crysta, Fortuner VIP - Wayora Journeys',
    description: 'Explore Wayora Journeys luxury car fleet with transparent per-kilometer rates. Choose from Executive Sedans (Dzire, Etios), Innova Crysta, Fortuner VIP Executive, and 12-17 Seater Maharaja Tempo Travellers.',
    keywords: 'innova crysta rental hyderabad, fortuner car rental, luxury cab fleet, tempo traveller rental outstation, executive car rental with driver, way ora car fleet, outstation car rates',
    canonical: 'https://wayorajourneys.com/fleet',
    ogImage: 'https://wayorajourneys.com/images/city-cars-road.jpg',
  },
  planner: {
    title: 'Route Planner & Toll Distance Fare Calculator | Wayora Journeys',
    description: 'Calculate exact highway driving distance, estimated toll charges, travel time, and per-km cab pricing between any two Indian cities with the Wayora Journeys intelligent route planner.',
    keywords: 'toll calculator india, route distance calculator, outstation cab fare estimator, hyderabad to bangalore driving time, way ora trip planner, highway travel time calculator',
    canonical: 'https://wayorajourneys.com/planner',
  },
  corporate: {
    title: 'Corporate Car Rental & Chauffeur Fleet Solutions | Wayora Journeys',
    description: 'Premium corporate car rentals and executive chauffeur services with Wayora Journeys. Automated GST input invoicing, dedicated relationship manager, employee airport transfers, and priority fleet dispatch.',
    keywords: 'corporate car rental hyderabad, corporate taxi service, executive chauffeur service, business car travel gst invoice, way ora corporate, company car rental packages',
    canonical: 'https://wayorajourneys.com/corporate',
  },
  blog: {
    title: 'Outstation Travel Guides & Highway Tips | Wayora Journeys Travel Magazine',
    description: 'Comprehensive highway guides, pilgrimage temple darshan timings, scenic road trip itineraries, and safe driving tips across South India curated by Wayora Journeys.',
    keywords: 'hyderabad to tirupati road trip guide, srisailam route guide, outstation travel blog, best highway restaurants south india, way ora travel guides, highway safety tips',
    canonical: 'https://wayorajourneys.com/blog',
  },
  about: {
    title: 'About Wayora Journeys (Way Ora Journey) | 24/7 Cab Dispatch & Customer Support',
    description: 'Learn about Wayora Journeys (Way Ora Journey), India\'s premier outstation cab network. Meet our founders, view customer safety standards, or contact our 24/7 concierge desk for instant outstation bookings.',
    keywords: 'wayora journeys contact number, way ora journey support, about wayora journeys, customer care outstation cab, wayora office hyderabad, 24x7 cab helpline',
    canonical: 'https://wayorajourneys.com/about-contact',
  },
  cms: {
    title: 'Admin Operations & Dispatch Deck | Wayora Journeys',
    description: 'Admin command center for Wayora Journeys live fleet dispatch, chauffeur management, tariff controls, and analytics.',
    keywords: 'wayora admin, dispatch deck',
    canonical: 'https://wayorajourneys.com/admin',
  },
  captain: {
    title: 'Captain Cockpit | Wayora Journeys Chauffeur Terminal & Partner Portal',
    description: 'Authorized driver-partner portal for Wayora Journeys. Manage active shifts, verify odometer readings, view daily earnings, and accept outstation dispatches.',
    keywords: 'wayora captain login, chauffeur portal, way ora driver dashboard',
    canonical: 'https://wayorajourneys.com/captain',
  },
  rider: {
    title: 'Rider Flight-Deck & Live Trip Tracker | Wayora Journeys',
    description: 'Track your active chauffeur in real-time, view your 4-digit start PIN, manage family delegate profiles, and download itemized GST trip invoices with Wayora Journeys.',
    keywords: 'wayora rider dashboard, track my cab, outstation trip invoice, way ora live tracker',
    canonical: 'https://wayorajourneys.com/rider-dashboard',
  },
};

/**
 * Helper to update or create a meta tag by name or property
 */
function setMetaTag(selector: string, attribute: 'name' | 'property', attrValue: string, content: string) {
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Helper to update canonical link
 */
function setCanonical(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

/**
 * Dynamic SEO component that maintains document.title, meta descriptions,
 * canonical URLs, and Open Graph tags across SPA page changes.
 */
export const SeoHead: React.FC = () => {
  const { activePage } = useCms();

  useEffect(() => {
    const seo = PAGE_SEO_MAP[activePage] || PAGE_SEO_MAP.home;

    // 1. Update Title
    document.title = seo.title;

    // 2. Update Primary Meta Tags
    setMetaTag('meta[name="description"]', 'name', 'description', seo.description);
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', seo.keywords);

    // 3. Update Canonical Tag
    setCanonical(seo.canonical);

    // 4. Update Open Graph Tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', seo.title);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', seo.description);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', seo.canonical);
    if (seo.ogImage) {
      setMetaTag('meta[property="og:image"]', 'property', 'og:image', seo.ogImage);
    }

    // 5. Update Twitter Tags
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', seo.title);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', seo.description);
    if (seo.ogImage) {
      setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', seo.ogImage);
    }

    // Optional: Synchronize browser history / URL hash cleanly for deep links
    try {
      const targetHash = activePage === 'home' ? '' : `#${activePage}`;
      if (window.location.hash !== targetHash) {
        window.history.replaceState(null, '', window.location.pathname + targetHash);
      }
    } catch {
      // Non-critical hash update
    }
  }, [activePage]);

  return null; // Headless component
};
