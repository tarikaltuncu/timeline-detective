document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let map, marker, circle;
    let selectedLocation = null;
    let timelineData = null;
    let radiusInMeters = 500;
    
    // Initialize map using Leaflet with OpenStreetMap tiles
    initializeMap();
    
    // Set up event listeners
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);
    document.getElementById('radiusInput').addEventListener('change', updateRadius);
    document.getElementById('analyzeBtn').addEventListener('click', analyzeTimeSpent);
    document.getElementById('exportBtn').addEventListener('click', exportResults);
    
    // Initialize the map centered on a default location
    function initializeMap() {
        // Default location - centered on Istanbul
        const defaultLocation = [41.0082, 28.9784];
        
        // Create the map
        map = L.map('map').setView(defaultLocation, 12);
        
        // Add OpenStreetMap tile layer (free to use)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Add click event to the map to set a marker
        map.on('click', function(e) {
            setSelectedLocation(e.latlng);
        });
    }
    
    // Set the selected location with a marker and circle
    function setSelectedLocation(latlng) {
        selectedLocation = latlng;
        
        // Update or create marker
        if (marker) {
            marker.setLatLng(latlng);
        } else {
            marker = L.marker(latlng).addTo(map);
        }
        
        // Update or create radius circle
        if (circle) {
            circle.setLatLng(latlng);
            circle.setRadius(radiusInMeters);
        } else {
            circle = L.circle(latlng, {
                radius: radiusInMeters,
                color: 'blue',
                fillColor: '#30f',
                fillOpacity: 0.1
            }).addTo(map);
        }
        
        // Enable the analyze button if we have both a location and timeline data
        checkAndEnableAnalyzeButton();
    }
    
    // Update the radius when the user changes the input
    function updateRadius() {
        const radiusInput = document.getElementById('radiusInput');
        radiusInMeters = parseInt(radiusInput.value, 10);
        
        // Update the circle if it exists
        if (circle && selectedLocation) {
            circle.setRadius(radiusInMeters);
        }
    }
    
    // Handle file upload and parse JSON
    function handleFileUpload(e) {
        const fileInfo = document.getElementById('fileInfo');
        const file = e.target.files[0];
        
        if (!file) {
            fileInfo.textContent = 'No file selected';
            return;
        }
        
        // Check file type
        if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
            fileInfo.textContent = 'Please select a JSON file';
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                // Parse JSON
                timelineData = JSON.parse(event.target.result);
                
                // Validate that it has semanticSegments
                if (!timelineData.semanticSegments || !Array.isArray(timelineData.semanticSegments)) {
                    fileInfo.textContent = 'Invalid timeline JSON: Missing semanticSegments array';
                    timelineData = null;
                    return;
                }
                
                // Show some basic statistics about the file
                const visitCount = timelineData.semanticSegments.filter(segment => segment.visit).length;
                const activityCount = timelineData.semanticSegments.filter(segment => segment.activity).length;
                const pathCount = timelineData.semanticSegments.filter(segment => segment.timelinePath).length;
                
                fileInfo.textContent = `File loaded successfully: ${visitCount} visits, ${activityCount} activities, ${pathCount} path segments`;
                
                // Enable the analyze button if we have both data and a selected location
                checkAndEnableAnalyzeButton();
                
            } catch (error) {
                console.error("Error parsing JSON:", error);
                fileInfo.textContent = 'Error parsing JSON file: ' + error.message;
                timelineData = null;
            }
        };
        
        reader.onerror = function() {
            fileInfo.textContent = 'Error reading file';
            timelineData = null;
        };
        
        reader.readAsText(file);
    }
    
    // Enable the analyze button if we have both data and location
    function checkAndEnableAnalyzeButton() {
        const analyzeBtn = document.getElementById('analyzeBtn');
        analyzeBtn.disabled = !(timelineData && selectedLocation);
    }
    
    // Calculate the distance between two coordinates using the Haversine formula (in meters)
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const toRad = value => value * Math.PI / 180;
        const R = 6371000; // Earth radius in meters
        
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    
    // Parse the latLng string from the timeline data
    function parseLatLng(latLngStr) {
        if (!latLngStr) return null;
        
        // Remove degree symbols and split
        const cleanStr = latLngStr.replace(/°/g, '');
        const parts = cleanStr.split(',').map(part => parseFloat(part.trim()));
        
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            return { lat: parts[0], lng: parts[1] };
        }
        
        return null;
    }
    
    // Check if a location is within the selected radius
    function isLocationInRadius(location) {
        if (!location || !selectedLocation) return false;
        
        const coords = parseLatLng(location.latLng);
        if (!coords) return false;
        
        const distance = calculateDistance(
            coords.lat, coords.lng,
            selectedLocation.lat, selectedLocation.lng
        );
        
        return distance <= radiusInMeters;
    }
    
    // Format a duration in milliseconds to a human-readable string (HH:MM)
    function formatDuration(milliseconds) {
        const totalMinutes = Math.floor(milliseconds / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        return `${hours}h ${minutes}m`;
    }
    
    // Format a date based on the selected granularity
    function formatDate(date, granularity) {
        const options = { 
            day: { year: 'numeric', month: 'short', day: 'numeric' },
            week: { year: 'numeric', month: 'short', day: 'numeric' },
            month: { year: 'numeric', month: 'long' }
        };
        
        let formattedDate = date.toLocaleDateString(undefined, options[granularity]);
        
        // For weekly granularity, add the week information
        if (granularity === 'week') {
            // Get the start of the week
            const startOfWeek = new Date(date);
            startOfWeek.setDate(date.getDate() - date.getDay());
            
            // Get the end of the week
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            
            formattedDate = `Week of ${startOfWeek.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
        }
        
        return formattedDate;
    }
    
    // Group a date by the selected granularity
    function getDateGroup(date, granularity) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        
        switch (granularity) {
            case 'day':
                return `${year}-${month+1}-${day}`;
            case 'week':
                // Get the start of the week (Sunday)
                const startOfWeek = new Date(date);
                startOfWeek.setDate(date.getDate() - date.getDay());
                return `week-${startOfWeek.getFullYear()}-${startOfWeek.getMonth()+1}-${startOfWeek.getDate()}`;
            case 'month':
                return `${year}-${month+1}`;
            default:
                return `${year}-${month+1}-${day}`;
        }
    }
    
    // Analyze the time spent at the selected location
    function analyzeTimeSpent() {
        if (!timelineData || !selectedLocation) return;
        
        const granularity = document.getElementById('timeGranularity').value;
        const visits = timelineData.semanticSegments.filter(segment => segment.visit);
        const timeSpentByDate = {};
        let totalTimeMs = 0;
        
        // Process each visit segment
        visits.forEach(segment => {
            // Check if this visit has a location and it's within our radius
            if (segment.visit && segment.visit.topCandidate && segment.visit.topCandidate.placeLocation) {
                if (isLocationInRadius(segment.visit.topCandidate.placeLocation)) {
                    // Calculate duration
                    const startTime = new Date(segment.startTime);
                    const endTime = new Date(segment.endTime);
                    const durationMs = endTime - startTime;
                    
                    if (durationMs > 0) {
                        // Group by date according to granularity
                        const dateGroup = getDateGroup(startTime, granularity);
                        
                        // Add to group
                        if (!timeSpentByDate[dateGroup]) {
                            timeSpentByDate[dateGroup] = {
                                date: startTime,
                                durationMs: 0
                            };
                        }
                        
                        timeSpentByDate[dateGroup].durationMs += durationMs;
                        totalTimeMs += durationMs;
                    }
                }
            }
        });
        
        // Display the results
        displayResults(timeSpentByDate, totalTimeMs, granularity);
    }
    
    // Display the analysis results
    function displayResults(timeSpentByDate, totalTimeMs, granularity) {
        const resultsContainer = document.getElementById('resultsContainer');
        const noResults = document.getElementById('noResults');
        const totalTime = document.getElementById('totalTime');
        const tableBody = document.getElementById('resultsTableBody');
        
        // Clear previous results
        tableBody.innerHTML = '';
        
        // Check if we have any results
        const dateGroups = Object.keys(timeSpentByDate);
        
        if (dateGroups.length === 0) {
            resultsContainer.classList.add('hidden');
            noResults.classList.remove('hidden');
            return;
        }
        
        // Show the results container
        resultsContainer.classList.remove('hidden');
        noResults.classList.add('hidden');
        
        // Update total time
        totalTime.textContent = `Total time: ${formatDuration(totalTimeMs)}`;
        
        // Sort date groups chronologically
        dateGroups.sort((a, b) => {
            return timeSpentByDate[a].date - timeSpentByDate[b].date;
        });
        
        // Populate table
        dateGroups.forEach(group => {
            const { date, durationMs } = timeSpentByDate[group];
            
            const row = document.createElement('tr');
            
            const dateCell = document.createElement('td');
            dateCell.textContent = formatDate(date, granularity);
            
            const durationCell = document.createElement('td');
            durationCell.textContent = formatDuration(durationMs);
            
            row.appendChild(dateCell);
            row.appendChild(durationCell);
            tableBody.appendChild(row);
        });
    }
    
    // Export the results as CSV
    function exportResults() {
        const tableBody = document.getElementById('resultsTableBody');
        if (tableBody.rows.length === 0) return;
        
        let csvContent = "data:text/csv;charset=utf-8,Date,Time Spent\n";
        
        // Add rows
        Array.from(tableBody.rows).forEach(row => {
            const date = row.cells[0].textContent;
            const duration = row.cells[1].textContent;
            csvContent += `"${date}","${duration}"\n`;
        });
        
        // Create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'timeline-detective-results.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});