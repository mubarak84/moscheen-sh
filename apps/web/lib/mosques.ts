import mosquesData from "@/data/mosques.json";

export type MosqueAddress = {
  street: string;
  postalCode: string;
  city: string;
  country: string;
};

export type MosqueCoordinates = {
  lat: number;
  lng: number;
};

export type MosqueContact = {
  email: string;
  phone: string;
  hotline: string;
};

export type MosqueImam = {
  name: string;
  role: string;
  image: string;
  email: string;
  phone: string;
};

export type MosqueImageCredit = {
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
  sourceUrl: string;
};

export type Mosque = {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  city: string;
  region: string;
  tagline: string;
  established: string;
  status: string;
  shortDescription: string;
  description: string[];
  address: MosqueAddress;
  coordinates: MosqueCoordinates;
  mapsQuery: string;
  heroImage: string;
  imageCredit: MosqueImageCredit;
  accentColor: string;
  accentColorDark: string;
  contact: MosqueContact;
  imam: MosqueImam;
  facilities: string[];
};

const mosques = (mosquesData.mosques as Mosque[]).slice();

export function getAllMosques(): Mosque[] {
  return mosques;
}

export function getMosqueBySlug(slug: string): Mosque | undefined {
  return mosques.find((mosque) => mosque.slug === slug);
}

export function getMosqueSlugs(): string[] {
  return mosques.map((mosque) => mosque.slug);
}

export function formatAddress(address: MosqueAddress): string {
  return `${address.street}, ${address.postalCode} ${address.city}`;
}

export function mapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function mapsEmbedUrl(query: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}
