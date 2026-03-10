// Tromsø bus stops with NSR IDs
const STOPS = [
  { id: 'NSR:StopPlace:58133', name: 'Prostneset' },
  { id: 'NSR:StopPlace:58142', name: 'UiT (Universitetet)' },
  { id: 'NSR:StopPlace:58138', name: 'Kroken (Senteret)' },
  { id: 'NSR:StopPlace:58129', name: 'Tromsøysund' },
  { id: 'NSR:StopPlace:58131', name: 'Sentrum (Torg)' }
];

const API_URL = 'https://api.entur.io/journey-planner/v3/graphql';

// Initialize UI
const stopSelect = document.getElementById('stopSelect');
const departuresDiv = document.getElementById('departures');
const updateTimeDiv = document.getElementById('updateTime');

let currentStop = STOPS[0].id;
let refreshInterval = null;

// Populate dropdown
STOPS.forEach(stop => {
  const option = document.createElement('option');
  option.value = stop.id;
  option.textContent = stop.name;
  stopSelect.appendChild(option);
});

stopSelect.addEventListener('change', (e) => {
  currentStop = e.target.value;
  fetchDepartures();
});

async function fetchDepartures() {
  try {
    departuresDiv.innerHTML = '<div class="loading">Laster...</div>';

    const query = `
      query {
        stopPlace(id: "${currentStop}") {
          name
          estimatedCalls(timeRange: 3600, numberOfDepartures: 10) {
            realtime
            aimedArrivalTime
            destinationDisplay {
              frontText
            }
            serviceJourney {
              line {
                publicCode
              }
            }
          }
        }
      }
    `;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ET-Client-Name': 'entur-schedule-app'
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error('Kunne ikke hente avganger');
    }

    const data = await response.json();
    displayDepartures(data.data.stopPlace);
    updateTimestamp();

  } catch (error) {
    departuresDiv.innerHTML = `<div class="error">${error.message}</div>`;
  }
}

function displayDepartures(stopPlace) {
  if (!stopPlace || !stopPlace.estimatedCalls) {
    departuresDiv.innerHTML = '<div class="error">Ingen avganger funnet</div>';
    return;
  }

  const now = new Date();
  const calls = stopPlace.estimatedCalls;

  const html = calls.map(call => {
    const line = call.serviceJourney?.line?.publicCode || '?';
    const destination = call.destinationDisplay?.frontText || 'Ukjent';

    const aimedTime = new Date(call.aimedArrivalTime);
    const minutesLeft = Math.round((aimedTime - now) / 60000);

    let timeText = '';
    if (minutesLeft <= 0) {
      timeText = '<span class="time now">Nå</span>';
    } else if (minutesLeft < 60) {
      timeText = `<span class="time">${minutesLeft} min</span>`;
    } else {
      timeText = `<span class="time">${aimedTime.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })}</span>`;
    }

    return `
      <div class="departure">
        <div class="line">${line}</div>
        <div class="info">
          <div class="destination">${destination}</div>
          ${timeText}
        </div>
      </div>
    `;
  }).join('');

  departuresDiv.innerHTML = html;
}

function updateTimestamp() {
  const now = new Date();
  updateTimeDiv.textContent = `Sist oppdatert: ${now.toLocaleTimeString('no-NO')}`;
}

// Initial load
fetchDepartures();

// Auto-refresh every 60 seconds
refreshInterval = setInterval(fetchDepartures, 60000);
