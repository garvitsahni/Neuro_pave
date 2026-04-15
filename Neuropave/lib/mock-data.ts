// Mock data generation for NeuroPave sensor system

export interface Sensor {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  type: 'vibration' | 'strain' | 'temperature' | 'humidity';
  status: 'operational' | 'warning' | 'critical' | 'offline';
  lastUpdate: Date;
}

export interface SensorReading {
  sensorId: string;
  timestamp: Date;
  value: number;
  unit: string;
  isAnomaly: boolean;
}

export interface Alert {
  id: string;
  sensorId: string;
  sensorName: string;
  severity: 'warning' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

// Generate deterministic mock sensors
export const generateMockSensors = (): Sensor[] => {
  const locations = [
    { name: 'NH-48 — Gurugram Expressway', lat: 28.4595, lng: 77.0266 },
    { name: 'Noida–Greater Noida Expressway', lat: 28.5355, lng: 77.3910 },
    { name: 'Ring Road — Dhaula Kuan', lat: 28.5921, lng: 77.1690 },
    { name: 'DND Flyway — Mayur Vihar', lat: 28.6126, lng: 77.2880 },
    { name: 'NH-44 — Panipat Stretch', lat: 29.3909, lng: 76.9635 },
    { name: 'Yamuna Expressway — Jewar', lat: 28.1020, lng: 77.5560 },
    { name: 'Delhi–Meerut Expressway', lat: 28.6766, lng: 77.4384 },
    { name: 'Signature Bridge — Wazirabad', lat: 28.7203, lng: 77.2398 },
  ];

  const types: Array<'vibration' | 'strain' | 'temperature' | 'humidity'> = [
    'vibration',
    'strain',
    'temperature',
    'humidity',
  ];

  return locations.flatMap((loc, locIndex) =>
    types.map((type, typeIndex) => {
      const id = `sensor-${locIndex}-${typeIndex}`;
      // Deterministic status based on id
      const statusRandom = parseInt(id.split('-')[1] + id.split('-')[2]) % 10;
      const status: Sensor['status'] =
        statusRandom < 6
          ? 'operational'
          : statusRandom < 8
            ? 'warning'
            : statusRandom < 9
              ? 'critical'
              : 'offline';

      return {
        id,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} - ${loc.name}`,
        location: loc.name,
        latitude: loc.lat + (typeIndex * 0.001 - 0.0015),
        longitude: loc.lng + (typeIndex * 0.001 - 0.0015),
        type,
        status,
        lastUpdate: new Date(Date.now() - Math.random() * 5 * 60 * 1000), // 0-5 min ago
      };
    })
  );
};

// Generate deterministic readings for a sensor
export const generateSensorReading = (sensor: Sensor, timestamp: Date): SensorReading => {
  // Use seed from sensor id and timestamp for determinism
  const seed = (parseInt(sensor.id.replace(/\D/g, '')) + timestamp.getTime()) % 1000;
  const pseudoRandom = Math.sin(seed) * 10000 - Math.floor(Math.sin(seed) * 10000);

  let value = 0;
  let unit = '';
  let isAnomaly = false;

  switch (sensor.type) {
    case 'vibration':
      // For road-condition monitoring, velocity (mm/s) is a common, intuitive vibration unit.
      value = 0.4 + pseudoRandom * 2.6; // 0.4–3.0 mm/s
      unit = 'mm/s';
      isAnomaly = sensor.status === 'critical' && pseudoRandom > 0.8;
      break;
    case 'strain':
      value = 100 + pseudoRandom * 200; // 100-300 microstrain
      unit = 'µε';
      isAnomaly = sensor.status === 'critical' && pseudoRandom > 0.7;
      break;
    case 'temperature':
      value = 15 + pseudoRandom * 20; // 15-35°C
      unit = '°C';
      isAnomaly = sensor.status === 'warning' && pseudoRandom > 0.8;
      break;
    case 'humidity':
      value = 30 + pseudoRandom * 50; // 30-80%
      unit = '%';
      isAnomaly = sensor.status === 'warning' && pseudoRandom > 0.75;
      break;
  }

  return {
    sensorId: sensor.id,
    timestamp,
    value: Math.round(value * 100) / 100,
    unit,
    isAnomaly,
  };
};

// Generate mock readings over time
export const generateHistoricalReadings = (
  sensor: Sensor,
  pointCount: number = 60
): SensorReading[] => {
  const now = Date.now();
  const readings: SensorReading[] = [];

  for (let i = pointCount - 1; i >= 0; i--) {
    const timestamp = new Date(now - i * 60 * 1000); // 1-minute intervals
    readings.push(generateSensorReading(sensor, timestamp));
  }

  return readings;
};

// Generate alerts based on current sensor status
export const generateAlerts = (sensors: Sensor[]): Alert[] => {
  const alerts: Alert[] = [];
  let alertId = 0;

  sensors.forEach((sensor) => {
    if (sensor.status === 'warning') {
      alerts.push({
        id: `alert-${alertId++}`,
        sensorId: sensor.id,
        sensorName: sensor.name,
        severity: 'warning',
        message: `${sensor.type} reading elevated at ${sensor.location}`,
        timestamp: sensor.lastUpdate,
        resolved: false,
      });
    } else if (sensor.status === 'critical') {
      alerts.push({
        id: `alert-${alertId++}`,
        sensorId: sensor.id,
        sensorName: sensor.name,
        severity: 'critical',
        message: `CRITICAL: ${sensor.type} anomaly detected at ${sensor.location}. Immediate attention required.`,
        timestamp: sensor.lastUpdate,
        resolved: false,
      });
    } else if (sensor.status === 'offline') {
      alerts.push({
        id: `alert-${alertId++}`,
        sensorId: sensor.id,
        sensorName: sensor.name,
        severity: 'warning',
        message: `Sensor offline at ${sensor.location}. Connection lost.`,
        timestamp: sensor.lastUpdate,
        resolved: false,
      });
    }
  });

  return alerts;
};

// Simulate real-time updates by adding slight variations
export const updateSensorStatus = (sensor: Sensor): Sensor => {
  const rand = Math.random();

  // Probability of status changes
  let newStatus = sensor.status;
  if (sensor.status === 'operational' && rand < 0.1) {
    newStatus = 'warning';
  } else if (sensor.status === 'warning') {
    if (rand < 0.3) newStatus = 'operational';
    else if (rand < 0.15) newStatus = 'critical';
  } else if (sensor.status === 'critical' && rand < 0.2) {
    newStatus = 'warning';
  } else if (sensor.status === 'offline' && rand < 0.05) {
    newStatus = 'warning';
  }

  return {
    ...sensor,
    status: newStatus,
    lastUpdate: new Date(),
  };
};
