// Mock data for Mission Control AI

export type Satellite = {
  id: string;
  noradId: string;
  name: string;
  operator: string;
  type: "Communications" | "Earth Observation" | "Navigation" | "Science" | "Crewed" | "Military";
  altitudeKm: number;
  velocityKms: number;
  inclination: number;
  orbit: "LEO" | "MEO" | "GEO" | "HEO";
  launchDate: string;
  status: "Active" | "Decaying" | "Inactive";
  lat: number;
  lng: number;
};

export const satellites: Satellite[] = [
  { id: "iss", noradId: "25544", name: "ISS (ZARYA)", operator: "NASA / Roscosmos", type: "Crewed", altitudeKm: 408, velocityKms: 7.66, inclination: 51.6, orbit: "LEO", launchDate: "1998-11-20", status: "Active", lat: 24.3, lng: -42.1 },
  { id: "hst", noradId: "20580", name: "Hubble Space Telescope", operator: "NASA / ESA", type: "Science", altitudeKm: 538, velocityKms: 7.59, inclination: 28.5, orbit: "LEO", launchDate: "1990-04-24", status: "Active", lat: 12.4, lng: 84.2 },
  { id: "starlink-1", noradId: "44713", name: "STARLINK-1007", operator: "SpaceX", type: "Communications", altitudeKm: 550, velocityKms: 7.58, inclination: 53.0, orbit: "LEO", launchDate: "2019-11-11", status: "Active", lat: -18.2, lng: 110.5 },
  { id: "starlink-2", noradId: "47200", name: "STARLINK-1842", operator: "SpaceX", type: "Communications", altitudeKm: 547, velocityKms: 7.58, inclination: 53.0, orbit: "LEO", launchDate: "2021-01-20", status: "Active", lat: 45.1, lng: -73.6 },
  { id: "gps-iif", noradId: "39741", name: "GPS IIF-8", operator: "U.S. Space Force", type: "Navigation", altitudeKm: 20180, velocityKms: 3.87, inclination: 55.0, orbit: "MEO", launchDate: "2014-10-29", status: "Active", lat: 32.0, lng: 12.0 },
  { id: "goes-16", noradId: "41866", name: "GOES-16", operator: "NOAA", type: "Earth Observation", altitudeKm: 35786, velocityKms: 3.07, inclination: 0.1, orbit: "GEO", launchDate: "2016-11-19", status: "Active", lat: 0, lng: -75.2 },
  { id: "tess", noradId: "43435", name: "TESS", operator: "NASA", type: "Science", altitudeKm: 108000, velocityKms: 4.2, inclination: 37.0, orbit: "HEO", launchDate: "2018-04-18", status: "Active", lat: 8.0, lng: -22.0 },
  { id: "sentinel-2a", noradId: "40697", name: "Sentinel-2A", operator: "ESA", type: "Earth Observation", altitudeKm: 786, velocityKms: 7.45, inclination: 98.6, orbit: "LEO", launchDate: "2015-06-23", status: "Active", lat: -55.4, lng: 28.9 },
  { id: "tiangong", noradId: "48274", name: "Tiangong Space Station", operator: "CNSA", type: "Crewed", altitudeKm: 389, velocityKms: 7.68, inclination: 41.5, orbit: "LEO", launchDate: "2021-04-29", status: "Active", lat: -3.2, lng: 145.7 },
  { id: "jwst", noradId: "50463", name: "James Webb Space Telescope", operator: "NASA / ESA / CSA", type: "Science", altitudeKm: 1500000, velocityKms: 0.4, inclination: 0, orbit: "HEO", launchDate: "2021-12-25", status: "Active", lat: 5.5, lng: 120.0 },
];

export const issPosition = { lat: 24.3, lng: -42.1, altitudeKm: 408, velocityKms: 7.66, crew: 7 };

export type SpaceEvent = {
  id: string;
  type: "ISS Flyover" | "Meteor Shower" | "Eclipse" | "Planet Visibility" | "Launch" | "Conjunction";
  title: string;
  date: string;
  description: string;
  visibility: "Excellent" | "Good" | "Fair" | "Poor";
  duration?: string;
};

export const upcomingEvents: SpaceEvent[] = [
  { id: "1", type: "ISS Flyover", title: "ISS Visible Pass", date: "2026-06-12T21:14:00Z", description: "Bright pass over your location, 6 minutes duration, peak elevation 67°.", visibility: "Excellent", duration: "6 min" },
  { id: "2", type: "Meteor Shower", title: "Geminids Peak", date: "2026-12-14T04:00:00Z", description: "Up to 150 meteors per hour radiating from Gemini constellation.", visibility: "Excellent" },
  { id: "3", type: "Eclipse", title: "Partial Lunar Eclipse", date: "2026-08-28T03:12:00Z", description: "Moon passes through Earth's penumbra. Visible across Asia and Pacific.", visibility: "Good", duration: "3h 22m" },
  { id: "4", type: "Planet Visibility", title: "Jupiter at Opposition", date: "2026-09-21T00:00:00Z", description: "Jupiter shines brightest, visible all night long.", visibility: "Excellent" },
  { id: "5", type: "Launch", title: "Falcon 9 — Starlink 8-12", date: "2026-06-15T12:30:00Z", description: "SpaceX launch from Cape Canaveral SLC-40.", visibility: "Good" },
  { id: "6", type: "Conjunction", title: "Venus–Saturn Conjunction", date: "2026-07-02T18:45:00Z", description: "Venus and Saturn within 1° of each other at dusk.", visibility: "Good" },
];

export const spaceWeather = {
  solarFlux: 142,
  kpIndex: 4.3,
  solarWindKms: 487,
  protonFlux: 0.18,
  auroraForecast: "Moderate — visible at 55°+ latitude",
  alerts: [
    { id: "a1", level: "warning" as const, title: "M-class Solar Flare detected", time: "12 min ago" },
    { id: "a2", level: "info" as const, title: "CME forecast: arrival 14 Jun 02:00 UTC", time: "1 hr ago" },
    { id: "a3", level: "success" as const, title: "Geomagnetic field returning to quiet", time: "3 hr ago" },
  ],
  kpHistory: [2.1, 2.4, 3.0, 3.7, 4.2, 4.3, 4.1, 3.9, 4.0, 4.3, 4.6, 4.3],
  solarWindHistory: [410, 425, 440, 462, 478, 487, 495, 489, 481, 487, 492, 487],
};

export const visibleTonight = [
  { name: "Jupiter", type: "Planet", magnitude: -2.4, altitude: 62, azimuth: "SE", best: "22:40" },
  { name: "Saturn", type: "Planet", magnitude: 0.6, altitude: 38, azimuth: "S", best: "23:10" },
  { name: "ISS", type: "Satellite", magnitude: -3.1, altitude: 67, azimuth: "W→NE", best: "21:14" },
  { name: "Orion Nebula", type: "DSO", magnitude: 4.0, altitude: 44, azimuth: "SE", best: "00:20" },
  { name: "Andromeda Galaxy", type: "DSO", magnitude: 3.4, altitude: 51, azimuth: "NE", best: "01:00" },
  { name: "Sirius", type: "Star", magnitude: -1.46, altitude: 30, azimuth: "S", best: "23:50" },
];

export const stats = {
  activeSatellites: 9472,
  spaceDebris: 36500,
  upcomingEvents: 142,
  trackedObjects: 28310,
};
