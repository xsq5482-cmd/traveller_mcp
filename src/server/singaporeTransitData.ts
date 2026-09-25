export interface MRTStationInfo {
  code: string;
  name: string;
  lines: string[];
  latitude: number;
  longitude: number;
  exits: { code: string; landmark: string; walkMeters: number; covered: boolean }[];
  undergroundConnections?: string[];
}

export const MRT_STATIONS: Record<string, MRTStationInfo> = {
  // Downtown Line & Circle Line & North-South / East-West hubs
  "LITTLE INDIA": {
    code: "NE7/DT12",
    name: "Little India",
    lines: ["NEL", "DTL"],
    latitude: 1.3068,
    longitude: 103.8492,
    exits: [
      { code: "Exit A", landmark: "Tekka Centre / Serangoon Rd", walkMeters: 45, covered: true },
      { code: "Exit E", landmark: "Rochor Canal Rd / Covered Walkway to Rochor", walkMeters: 20, covered: true }
    ],
    undergroundConnections: ["Rochor MRT", "Tekka Centre"]
  },
  "ROCHOR": {
    code: "DT13",
    name: "Rochor",
    lines: ["DTL"],
    latitude: 1.3038,
    longitude: 103.8526,
    exits: [
      { code: "Exit A", landmark: "Sim Lim Square / Sungei Rd", walkMeters: 30, covered: true },
      { code: "Exit B", landmark: "LASALLE College of the Arts", walkMeters: 40, covered: true }
    ]
  },
  "BUGIS": {
    code: "EW12/DT14",
    name: "Bugis",
    lines: ["EWL", "DTL"],
    latitude: 1.3005,
    longitude: 103.8559,
    exits: [
      { code: "Exit C", landmark: "Bugis Junction / Victoria St", walkMeters: 25, covered: true },
      { code: "Exit D", landmark: "Bugis+ / Tan Quee Lan St", walkMeters: 35, covered: true }
    ],
    undergroundConnections: ["Bugis Junction", "Duo Tower", "Guoco Midtown"]
  },
  "PROMENADE": {
    code: "CC4/DT15",
    name: "Promenade",
    lines: ["CCL", "DTL"],
    latitude: 1.2933,
    longitude: 103.8608,
    exits: [
      { code: "Exit A", landmark: "Millenia Walk / Covered Linkway", walkMeters: 50, covered: true },
      { code: "Exit C", landmark: "Suntec City Mall Direct Underground Link", walkMeters: 40, covered: true },
      { code: "Exit E", landmark: "Suntec City Convention & Exhibition Centre", walkMeters: 30, covered: true }
    ],
    undergroundConnections: ["Suntec City Mall", "Millenia Walk", "Marina Square"]
  },
  "BAYFRONT": {
    code: "CE1/DT16",
    name: "Bayfront",
    lines: ["CCL", "DTL"],
    latitude: 1.2818,
    longitude: 103.8591,
    exits: [
      { code: "Exit C", landmark: "Marina Bay Sands Hotel & Shoppes", walkMeters: 60, covered: true },
      { code: "Exit D", landmark: "The Shoppes at MBS & Waterfront Promenade", walkMeters: 55, covered: true },
      { code: "Exit B", landmark: "Gardens by the Bay Underground Link", walkMeters: 80, covered: true }
    ],
    undergroundConnections: ["Marina Bay Sands", "Gardens by the Bay"]
  },
  "ORCHARD": {
    code: "NS22/TE14",
    name: "Orchard",
    lines: ["NSL", "TEL"],
    latitude: 1.3040,
    longitude: 103.8318,
    exits: [
      { code: "Exit 1", landmark: "ION Orchard Basement Direct", walkMeters: 20, covered: true },
      { code: "Exit 2", landmark: "Tangs / Lucky Plaza", walkMeters: 40, covered: true },
      { code: "Exit 4", landmark: "Wisma Atria Underground Pass", walkMeters: 50, covered: true }
    ],
    undergroundConnections: ["ION Orchard", "Wheelock Place", "Wisma Atria", "Ngee Ann City"]
  },
  "ORCHARD BOULEVARD": {
    code: "TE13",
    name: "Orchard Boulevard",
    lines: ["TEL"],
    latitude: 1.3023,
    longitude: 103.8240,
    exits: [
      { code: "Exit 1", landmark: "Camden Medical Centre / Orchard Blvd", walkMeters: 30, covered: true }
    ]
  },
  "DHOBY GHAUT": {
    code: "NS24/NE6/CC1",
    name: "Dhoby Ghaut",
    lines: ["NSL", "NEL", "CCL"],
    latitude: 1.2989,
    longitude: 103.8458,
    exits: [
      { code: "Exit E", landmark: "Plaza Singapura Basement Concourse", walkMeters: 20, covered: true },
      { code: "Exit A", landmark: "Orchard Road / Istana Park", walkMeters: 50, covered: false }
    ],
    undergroundConnections: ["Plaza Singapura", "The Atrium@Orchard"]
  },
  "CITY HALL": {
    code: "NS25/EW13",
    name: "City Hall",
    lines: ["NSL", "EWL"],
    latitude: 1.2931,
    longitude: 103.8520,
    exits: [
      { code: "Exit A", landmark: "Raffles City Shopping Centre", walkMeters: 25, covered: true },
      { code: "Exit B", landmark: "St Andrew's Cathedral / Capitol Singapore", walkMeters: 45, covered: true }
    ],
    undergroundConnections: ["Raffles City", "CityLink Mall", "Esplanade MRT", "Marina Square"]
  },
  "RAFFLES PLACE": {
    code: "NS26/EW14",
    name: "Raffles Place",
    lines: ["NSL", "EWL"],
    latitude: 1.2839,
    longitude: 103.8515,
    exits: [
      { code: "Exit A", landmark: "Caltex House / Chevron House", walkMeters: 30, covered: true },
      { code: "Exit H", landmark: "Battery Road / Fullerton Square", walkMeters: 40, covered: true }
    ]
  },
  "MARINA BAY": {
    code: "NS27/CE2/TE20",
    name: "Marina Bay",
    lines: ["NSL", "CCL", "TEL"],
    latitude: 1.2764,
    longitude: 103.8546,
    exits: [
      { code: "Exit A", landmark: "Marina Bay Financial Centre (MBFC)", walkMeters: 50, covered: true },
      { code: "Exit B", landmark: "Central Boulevard", walkMeters: 40, covered: true }
    ]
  },
  "JURONG EAST": {
    code: "NS1/EW24",
    name: "Jurong East",
    lines: ["NSL", "EWL"],
    latitude: 1.3331,
    longitude: 103.7423,
    exits: [
      { code: "Exit A", landmark: "Jurong East Bus Interchange / Westgate", walkMeters: 30, covered: true },
      { code: "Exit D", landmark: "JEM / IMM J-Walk Elevated Walkway", walkMeters: 25, covered: true }
    ],
    undergroundConnections: ["Westgate", "JEM", "J-Walk"]
  },
  "CHANGI AIRPORT": {
    code: "CG2",
    name: "Changi Airport",
    lines: ["EWL"],
    latitude: 1.3573,
    longitude: 103.9885,
    exits: [
      { code: "Exit T2", landmark: "Terminal 2 Arrival / Departure Concourse", walkMeters: 40, covered: true },
      { code: "Exit T3", landmark: "Terminal 3 Arrival / Departure Concourse", walkMeters: 40, covered: true },
      { code: "Jewel Link", landmark: "Jewel Changi Airport Skytrain / Link Bridge", walkMeters: 90, covered: true }
    ]
  },
  "EXPO": {
    code: "CG1/DT35",
    name: "Expo",
    lines: ["EWL", "DTL"],
    latitude: 1.3353,
    longitude: 103.9616,
    exits: [
      { code: "Exit A", landmark: "Singapore EXPO Convention Centre", walkMeters: 40, covered: true }
    ]
  },
  "TAMPINES": {
    code: "EW2/DT32",
    name: "Tampines",
    lines: ["EWL", "DTL"],
    latitude: 1.3526,
    longitude: 103.9452,
    exits: [
      { code: "Exit A", landmark: "Tampines 1 / Bus Interchange", walkMeters: 30, covered: true },
      { code: "Exit C", landmark: "Tampines Mall & Century Square", walkMeters: 25, covered: true }
    ]
  },
  "BISHAN": {
    code: "NS17/CC15",
    name: "Bishan",
    lines: ["NSL", "CCL"],
    latitude: 1.3508,
    longitude: 103.8481,
    exits: [
      { code: "Exit A", landmark: "Junction 8 Shopping Mall", walkMeters: 30, covered: true }
    ]
  },
  "PAYA LEBAR": {
    code: "EW8/CC9",
    name: "Paya Lebar",
    lines: ["EWL", "CCL"],
    latitude: 1.3178,
    longitude: 103.8924,
    exits: [
      { code: "Exit A", landmark: "PLQ Mall / Paya Lebar Square", walkMeters: 20, covered: true }
    ]
  },
  "SERANGOON": {
    code: "NE12/CC13",
    name: "Serangoon",
    lines: ["NEL", "CCL"],
    latitude: 1.3497,
    longitude: 103.8736,
    exits: [
      { code: "Exit B", landmark: "NEX Shopping Mall Concourse", walkMeters: 25, covered: true }
    ]
  },
  "HARBOURFRONT": {
    code: "NE1/CC29",
    name: "HarbourFront",
    lines: ["NEL", "CCL"],
    latitude: 1.2654,
    longitude: 103.8224,
    exits: [
      { code: "Exit B", landmark: "VivoCity Concourse / Sentosa Express", walkMeters: 30, covered: true },
      { code: "Exit C", landmark: "HarbourFront Centre / Ferry Terminal", walkMeters: 45, covered: true }
    ]
  },
  "CHINATOWN": {
    code: "NE4/DT19",
    name: "Chinatown",
    lines: ["NEL", "DTL"],
    latitude: 1.2843,
    longitude: 103.8440,
    exits: [
      { code: "Exit A", landmark: "Pagoda Street / Chinatown Heritage", walkMeters: 25, covered: false },
      { code: "Exit E", landmark: "Chinatown Point Shopping Mall", walkMeters: 30, covered: true }
    ]
  },
  "OUTRAM PARK": {
    code: "EW16/NE3/TE17",
    name: "Outram Park",
    lines: ["EWL", "NEL", "TEL"],
    latitude: 1.2801,
    longitude: 103.8395,
    exits: [
      { code: "Exit 1", landmark: "Singapore General Hospital (SGH)", walkMeters: 55, covered: true }
    ]
  }
};

