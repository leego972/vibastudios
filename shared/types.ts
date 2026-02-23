/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// Scene parameter options for the manual editor
export const TIME_OF_DAY_OPTIONS = ["dawn", "morning", "afternoon", "evening", "night", "golden-hour"] as const;
export const WEATHER_OPTIONS = ["clear", "cloudy", "rainy", "stormy", "snowy", "foggy", "windy"] as const;
export const LIGHTING_OPTIONS = ["natural", "dramatic", "soft", "neon", "candlelight", "studio", "backlit", "silhouette"] as const;
export const CAMERA_ANGLE_OPTIONS = ["wide", "medium", "close-up", "extreme-close-up", "birds-eye", "low-angle", "dutch-angle", "over-shoulder", "pov"] as const;
export const RATING_OPTIONS = ["G", "PG", "PG-13", "R"] as const;
export const QUALITY_OPTIONS = ["standard", "high", "ultra"] as const;
export const MOOD_OPTIONS = ["tense", "romantic", "action", "comedic", "dramatic", "mysterious", "horror", "inspirational", "melancholic", "epic"] as const;

export const LOCATION_TYPES = [
  "City Street", "Rooftop", "Beach", "Forest", "Desert", "Mountain",
  "Office", "Restaurant", "Bar/Club", "Hospital", "Courtroom", "Prison",
  "Airport", "Train Station", "Highway", "Warehouse", "Alley", "Park",
  "Underwater", "Space", "Castle", "Church", "School", "Library",
  "Stadium", "Harbor/Dock", "Farm", "Cave", "Bridge", "Subway",
] as const;

export const REAL_ESTATE_STYLES = [
  "Modern Mansion", "Victorian House", "Penthouse Apartment", "Suburban Home",
  "Log Cabin", "Beach House", "Loft Apartment", "Country Estate",
  "Industrial Warehouse", "Townhouse", "Mediterranean Villa", "Art Deco Building",
  "Minimalist Studio", "Gothic Manor", "Futuristic Complex", "Colonial Home",
] as const;

export const VEHICLE_TYPES = [
  "None", "Sports Car", "Sedan", "SUV", "Pickup Truck", "Motorcycle",
  "Helicopter", "Private Jet", "Yacht", "Speedboat", "Limousine",
  "Police Car", "Ambulance", "Bus", "Bicycle", "Horse", "Tank",
  "Spaceship", "Classic Car", "Van",
] as const;

export const GENRE_OPTIONS = [
  "Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance",
  "Thriller", "Documentary", "Animation", "Fantasy", "Mystery",
  "Western", "Musical", "War", "Crime", "Adventure",
] as const;

export type CharacterAttributes = {
  age?: string;
  gender?: string;
  ethnicity?: string;
  build?: string;
  hairColor?: string;
  role?: string;
};

export type CharacterPosition = {
  x: number;
  y: number;
  action: string;
};
