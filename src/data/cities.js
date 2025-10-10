// Complete list of all available cities from NASA weather data
export const cities = [
  // Major World Cities
  { id: 'london', name: 'London', country: 'UK', lat: 51.5072, lng: -0.1276 },
  { id: 'newyork', name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
  { id: 'paris', name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  { id: 'sydney', name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
  { id: 'beijing', name: 'Beijing', country: 'China', lat: 39.9042, lng: 116.4074 },
  { id: 'cairo', name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357 },
  { id: 'delhi', name: 'Delhi', country: 'India', lat: 28.7041, lng: 77.1025 },
  { id: 'dubai', name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708 },
  { id: 'istanbul', name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784 },
  { id: 'madrid', name: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038 },
  { id: 'rome', name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964 },
  { id: 'seoul', name: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.9780 },
  { id: 'bangkok', name: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018 },
  { id: 'mexico', name: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332 },
  { id: 'buenos', name: 'Buenos Aires', country: 'Argentina', lat: -34.6118, lng: -58.3960 },
  { id: 'chicago', name: 'Chicago', country: 'USA', lat: 41.8781, lng: -87.6298 },
  { id: 'losangeles', name: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437 },
  { id: 'oslo', name: 'Oslo', country: 'Norway', lat: 59.9139, lng: 10.7522 },
  { id: 'reykjavik', name: 'Reykjavik', country: 'Iceland', lat: 64.1466, lng: -21.9426 },
  
  // European Cities
  { id: 'berlin', name: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050 },
  { id: 'moscow', name: 'Moscow', country: 'Russia', lat: 55.7558, lng: 37.6176 },
  
  // Asian Cities
  { id: 'almaty', name: 'Almaty', country: 'Kazakhstan', lat: 43.2220, lng: 76.8512 },
  { id: 'andijan', name: 'Andijan', country: 'Uzbekistan', lat: 40.7833, lng: 72.3333 },
  { id: 'bishkek', name: 'Bishkek', country: 'Kyrgyzstan', lat: 42.8746, lng: 74.5698 },
  { id: 'bukhara', name: 'Bukhara', country: 'Uzbekistan', lat: 39.7756, lng: 64.4286 },
  { id: 'fergana', name: 'Fergana', country: 'Uzbekistan', lat: 40.3842, lng: 71.7842 },
  { id: 'jizzakh', name: 'Jizzakh', country: 'Uzbekistan', lat: 40.1167, lng: 67.8500 },
  { id: 'kargil', name: 'Kargil', country: 'India', lat: 34.5578, lng: 76.1264 },
  { id: 'karshi', name: 'Karshi', country: 'Uzbekistan', lat: 38.8667, lng: 65.8000 },
  { id: 'namangan', name: 'Namangan', country: 'Uzbekistan', lat: 40.9983, lng: 71.6726 },
  { id: 'navoi', name: 'Navoi', country: 'Uzbekistan', lat: 40.0833, lng: 65.3667 },
  { id: 'nukus', name: 'Nukus', country: 'Uzbekistan', lat: 42.4667, lng: 59.6000 },
  { id: 'samarkand', name: 'Samarkand', country: 'Uzbekistan', lat: 39.6547, lng: 66.9597 },
  { id: 'tashkent', name: 'Tashkent', country: 'Uzbekistan', lat: 41.2995, lng: 69.2401 },
  { id: 'termez', name: 'Termez', country: 'Uzbekistan', lat: 37.2242, lng: 67.2783 },
  { id: 'urgench', name: 'Urgench', country: 'Uzbekistan', lat: 41.5500, lng: 60.6333 },
  { id: 'zarafshan', name: 'Zarafshan', country: 'Uzbekistan', lat: 41.5833, lng: 64.2000 },
  
  // African Cities
  { id: 'nairobi', name: 'Nairobi', country: 'Kenya', lat: -1.2921, lng: 36.8219 },
  { id: 'dori', name: 'Dori', country: 'Burkina Faso', lat: 14.0333, lng: -0.0333 },
  { id: 'lodwar', name: 'Lodwar', country: 'Kenya', lat: 3.1167, lng: 35.6000 },
  
  // Middle Eastern Cities
  { id: 'doha', name: 'Doha', country: 'Qatar', lat: 25.2854, lng: 51.5310 },
  
  // Arctic/Extreme Climate Cities
  { id: 'barrow', name: 'Barrow (Utqiagvik)', country: 'USA', lat: 71.2906, lng: -156.7886 },
  { id: 'churchill', name: 'Churchill', country: 'Canada', lat: 58.7684, lng: -94.1649 },
  { id: 'haines', name: 'Haines Junction', country: 'Canada', lat: 60.7522, lng: -137.5108 },
  { id: 'kiruna', name: 'Kiruna', country: 'Sweden', lat: 67.8558, lng: 20.2253 },
  { id: 'norilsk', name: 'Norilsk', country: 'Russia', lat: 69.3498, lng: 88.2010 },
  { id: 'puerto', name: 'Puerto Williams', country: 'Chile', lat: -54.9333, lng: -67.6167 },
  
  // Desert Cities
  { id: 'atar', name: 'Atar', country: 'Mauritania', lat: 20.5167, lng: -13.0500 },
  { id: 'dalanzadgad', name: 'Dalanzadgad', country: 'Mongolia', lat: 43.5708, lng: 104.4250 },
  
  // Tropical Cities
  { id: 'chachapoyas', name: 'Chachapoyas', country: 'Peru', lat: -6.2297, lng: -77.8692 },
  { id: 'leticia', name: 'Leticia', country: 'Colombia', lat: -4.2153, lng: -69.9406 },
  { id: 'funafuti', name: 'Funafuti', country: 'Tuvalu', lat: -8.5167, lng: 179.2000 },
  { id: 'nuku', name: 'Nuku\'alofa', country: 'Tonga', lat: -21.1333, lng: -175.2000 },
  { id: 'port', name: 'Port Vila', country: 'Vanuatu', lat: -17.7333, lng: 168.3167 },
  
  // Mountain Cities
  { id: 'goris', name: 'Goris', country: 'Armenia', lat: 39.5167, lng: 46.3500 },
  { id: 'gulistan', name: 'Gulistan', country: 'Uzbekistan', lat: 40.5000, lng: 68.7833 }
];

// Available metrics from NASA data
export const availableMetrics = {
  'YEAR': 'Year',
  'DOY': 'Day of Year',
  'ALLSKY_SFC_UV_INDEX': 'UV Index',
  'T2M_MAX': 'Maximum Temperature',
  'T2M_MIN': 'Minimum Temperature',
  'RH2M': 'Relative Humidity',
  'WS2M': 'Wind Speed',
  'PRECTOTCORR': 'Precipitation',
  'CITY': 'City',
  'LAT': 'Latitude',
  'LON': 'Longitude'
};