export const FAMOUS_LANDMARKS: Record<string, {
  name: string;
  address: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  nearestMRT: string;
  walkingMetersToMRT: number;
  coveredWalkway: boolean;
}> = {
  "SUNTEC CITY": {
    name: "Suntec City",
    address: "3 Temasek Boulevard Suntec City Singapore 039594",
    postalCode: "039594",
    latitude: 1.2935,
    longitude: 103.8572,
    nearestMRT: "PROMENADE",
    walkingMetersToMRT: 180,
    coveredWalkway: true
  },
  "MARINA BAY SANDS": {
    name: "Marina Bay Sands",
    address: "10 Bayfront Avenue Singapore 018956",
    postalCode: "018956",
    latitude: 1.2838,
    longitude: 103.8590,
    nearestMRT: "BAYFRONT",
    walkingMetersToMRT: 120,
    coveredWalkway: true
  },
  "CHANGI AIRPORT": {
    name: "Singapore Changi Airport",
    address: "Airport Boulevard Singapore 819663",
    postalCode: "819663",
    latitude: 1.3644,
    longitude: 103.9915,
    nearestMRT: "CHANGI AIRPORT",
    walkingMetersToMRT: 80,
    coveredWalkway: true
  },
  "GARDENS BY THE BAY": {
    name: "Gardens by the Bay",
    address: "18 Marina Gardens Drive Singapore 018953",
    postalCode: "018953",
    latitude: 1.2816,
    longitude: 103.8636,
    nearestMRT: "BAYFRONT",
    walkingMetersToMRT: 350,
    coveredWalkway: true
  },
  "KAMPONG GLAM": {
    name: "Kampong Glam (Arab Street / Haji Lane)",
    address: "Arab Street Singapore 199742",
    postalCode: "199742",
    latitude: 1.3015,
    longitude: 103.8590,
    nearestMRT: "BUGIS",
    walkingMetersToMRT: 420,
    coveredWalkway: false
  },
  "JEWEL CHANGI AIRPORT": {
    name: "Jewel Changi Airport",
    address: "78 Airport Boulevard Singapore 819666",
    postalCode: "819666",
    latitude: 1.3602,
    longitude: 103.9897,
    nearestMRT: "CHANGI AIRPORT",
    walkingMetersToMRT: 150,
    coveredWalkway: true
  },
  "VIVOCITY": {
    name: "VivoCity",
    address: "1 HarbourFront Walk Singapore 098585",
    postalCode: "098585",
    latitude: 1.2644,
    longitude: 103.8222,
    nearestMRT: "HARBOURFRONT",
    walkingMetersToMRT: 50,
    coveredWalkway: true
  },
  "ION ORCHARD": {
    name: "ION Orchard",
    address: "2 Orchard Turn Singapore 238801",
    postalCode: "238801",
    latitude: 1.3040,
    longitude: 103.8319,
    nearestMRT: "ORCHARD",
    walkingMetersToMRT: 20,
    coveredWalkway: true
  }
};

