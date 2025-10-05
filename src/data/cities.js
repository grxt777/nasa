// Complete list of all available cities from NASA weather data
export const cities = [
  // Major World Cities
  { id: 'london', name: 'London', country: 'UK', lat: 51.5072, lng: -0.1276, csvFile: 'nasa_weather_London_1999_2024.csv' },
  { id: 'newyork', name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060, csvFile: 'nasa_weather_New_York_City_1999_2024.csv' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, csvFile: 'nasa_weather_Tokyo_1999_2024.csv' },
  { id: 'paris', name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, csvFile: 'nasa_weather_Paris_1999_2024.csv' },
  { id: 'sydney', name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, csvFile: 'nasa_weather_Sydney_1999_2024.csv' },
  { id: 'beijing', name: 'Beijing', country: 'China', lat: 39.9042, lng: 116.4074, csvFile: 'nasa_weather_Beijing_1999_2024.csv' },
  { id: 'cairo', name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357, csvFile: 'nasa_weather_Cairo_1999_2024.csv' },
  { id: 'delhi', name: 'Delhi', country: 'India', lat: 28.7041, lng: 77.1025, csvFile: 'nasa_weather_Delhi_1999_2024.csv' },
  { id: 'dubai', name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, csvFile: 'nasa_weather_Dubai_1999_2024.csv' },
  { id: 'istanbul', name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, csvFile: 'nasa_weather_Istanbul_1999_2024.csv' },
  { id: 'madrid', name: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038, csvFile: 'nasa_weather_Madrid_1999_2024.csv' },
  { id: 'rome', name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, csvFile: 'nasa_weather_Rome_1999_2024.csv' },
  { id: 'seoul', name: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.9780, csvFile: 'nasa_weather_Seoul_1999_2024.csv' },
  { id: 'bangkok', name: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018, csvFile: 'nasa_weather_Bangkok_1999_2024.csv' },
  { id: 'mexico', name: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, csvFile: 'nasa_weather_Mexico_City_1999_2024.csv' },
  { id: 'buenos', name: 'Buenos Aires', country: 'Argentina', lat: -34.6118, lng: -58.3960, csvFile: 'nasa_weather_Buenos_Aires_1999_2024.csv' },
  { id: 'chicago', name: 'Chicago', country: 'USA', lat: 41.8781, lng: -87.6298, csvFile: 'nasa_weather_Chicago_1999_2024.csv' },
  { id: 'losangeles', name: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437, csvFile: 'nasa_weather_Los_Angeles_1999_2024.csv' },
  { id: 'oslo', name: 'Oslo', country: 'Norway', lat: 59.9139, lng: 10.7522, csvFile: 'nasa_weather_Oslo_1999_2024.csv' },
  { id: 'reykjavik', name: 'Reykjavik', country: 'Iceland', lat: 64.1466, lng: -21.9426, csvFile: 'nasa_weather_Reykjavik_1999_2024.csv' },
  
  // European Cities
  { id: 'berlin', name: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, csvFile: 'nasa_weather_Berlin_1999_2024.csv' },
  { id: 'moscow', name: 'Moscow', country: 'Russia', lat: 55.7558, lng: 37.6176, csvFile: 'nasa_weather_Berlin_1999_2024.csv' }, // Using Berlin as closest available
  
  // Asian Cities
  { id: 'almaty', name: 'Almaty', country: 'Kazakhstan', lat: 43.2220, lng: 76.8512, csvFile: 'nasa_weather_Almaty_1999_2024.csv' },
  { id: 'andijan', name: 'Andijan', country: 'Uzbekistan', lat: 40.7833, lng: 72.3333, csvFile: 'nasa_weather_Andijan_1999_2024.csv' },
  { id: 'bishkek', name: 'Bishkek', country: 'Kyrgyzstan', lat: 42.8746, lng: 74.5698, csvFile: 'nasa_weather_Bishkek_1999_2024.csv' },
  { id: 'bukhara', name: 'Bukhara', country: 'Uzbekistan', lat: 39.7756, lng: 64.4286, csvFile: 'nasa_weather_Bukhara_1999_2024.csv' },
  { id: 'fergana', name: 'Fergana', country: 'Uzbekistan', lat: 40.3842, lng: 71.7842, csvFile: 'nasa_weather_Fergana_1999_2024.csv' },
  { id: 'jizzakh', name: 'Jizzakh', country: 'Uzbekistan', lat: 40.1167, lng: 67.8500, csvFile: 'nasa_weather_Jizzakh_1999_2024.csv' },
  { id: 'kargil', name: 'Kargil', country: 'India', lat: 34.5578, lng: 76.1264, csvFile: 'nasa_weather_Kargil_1999_2024.csv' },
  { id: 'karshi', name: 'Karshi', country: 'Uzbekistan', lat: 38.8667, lng: 65.8000, csvFile: 'nasa_weather_Karshi_1999_2024.csv' },
  { id: 'namangan', name: 'Namangan', country: 'Uzbekistan', lat: 40.9983, lng: 71.6726, csvFile: 'nasa_weather_Namangan_1999_2024.csv' },
  { id: 'navoi', name: 'Navoi', country: 'Uzbekistan', lat: 40.0833, lng: 65.3667, csvFile: 'nasa_weather_Navoi_1999_2024.csv' },
  { id: 'nukus', name: 'Nukus', country: 'Uzbekistan', lat: 42.4667, lng: 59.6000, csvFile: 'nasa_weather_Nukus_1999_2024.csv' },
  { id: 'samarkand', name: 'Samarkand', country: 'Uzbekistan', lat: 39.6547, lng: 66.9597, csvFile: 'nasa_weather_Samarkand_1999_2024.csv' },
  { id: 'tashkent', name: 'Tashkent', country: 'Uzbekistan', lat: 41.2995, lng: 69.2401, csvFile: 'nasa_weather_Tashkent_1999_2024.csv' },
  { id: 'termez', name: 'Termez', country: 'Uzbekistan', lat: 37.2242, lng: 67.2783, csvFile: 'nasa_weather_Termez_1999_2024.csv' },
  { id: 'urgench', name: 'Urgench', country: 'Uzbekistan', lat: 41.5500, lng: 60.6333, csvFile: 'nasa_weather_Urgench_1999_2024.csv' },
  { id: 'zarafshan', name: 'Zarafshan', country: 'Uzbekistan', lat: 41.5833, lng: 64.2000, csvFile: 'nasa_weather_Zarafshan_1999_2024.csv' },
  
  // African Cities
  { id: 'nairobi', name: 'Nairobi', country: 'Kenya', lat: -1.2921, lng: 36.8219, csvFile: 'nasa_weather_Nairobi_1999_2024.csv' },
  { id: 'dori', name: 'Dori', country: 'Burkina Faso', lat: 14.0333, lng: -0.0333, csvFile: 'nasa_weather_Dori_1999_2024.csv' },
  { id: 'lodwar', name: 'Lodwar', country: 'Kenya', lat: 3.1167, lng: 35.6000, csvFile: 'nasa_weather_Lodwar_1999_2024.csv' },
  
  // Middle Eastern Cities
  { id: 'doha', name: 'Doha', country: 'Qatar', lat: 25.2854, lng: 51.5310, csvFile: 'nasa_weather_Doha_1999_2024.csv' },
  
  // Arctic/Extreme Climate Cities
  { id: 'barrow', name: 'Barrow (Utqiagvik)', country: 'USA', lat: 71.2906, lng: -156.7886, csvFile: 'nasa_weather_Barrow_Utqiagvik_1999_2024.csv' },
  { id: 'churchill', name: 'Churchill', country: 'Canada', lat: 58.7684, lng: -94.1649, csvFile: 'nasa_weather_Churchill_1999_2024.csv' },
  { id: 'haines', name: 'Haines Junction', country: 'Canada', lat: 60.7522, lng: -137.5108, csvFile: 'nasa_weather_Haines_Junction_1999_2024.csv' },
  { id: 'kiruna', name: 'Kiruna', country: 'Sweden', lat: 67.8558, lng: 20.2253, csvFile: 'nasa_weather_Kiruna_1999_2024.csv' },
  { id: 'norilsk', name: 'Norilsk', country: 'Russia', lat: 69.3498, lng: 88.2010, csvFile: 'nasa_weather_Norilsk_1999_2024.csv' },
  { id: 'puerto', name: 'Puerto Williams', country: 'Chile', lat: -54.9333, lng: -67.6167, csvFile: 'nasa_weather_Puerto_Williams_1999_2024.csv' },
  
  // Desert Cities
  { id: 'atar', name: 'Atar', country: 'Mauritania', lat: 20.5167, lng: -13.0500, csvFile: 'nasa_weather_Atar_1999_2024.csv' },
  { id: 'dalanzadgad', name: 'Dalanzadgad', country: 'Mongolia', lat: 43.5708, lng: 104.4250, csvFile: 'nasa_weather_Dalanzadgad_1999_2024.csv' },
  
  // Tropical Cities
  { id: 'chachapoyas', name: 'Chachapoyas', country: 'Peru', lat: -6.2297, lng: -77.8692, csvFile: 'nasa_weather_Chachapoyas_1999_2024.csv' },
  { id: 'leticia', name: 'Leticia', country: 'Colombia', lat: -4.2153, lng: -69.9406, csvFile: 'nasa_weather_Leticia_1999_2024.csv' },
  { id: 'funafuti', name: 'Funafuti', country: 'Tuvalu', lat: -8.5167, lng: 179.2000, csvFile: 'nasa_weather_Funafuti_1999_2024.csv' },
  { id: 'nuku', name: 'Nuku\'alofa', country: 'Tonga', lat: -21.1333, lng: -175.2000, csvFile: 'nasa_weather_Nuku_alofa_1999_2024.csv' },
  { id: 'port', name: 'Port Vila', country: 'Vanuatu', lat: -17.7333, lng: 168.3167, csvFile: 'nasa_weather_Port_Vila_1999_2024.csv' },
  
  // Mountain Cities
  { id: 'goris', name: 'Goris', country: 'Armenia', lat: 39.5167, lng: 46.3500, csvFile: 'nasa_weather_Goris_1999_2024.csv' },
  { id: 'gulistan', name: 'Gulistan', country: 'Uzbekistan', lat: 40.5000, lng: 68.7833, csvFile: 'nasa_weather_Gulistan_1999_2024.csv' }
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
