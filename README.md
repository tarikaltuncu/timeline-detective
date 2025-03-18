# Timeline Detective

Timeline Detective is a web application that analyzes your Google Maps timeline data to determine how much time you've spent at specific locations. This tool helps you visualize your location history and quantify the time spent at places that matter to you.

## Features

- Upload and parse Google Maps timeline JSON data
- Interactive map interface to select locations of interest
- Adjustable proximity radius to define the area of interest
- Calculate time spent within selected areas based on visit data
- View results aggregated by day, week, or month
- Export results to CSV for further analysis

## Table of Contents

- [Quick Start](#quick-start)
- [Detailed Usage Guide](#detailed-usage-guide)
- [Local Development](#local-development)
- [Deployment Options](#deployment-options)
  - [Simple HTTP Server](#simple-http-server)
  - [Docker Deployment](#docker-deployment)
  - [Hosting Services](#hosting-services)
- [Technical Implementation](#technical-implementation)
- [Privacy Considerations](#privacy-considerations)
- [License](#license)

## Quick Start

1. Clone or download this repository
2. Run the application using one of the methods below:
   - Open `index.html` directly in your browser
   - Use a local HTTP server (see [Local Development](#local-development))
   - Deploy with Docker (see [Docker Deployment](#docker-deployment))
3. Upload your `timeline.json` file from Google Maps
4. Select a location on the map and adjust the radius
5. Click "Analyze Time Spent" to view your results
6. Export the results as CSV if needed

## Detailed Usage Guide

### 1. Getting Your Google Maps Timeline Data

#### Android
1. Go to settings
2. Tap Location -> Location Services -> Timeline
3. Tap `Export Timeline data`, save the json file.

#### iOS
1. Go to Google Maps app
2. Tap profile icon -> Your timeline -> three dots upper right -> location & privacy settings
3. `Export Timeline data`, save the json file.

### 2. Using the Application

1. Upload your `timeline.json` file using the "Choose File" button
2. The app will show basic statistics about your timeline data
3. Click on the map to select a location you want to analyze
4. Adjust the proximity radius using the input field (in meters)
5. Select your preferred time granularity (daily, weekly, monthly)
6. Click "Analyze Time Spent" to process the data
7. View the results in the table showing dates and time spent
8. Click "Export Results (CSV)" to download the data

## Local Development

### Option 1: Direct Browser Opening

The simplest way to run the application locally:
- Open `index.html` directly in your browser
- Note: Some browsers may have security restrictions that prevent local file loading

### Option 2: Local HTTP Server

For macOS or Linux:
```bash
# Using Python 3 (recommended)
cd /path/to/timeline-detective
python3 -m http.server 8000

# Using Python 2 (alternative)
cd /path/to/timeline-detective
python -m SimpleHTTPServer 8000
```

For Windows:
```bash
# Using Python 3
cd \path\to\timeline-detective
python -m http.server 8000
```

Then open your browser and navigate to `http://localhost:8000`

### Option 3: Node.js HTTP Server

If you have Node.js installed:
```bash
# Install http-server globally if you haven't already
npm install -g http-server

# Run the server
cd /path/to/timeline-detective
http-server -p 8000
```

## Deployment Options

### Simple HTTP Server

For small-scale deployment or personal use, any static web server can host this application. Options include:
- Apache HTTP Server
- Nginx
- GitHub Pages
- Netlify
- Vercel

### Docker Deployment

To deploy using Docker:

1. Create a Dockerfile in your project directory:

```Dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. Build and run the Docker image:

```bash
# Build the Docker image
docker build -t timeline-detective .

# Run the container
docker run -d -p 8080:80 timeline-detective
```

3. Access the application at `http://localhost:8080`

### Docker Compose (Alternative)

For a more manageable setup, create a `docker-compose.yml` file:

```yaml
version: '3'
services:
  app:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./:/usr/share/nginx/html
```

Run with:
```bash
docker compose up -d
```

### Hosting Services

The application can be deployed to various hosting services:

**GitHub Pages:**
1. Push your code to a GitHub repository
2. Enable GitHub Pages in repository settings
3. Select the branch to deploy (usually `main` or `master`)

**Netlify/Vercel:**
1. Connect your GitHub repository
2. Configure build settings (not required for static sites)
3. Deploy

## Technical Implementation

Timeline Detective is built using:

- **HTML5**: Structure and content
- **CSS3**: Styling and layout
- **JavaScript (ES6+)**: Application logic and data processing
- **Leaflet.js**: Open-source JavaScript library for interactive maps
- **OpenStreetMap**: Free map tile provider

The application runs entirely in the client's browser, with no server-side processing. This ensures your timeline data never leaves your device, providing complete privacy.

Key technical aspects:
- File parsing using FileReader API
- Geospatial calculations with the Haversine formula
- Time-based data aggregation
- Dynamic results rendering

## Privacy Considerations

Timeline Detective processes all data locally in your browser. Your timeline data is never sent to any server or third-party service. The application uses:

- Local file processing
- Client-side JavaScript for all data analysis
- No cookies or local storage for data persistence
- No analytics or tracking scripts

## License

MIT License