export const POPULAR_BUS_STOPS: Record<string, {
  busStopCode: string;
  description: string;
  roadName: string;
  latitude: number;
  longitude: number;
  services: string[];
}> = {
  "83139": {
    busStopCode: "83139",
    description: "Opp Blk 910",
    roadName: "Tampines Ave 5",
    latitude: 1.3503,
    longitude: 103.9423,
    services: ["15", "23", "27", "34", "168"]
  },
  "01012": {
    busStopCode: "01012",
    description: "Hotel Rendezvous / Opp Bencoolen Stn",
    roadName: "Bras Basah Rd",
    latitude: 1.2980,
    longitude: 103.8504,
    services: ["7", "14", "16", "36", "77", "106", "111", "175"]
  },
  "03071": {
    busStopCode: "03071",
    description: "Suntec City",
    roadName: "Temasek Blvd",
    latitude: 1.2936,
    longitude: 103.8584,
    services: ["36", "97", "106", "111", "133", "502", "518"]
  },
  "09048": {
    busStopCode: "09048",
    description: "Orchard Plaza",
    roadName: "Orchard Rd",
    latitude: 1.3013,
    longitude: 103.8398,
    services: ["123", "143", "162", "167", "174", "190", "502"]
  },
  "04168": {
    busStopCode: "04168",
    description: "Little India Stn Exit A",
    roadName: "Bukit Timah Rd",
    latitude: 1.3065,
    longitude: 103.8488,
    services: ["48", "66", "67", "170", "960"]
  },
  "28009": {
    busStopCode: "28009",
    description: "Jurong East Int",
    roadName: "Jurong Gateway Rd",
    latitude: 1.3336,
    longitude: 103.7420,
    services: ["51", "52", "66", "78", "79", "97", "105", "143", "183", "334", "506"]
  }
};
