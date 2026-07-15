import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format price in Indian numbering (lakhs/crores) */
export function formatPrice(price: number): string {
  if (price >= 10000000) {
    const crores = price / 10000000;
    return `₹${crores % 1 === 0 ? crores.toFixed(0) : crores.toFixed(2)} Cr`;
  }
  if (price >= 100000) {
    const lakhs = price / 100000;
    return `₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(2)} L`;
  }
  return `₹${price.toLocaleString("en-IN")}`;
}

/** Format area with commas */
export function formatArea(area: number): string {
  return `${area.toLocaleString("en-IN")} sq.ft`;
}

/** Status → color mapping for badges */
export const statusColors: Record<string, string> = {
  available: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
  hold: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25",
  sold: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/25",
  rented: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/25",
  booked: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/25",
};

/** Property type → color mapping */
export const typeColors: Record<string, string> = {
  residential: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  commercial: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  rental: "bg-teal-500/15 text-teal-700 dark:text-teal-400",
  resale: "bg-pink-500/15 text-pink-700 dark:text-pink-400",
  plot: "bg-lime-500/15 text-lime-700 dark:text-lime-400",
};

/** Unit grid status → color */
export const unitStatusColors: Record<string, string> = {
  available: "bg-emerald-500 hover:bg-emerald-600",
  hold: "bg-amber-500 hover:bg-amber-600",
  sold: "bg-red-500 hover:bg-red-600",
  booked: "bg-purple-500 hover:bg-purple-600",
};

/** Capitalize first letter */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Relative time (e.g. "2 days ago") */
export function timeAgo(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
