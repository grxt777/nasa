# Weather Analysis App - NASA Data

A comprehensive weather analysis application that uses historical NASA weather data to provide detailed climate analysis and predictions for specific dates and locations.

## Features

### 🗺️ Interactive Map
- Interactive map with markers for available cities
- Click on city markers to select location
- Hover tooltips for city information
- Real-time city selection

### 📊 Weather Information Cards (6 Cards)
1. **Temperature** - Average value with min/max range and trend indicator
2. **Precipitation** - Rain probability percentage with average precipitation
3. **Humidity** - Average humidity percentage with min/max range
4. **Wind** - Average wind speed with maximum recorded
5. **UV Index** - Solar radiation level with maximum values
6. **Overall Assessment** - Comfort score from 0-10 with interpretation

### 📈 Trends Graph
- Line chart showing climate variable changes over years
- Variable selector (temperature, humidity, wind, precipitation, UV)
- Trend line with confidence intervals
- Statistical analysis (average, trend direction)
- Period analysis (1999-2024)

### 🤖 AI Analysis Panel
- **Summary** - 2-3 sentences about climate conditions
- **Recommendations** - 1-3 practical tips with priority icons
- **Comfort Assessment** - Large numerical score with interpretation
- **Risk Factors** - List of potential risks with probabilities
- **Alternative Dates** - Best alternative periods if current date is risky
- **Gemini AI Integration** - Real AI-powered suggestions and feedback

### 🎛️ Left Sidebar Controls
- **City Selection** - Dropdown with 20+ available cities
- **Date Picker** - Single date selection (converts to Day of Year)
- **Action Buttons**:
  - "Показать результаты" - Main analysis button
  - "Скачать CSV" - Export tabular data
  - "Скачать JSON" - Export full report
  - "Сбросить" - Reset all selections

## How It Works

1. **User selects a city** (e.g., "Moscow") and date (e.g., "July 15")
2. **System converts date to Day of Year** (DOY = 196 for July 15)
3. **Filters NASA dataset** by CITY = "Moscow" and DOY = 196 for all available years
4. **Calculates metrics** based on the filtered sample (e.g., 25 records for 25 years)
5. **Displays comprehensive analysis** with AI insights and recommendations

## Data Source

- **NASA Weather Data**: 1999-2024 historical weather data (25+ years)
- **Cities Available**: 50+ cities worldwide including:
  - **Major World Cities**: London, New York, Tokyo, Paris, Sydney, Beijing, Cairo, Delhi, Dubai, Istanbul, Madrid, Rome, Seoul, Bangkok, Mexico City, Buenos Aires, Chicago, Los Angeles, Oslo, Reykjavik
  - **European Cities**: Berlin, Moscow (using Berlin data)
  - **Asian Cities**: Almaty, Andijan, Bishkek, Bukhara, Fergana, Jizzakh, Kargil, Karshi, Namangan, Navoi, Nukus, Samarkand, Tashkent, Termez, Urgench, Zarafshan
  - **African Cities**: Nairobi, Dori, Lodwar
  - **Middle Eastern Cities**: Doha
  - **Arctic/Extreme Climate Cities**: Barrow (Utqiagvik), Churchill, Haines Junction, Kiruna, Norilsk, Puerto Williams
  - **Desert Cities**: Atar, Dalanzadgad
  - **Tropical Cities**: Chachapoyas, Leticia, Funafuti, Nuku'alofa, Port Vila
  - **Mountain Cities**: Goris, Gulistan

- **Data Points**: Daily weather measurements including:
  - Temperature (max/min/average)
  - Precipitation (corrected)
  - Relative humidity
  - Wind speed
  - UV index
  - Geographic coordinates (lat/lon)
  - Day of Year (DOY)
  - Year

## Technical Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with React Chart.js 2
- **Maps**: Leaflet with React Leaflet
- **Data Processing**: Papa Parse for CSV, Simple Statistics
- **Icons**: Lucide React

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage

1. **Select a city** from the dropdown in the left sidebar
2. **Choose a date** using the date picker
3. **Click "Показать результаты"** to analyze weather data
4. **View results** in the main content area:
   - Interactive map with selected city highlighted
   - 6 weather information cards with metrics
   - Trends graph showing historical data
   - AI analysis panel with insights and recommendations
5. **Export data** using the download buttons (CSV/JSON)

## Data Processing

The application processes NASA weather data by:

1. **Loading CSV files** from the `/nasa_weather_data/` directory
2. **Converting dates to Day of Year** (DOY) for seasonal analysis
3. **Filtering data** by city and specific day of year
4. **Calculating statistics**:
   - Average, min, max values
   - Probabilities for extreme weather
   - Comfort scores based on multiple factors
   - Trend analysis over years
5. **Generating AI insights** based on historical patterns

## File Structure

```
src/
├── components/
│   ├── Sidebar.jsx              # Left sidebar with controls
│   ├── WeatherCards.jsx         # 6 weather information cards
│   ├── TrendsGraph.jsx          # Interactive trends chart
│   ├── AIAnalysisPanel.jsx      # AI analysis and recommendations
│   └── LeafletMap.jsx           # Interactive map component
├── hooks/
│   └── useWeatherData.js        # Weather data management hook
├── services/
│   └── nasaDataService.js       # NASA data loading service
├── utils/
│   └── dataProcessing.js        # Data processing utilities
└── App.jsx                      # Main application component
```

## Features in Detail

### Weather Cards
Each card displays:
- **Icon** representing the weather parameter
- **Main value** (large, prominent display)
- **Subtitle** with additional context (min/max, averages)
- **Detailed statistics** (median, standard deviation)
- **Color coding** based on values and comfort levels
- **Trend indicators** for temperature data
- **Comprehensive metrics** for all weather parameters

### AI Analysis
The AI analysis provides:
- **Contextual summaries** based on historical data
- **Practical recommendations** with priority levels
- **Risk assessment** with probability percentages
- **Alternative suggestions** for better weather conditions
- **Comfort scoring** from 0-10 with detailed interpretation
- **Data quality metrics** (completeness, reliability)
- **Forecast confidence** based on data availability

### Trends Analysis
The trends graph includes:
- **Variable selection** (temperature, humidity, wind, precipitation, UV)
- **Historical data** from 1999-2024
- **Trend line** showing overall direction
- **Statistical summary** (average, trend direction)
- **Interactive tooltips** with detailed information

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🤖 Gemini AI Integration

The app includes optional Gemini AI integration for enhanced weather suggestions and recommendations.

### Setup
1. Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Enter the API key in the configuration panel at the top of the page
3. The AI will provide personalized weather suggestions based on your selected city and date

### Features
- **Smart Recommendations**: AI-generated advice for outdoor activities
- **Alternative Dates**: AI-suggested better dates for your plans
- **Personalized Insights**: Tailored suggestions based on weather patterns
- **Russian Language**: All AI responses are in Russian for better user experience

## License

This project is licensed under the MIT License.