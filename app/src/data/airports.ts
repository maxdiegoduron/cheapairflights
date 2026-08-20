export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

/**
 * Major world airports, bundled so the picker works offline and costs no
 * API quota. Add entries here as needed — nothing else needs to change.
 */
export const AIRPORTS: Airport[] = [
  // United States
  { code: "ATL", name: "Hartsfield–Jackson Atlanta International", city: "Atlanta", country: "United States" },
  { code: "AUS", name: "Austin–Bergstrom International", city: "Austin", country: "United States" },
  { code: "BNA", name: "Nashville International", city: "Nashville", country: "United States" },
  { code: "BOS", name: "Logan International", city: "Boston", country: "United States" },
  { code: "BWI", name: "Baltimore/Washington International", city: "Baltimore", country: "United States" },
  { code: "CLE", name: "Cleveland Hopkins International", city: "Cleveland", country: "United States" },
  { code: "CLT", name: "Charlotte Douglas International", city: "Charlotte", country: "United States" },
  { code: "CMH", name: "John Glenn Columbus International", city: "Columbus", country: "United States" },
  { code: "DAL", name: "Dallas Love Field", city: "Dallas", country: "United States" },
  { code: "DCA", name: "Ronald Reagan Washington National", city: "Washington", country: "United States" },
  { code: "DEN", name: "Denver International", city: "Denver", country: "United States" },
  { code: "DFW", name: "Dallas/Fort Worth International", city: "Dallas", country: "United States" },
  { code: "DTW", name: "Detroit Metropolitan Wayne County", city: "Detroit", country: "United States" },
  { code: "EWR", name: "Newark Liberty International", city: "Newark", country: "United States" },
  { code: "FLL", name: "Fort Lauderdale–Hollywood International", city: "Fort Lauderdale", country: "United States" },
  { code: "HNL", name: "Daniel K. Inouye International", city: "Honolulu", country: "United States" },
  { code: "IAD", name: "Washington Dulles International", city: "Washington", country: "United States" },
  { code: "IAH", name: "George Bush Intercontinental", city: "Houston", country: "United States" },
  { code: "IND", name: "Indianapolis International", city: "Indianapolis", country: "United States" },
  { code: "JFK", name: "John F. Kennedy International", city: "New York", country: "United States" },
  { code: "LAS", name: "Harry Reid International", city: "Las Vegas", country: "United States" },
  { code: "LAX", name: "Los Angeles International", city: "Los Angeles", country: "United States" },
  { code: "LGA", name: "LaGuardia", city: "New York", country: "United States" },
  { code: "MCI", name: "Kansas City International", city: "Kansas City", country: "United States" },
  { code: "MCO", name: "Orlando International", city: "Orlando", country: "United States" },
  { code: "MDW", name: "Chicago Midway International", city: "Chicago", country: "United States" },
  { code: "MIA", name: "Miami International", city: "Miami", country: "United States" },
  { code: "MSP", name: "Minneapolis–Saint Paul International", city: "Minneapolis", country: "United States" },
  { code: "MSY", name: "Louis Armstrong New Orleans International", city: "New Orleans", country: "United States" },
  { code: "OAK", name: "Oakland International", city: "Oakland", country: "United States" },
  { code: "ORD", name: "O'Hare International", city: "Chicago", country: "United States" },
  { code: "PDX", name: "Portland International", city: "Portland", country: "United States" },
  { code: "PHL", name: "Philadelphia International", city: "Philadelphia", country: "United States" },
  { code: "PHX", name: "Phoenix Sky Harbor International", city: "Phoenix", country: "United States" },
  { code: "PIT", name: "Pittsburgh International", city: "Pittsburgh", country: "United States" },
  { code: "RDU", name: "Raleigh–Durham International", city: "Raleigh", country: "United States" },
  { code: "SAN", name: "San Diego International", city: "San Diego", country: "United States" },
  { code: "SAT", name: "San Antonio International", city: "San Antonio", country: "United States" },
  { code: "SEA", name: "Seattle–Tacoma International", city: "Seattle", country: "United States" },
  { code: "SFO", name: "San Francisco International", city: "San Francisco", country: "United States" },
  { code: "SJC", name: "Norman Y. Mineta San José International", city: "San Jose", country: "United States" },
  { code: "SLC", name: "Salt Lake City International", city: "Salt Lake City", country: "United States" },
  { code: "SMF", name: "Sacramento International", city: "Sacramento", country: "United States" },
  { code: "STL", name: "St. Louis Lambert International", city: "St. Louis", country: "United States" },
  { code: "TPA", name: "Tampa International", city: "Tampa", country: "United States" },

  // Canada
  { code: "YEG", name: "Edmonton International", city: "Edmonton", country: "Canada" },
  { code: "YHZ", name: "Halifax Stanfield International", city: "Halifax", country: "Canada" },
  { code: "YOW", name: "Ottawa Macdonald–Cartier International", city: "Ottawa", country: "Canada" },
  { code: "YUL", name: "Montréal–Trudeau International", city: "Montreal", country: "Canada" },
  { code: "YVR", name: "Vancouver International", city: "Vancouver", country: "Canada" },
  { code: "YYC", name: "Calgary International", city: "Calgary", country: "Canada" },
  { code: "YYZ", name: "Toronto Pearson International", city: "Toronto", country: "Canada" },

  // Mexico, Central America & Caribbean
  { code: "CUN", name: "Cancún International", city: "Cancun", country: "Mexico" },
  { code: "GDL", name: "Guadalajara International", city: "Guadalajara", country: "Mexico" },
  { code: "MEX", name: "Mexico City International", city: "Mexico City", country: "Mexico" },
  { code: "MTY", name: "Monterrey International", city: "Monterrey", country: "Mexico" },
  { code: "SJD", name: "Los Cabos International", city: "San José del Cabo", country: "Mexico" },
  { code: "PVR", name: "Puerto Vallarta International", city: "Puerto Vallarta", country: "Mexico" },
  { code: "HAV", name: "José Martí International", city: "Havana", country: "Cuba" },
  { code: "PTY", name: "Tocumen International", city: "Panama City", country: "Panama" },
  { code: "PUJ", name: "Punta Cana International", city: "Punta Cana", country: "Dominican Republic" },
  { code: "SJO", name: "Juan Santamaría International", city: "San José", country: "Costa Rica" },
  { code: "SJU", name: "Luis Muñoz Marín International", city: "San Juan", country: "Puerto Rico" },
  { code: "MBJ", name: "Sangster International", city: "Montego Bay", country: "Jamaica" },
  { code: "NAS", name: "Lynden Pindling International", city: "Nassau", country: "Bahamas" },

  // South America
  { code: "BOG", name: "El Dorado International", city: "Bogotá", country: "Colombia" },
  { code: "EZE", name: "Ministro Pistarini International", city: "Buenos Aires", country: "Argentina" },
  { code: "GIG", name: "Rio de Janeiro/Galeão International", city: "Rio de Janeiro", country: "Brazil" },
  { code: "GRU", name: "São Paulo/Guarulhos International", city: "São Paulo", country: "Brazil" },
  { code: "LIM", name: "Jorge Chávez International", city: "Lima", country: "Peru" },
  { code: "MDE", name: "José María Córdova International", city: "Medellín", country: "Colombia" },
  { code: "SCL", name: "Arturo Merino Benítez International", city: "Santiago", country: "Chile" },
  { code: "UIO", name: "Mariscal Sucre International", city: "Quito", country: "Ecuador" },

  // United Kingdom & Ireland
  { code: "DUB", name: "Dublin Airport", city: "Dublin", country: "Ireland" },
  { code: "EDI", name: "Edinburgh Airport", city: "Edinburgh", country: "United Kingdom" },
  { code: "LGW", name: "Gatwick Airport", city: "London", country: "United Kingdom" },
  { code: "LHR", name: "Heathrow Airport", city: "London", country: "United Kingdom" },
  { code: "LTN", name: "Luton Airport", city: "London", country: "United Kingdom" },
  { code: "MAN", name: "Manchester Airport", city: "Manchester", country: "United Kingdom" },
  { code: "STN", name: "Stansted Airport", city: "London", country: "United Kingdom" },

  // Europe
  { code: "AMS", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "Netherlands" },
  { code: "ARN", name: "Stockholm Arlanda", city: "Stockholm", country: "Sweden" },
  { code: "ATH", name: "Athens International", city: "Athens", country: "Greece" },
  { code: "BCN", name: "Josep Tarradellas Barcelona–El Prat", city: "Barcelona", country: "Spain" },
  { code: "BER", name: "Berlin Brandenburg", city: "Berlin", country: "Germany" },
  { code: "BRU", name: "Brussels Airport", city: "Brussels", country: "Belgium" },
  { code: "BUD", name: "Budapest Ferenc Liszt International", city: "Budapest", country: "Hungary" },
  { code: "CDG", name: "Charles de Gaulle", city: "Paris", country: "France" },
  { code: "CPH", name: "Copenhagen Airport", city: "Copenhagen", country: "Denmark" },
  { code: "DUS", name: "Düsseldorf Airport", city: "Düsseldorf", country: "Germany" },
  { code: "FCO", name: "Leonardo da Vinci–Fiumicino", city: "Rome", country: "Italy" },
  { code: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany" },
  { code: "GVA", name: "Geneva Airport", city: "Geneva", country: "Switzerland" },
  { code: "HEL", name: "Helsinki-Vantaa", city: "Helsinki", country: "Finland" },
  { code: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey" },
  { code: "KEF", name: "Keflavík International", city: "Reykjavík", country: "Iceland" },
  { code: "LIS", name: "Humberto Delgado Airport", city: "Lisbon", country: "Portugal" },
  { code: "MAD", name: "Adolfo Suárez Madrid–Barajas", city: "Madrid", country: "Spain" },
  { code: "MUC", name: "Munich Airport", city: "Munich", country: "Germany" },
  { code: "MXP", name: "Milan Malpensa", city: "Milan", country: "Italy" },
  { code: "ORY", name: "Paris Orly", city: "Paris", country: "France" },
  { code: "OSL", name: "Oslo Gardermoen", city: "Oslo", country: "Norway" },
  { code: "PRG", name: "Václav Havel Airport Prague", city: "Prague", country: "Czech Republic" },
  { code: "VCE", name: "Venice Marco Polo", city: "Venice", country: "Italy" },
  { code: "VIE", name: "Vienna International", city: "Vienna", country: "Austria" },
  { code: "WAW", name: "Warsaw Chopin", city: "Warsaw", country: "Poland" },
  { code: "ZRH", name: "Zurich Airport", city: "Zurich", country: "Switzerland" },

  // Middle East & Africa
  { code: "AUH", name: "Zayed International", city: "Abu Dhabi", country: "United Arab Emirates" },
  { code: "CAI", name: "Cairo International", city: "Cairo", country: "Egypt" },
  { code: "CPT", name: "Cape Town International", city: "Cape Town", country: "South Africa" },
  { code: "DOH", name: "Hamad International", city: "Doha", country: "Qatar" },
  { code: "DXB", name: "Dubai International", city: "Dubai", country: "United Arab Emirates" },
  { code: "JNB", name: "O. R. Tambo International", city: "Johannesburg", country: "South Africa" },
  { code: "LOS", name: "Murtala Muhammed International", city: "Lagos", country: "Nigeria" },
  { code: "NBO", name: "Jomo Kenyatta International", city: "Nairobi", country: "Kenya" },
  { code: "RUH", name: "King Khalid International", city: "Riyadh", country: "Saudi Arabia" },
  { code: "TLV", name: "Ben Gurion Airport", city: "Tel Aviv", country: "Israel" },
  { code: "CMN", name: "Mohammed V International", city: "Casablanca", country: "Morocco" },

  // Asia
  { code: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand" },
  { code: "BOM", name: "Chhatrapati Shivaji Maharaj International", city: "Mumbai", country: "India" },
  { code: "CAN", name: "Guangzhou Baiyun International", city: "Guangzhou", country: "China" },
  { code: "CGK", name: "Soekarno–Hatta International", city: "Jakarta", country: "Indonesia" },
  { code: "DEL", name: "Indira Gandhi International", city: "Delhi", country: "India" },
  { code: "DPS", name: "Ngurah Rai International", city: "Bali", country: "Indonesia" },
  { code: "HAN", name: "Noi Bai International", city: "Hanoi", country: "Vietnam" },
  { code: "HKG", name: "Hong Kong International", city: "Hong Kong", country: "Hong Kong" },
  { code: "HND", name: "Tokyo Haneda", city: "Tokyo", country: "Japan" },
  { code: "ICN", name: "Incheon International", city: "Seoul", country: "South Korea" },
  { code: "KIX", name: "Kansai International", city: "Osaka", country: "Japan" },
  { code: "KUL", name: "Kuala Lumpur International", city: "Kuala Lumpur", country: "Malaysia" },
  { code: "MNL", name: "Ninoy Aquino International", city: "Manila", country: "Philippines" },
  { code: "NRT", name: "Narita International", city: "Tokyo", country: "Japan" },
  { code: "PEK", name: "Beijing Capital International", city: "Beijing", country: "China" },
  { code: "PKX", name: "Beijing Daxing International", city: "Beijing", country: "China" },
  { code: "PVG", name: "Shanghai Pudong International", city: "Shanghai", country: "China" },
  { code: "SGN", name: "Tan Son Nhat International", city: "Ho Chi Minh City", country: "Vietnam" },
  { code: "SIN", name: "Singapore Changi", city: "Singapore", country: "Singapore" },
  { code: "TPE", name: "Taiwan Taoyuan International", city: "Taipei", country: "Taiwan" },

  // Oceania
  { code: "AKL", name: "Auckland Airport", city: "Auckland", country: "New Zealand" },
  { code: "BNE", name: "Brisbane Airport", city: "Brisbane", country: "Australia" },
  { code: "CHC", name: "Christchurch International", city: "Christchurch", country: "New Zealand" },
  { code: "MEL", name: "Melbourne Airport", city: "Melbourne", country: "Australia" },
  { code: "PER", name: "Perth Airport", city: "Perth", country: "Australia" },
  { code: "SYD", name: "Sydney Kingsford Smith", city: "Sydney", country: "Australia" },
];

const BY_CODE = new Map(AIRPORTS.map((a) => [a.code, a]));

export function findAirport(code: string): Airport | undefined {
  return BY_CODE.get(code.toUpperCase());
}

export function searchAirports(query: string): Airport[] {
  const q = query.trim().toLowerCase();
  if (!q) return AIRPORTS;

  // Exact code matches first, then city, then everything else that matches.
  const scored = AIRPORTS.map((a) => {
    const code = a.code.toLowerCase();
    const city = a.city.toLowerCase();
    const name = a.name.toLowerCase();

    let score = -1;
    if (code === q) score = 0;
    else if (code.startsWith(q)) score = 1;
    else if (city.startsWith(q)) score = 2;
    else if (city.includes(q)) score = 3;
    else if (name.toLowerCase().includes(q)) score = 4;
    else if (a.country.toLowerCase().includes(q)) score = 5;

    return { airport: a, score };
  }).filter((s) => s.score >= 0);

  scored.sort((a, b) => a.score - b.score || a.airport.city.localeCompare(b.airport.city));
  return scored.map((s) => s.airport);
}
