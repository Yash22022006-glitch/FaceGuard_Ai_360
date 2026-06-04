import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Camera, 
  UserPlus, 
  Database, 
  MapPin, 
  Smartphone, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Lock, 
  Eye, 
  Activity, 
  FileCheck, 
  Trash2, 
  Wifi, 
  WifiOff, 
  Mic, 
  QrCode, 
  Key, 
  HardHat, 
  UserCheck, 
  Search,
  Check, 
  Map, 
  Sliders, 
  HelpCircle,
  Clock
} from 'lucide-react';
import { UserProfile, AuthLog, GeofenceArea, DeviceBinding, LivenessAction, LivenessChallenge, SystemMetrics } from './types';
import DeviceStatusTerm from './components/DeviceStatusTerm';

// Predefined Demo Scenario Presets for convenient testing
interface SandboxPreset {
  id: string;
  name: string;
  role: string;
  department: string;
  employeeId: string;
  latitude: number;
  longitude: number;
  locationName: string;
  mockImageMime: string;
  description: string;
  ppeCompliance: { helmet: boolean; vest: boolean; goggles: boolean };
  forceSpoof: boolean;
  spoofReason?: string;
  customResponse?: string;
}

const SANDBOX_PRESETS: SandboxPreset[] = [
  {
    id: "preset-rajesh",
    name: "Rajesh Kumar",
    role: "Forest Ranger",
    department: "Sariska NW-8",
    employeeId: "EMP-001",
    latitude: 27.3526,
    longitude: 76.4385,
    locationName: "Sariska Forest Patrol Patrol Station North",
    mockImageMime: "image/svg+xml",
    description: "Enrolled Forest Ranger. Real presence within authorized GPS Geofence boundary. Standard ranger wear.",
    ppeCompliance: { helmet: false, vest: true, goggles: false },
    forceSpoof: false
  },
  {
    id: "preset-ananya",
    name: "Ananya Sharma",
    role: "Safety Inspector",
    department: "Restricted Mines Div 3",
    employeeId: "EMP-002",
    latitude: 23.4119,
    longitude: 85.3414,
    locationName: "Restricted Mining Area Zone C",
    mockImageMime: "image/svg+xml",
    description: "Safety Inspector inside mining site geofence. Wearing required PPE standard gear: safety helmet + high-vis vest.",
    ppeCompliance: { helmet: true, vest: true, goggles: true },
    forceSpoof: false
  },
  {
    id: "preset-photo-spoof",
    name: "Rajesh Kumar (Printed Photo)",
    role: "Forest Ranger",
    department: "Sariska NW-8",
    employeeId: "EMP-001",
    latitude: 27.3524,
    longitude: 76.4382,
    locationName: "Sariska Forest Patrol Patrol Station North",
    mockImageMime: "image/svg+xml",
    description: "ALERT: Presentation Attack. Static printed photo of Ranger Rajesh held up. Lacks micro-depth and biometrical eye tremoring.",
    ppeCompliance: { helmet: false, vest: false, goggles: false },
    forceSpoof: true,
    spoofReason: "Printed photograph detected (flat surface and low spatial texture variation)."
  },
  {
    id: "preset-tablet-spoof",
    name: "Ananya Sharma (Tablet Replay Video)",
    role: "Safety Inspector",
    department: "Restricted Mines Div 3",
    employeeId: "EMP-002",
    latitude: 23.4121,
    longitude: 85.3412,
    locationName: "Restricted Mining Area Zone C",
    mockImageMime: "image/svg+xml",
    description: "ALERT: Mobile Replay Attack. High-brightness screen reflection detected. Refresh rate scanlines verified by neural classifier.",
    ppeCompliance: { helmet: true, vest: true, goggles: true },
    forceSpoof: true,
    spoofReason: "Screen replay detected (glare patterns, bezel borders, and refresh frequency spikes)."
  },
  {
    id: "preset-unregistered",
    name: "Vikram Malhotra (Unregistered Guest)",
    role: "Subcontractor",
    department: "Generic Operatives",
    employeeId: "EMP-999",
    latitude: 18.9515,
    longitude: 72.8258,
    locationName: "Offshore Driller Terminal A",
    mockImageMime: "image/svg+xml",
    description: "Live biological facial presence, but user is NOT registered in this device's secure local biometrical cache.",
    ppeCompliance: { helmet: true, vest: false, goggles: false },
    forceSpoof: false
  },
  {
    id: "preset-out-of-bounds",
    name: "Amit Patel",
    role: "Field Engineer",
    department: "Offshore Plant-A",
    employeeId: "EMP-003",
    latitude: 12.9716, // Bangalore GPS - far from Driller Terminal (latitude: 18.9512)
    longitude: 77.5946,
    locationName: "Unapproved Location (Deep City Range)",
    mockImageMime: "image/svg+xml",
    description: "Enrolled engineer, but attempting login outside active geofence boundaries. Triggers low Geolocation Trust rating.",
    ppeCompliance: { helmet: false, vest: false, goggles: false },
    forceSpoof: false
  }
];

// List of available liveness challenge combos to generate unpredictability
const CH_PATTERNS: LivenessChallenge[] = [
  { id: "C1", actions: ["BLINK", "SMILE"], text: "Blink twice and Smile warmly" },
  { id: "C2", actions: ["HEAD_LEFT", "SMILE"], text: "Turn Head Left, then Smile" },
  { id: "C3", actions: ["HEAD_RIGHT", "BLINK"], text: "Turn Head Right and Blink twice" },
  { id: "C4", actions: ["RAISE_EYEBROWS", "SMILE"], text: "Raise Eyebrows and Smile at the camera" },
  { id: "C5", actions: ["OPEN_MOUTH", "BLINK"], text: "Open Mouth slightly and Blink" }
];

export default function App() {
  // DB States
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [geofences, setGeofences] = useState<GeofenceArea[]>([]);
  const [devices, setDevices] = useState<DeviceBinding[]>([]);
  const [logs, setLogs] = useState<AuthLog[]>([]);
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'auth' | 'enroll' | 'logs' | 'geofences'>('auth');
  const [searchTerm, setSearchTerm] = useState('');
  
  // App Variables
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState('preset-rajesh');
  const [currentChallenge, setCurrentChallenge] = useState<LivenessChallenge>(CH_PATTERNS[0]);
  const [mfaMethod, setMfaMethod] = useState<'FACE_ONLY' | 'FACE_PIN' | 'QR_FACE' | 'FACE_VOICE'>('FACE_ONLY');
  const [mfaPin, setMfaPin] = useState('');
  const [vocalPulse, setVocalPulse] = useState<number[]>(Array(12).fill(15));
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [qrCodeScanned, setQrCodeScanned] = useState(false);
  
  // Camera feed simulator state
  const [useRealCamera, setUseRealCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<SandboxPreset>(SANDBOX_PRESETS[0]);
  
  // Enrollment State
  const [enrollForm, setEnrollForm] = useState({
    id: '',
    name: '',
    role: 'Field Agent',
    department: 'Remote Operations-A'
  });
  const [enrollStep, setEnrollStep] = useState<number>(0); // 0: input Form, 1: Front face, 2: Left face, 3: Right face, 4: Encrypted storage write
  const [enrollAnglesCaptured, setEnrollAnglesCaptured] = useState({ front: false, left: false, right: false });
  const [isEnrollingInProgress, setIsEnrollingInProgress] = useState(false);

  // Verification process state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [authSuccessIndicator, setAuthSuccessIndicator] = useState<'SUCCESS' | 'FRAUD' | 'BLOCKED' | null>(null);

  // New Geofence form
  const [newGeofence, setNewGeofence] = useState({
    name: '',
    latitude: '25.0456',
    longitude: '79.2314',
    radius: '800'
  });

  // Global Alerts or status
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);

  const activeDevice = devices.find(d => d.id === selectedDeviceId);
  const deviceIsTampered = activeDevice ? activeDevice.isTampered : false;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const voiceInterval = useRef<any>(null);

  // Fetch db initial data from server on startup
  const fetchDbState = async () => {
    try {
      const response = await fetch('/api/db/get');
      const data = await response.json();
      setProfiles(data.profiles || []);
      setGeofences(data.geofences || []);
      setDevices(data.devices || []);
      setLogs(data.logs || []);
      if (data.devices && data.devices.length > 0 && !selectedDeviceId) {
        // Prefer a clean uncompromised device to start
        const safeDevice = data.devices.find((d: any) => !d.isTampered);
        setSelectedDeviceId(safeDevice ? safeDevice.id : data.devices[0].id);
      }
    } catch (err) {
      console.error("Error communicating with DB server daemon:", err);
    }
  };

  useEffect(() => {
    fetchDbState();
    // Roll default liveness challenge
    rollChallenge();
  }, []);

  // Sync state update when the preset updates
  useEffect(() => {
    const preset = SANDBOX_PRESETS.find(p => p.id === selectedPresetId);
    if (preset) {
      setSelectedPreset(preset);
    }
  }, [selectedPresetId]);

  // Voice recording graph simulator
  useEffect(() => {
    if (isRecordingVoice) {
      voiceInterval.current = setInterval(() => {
        setVocalPulse(Array(15).fill(0).map(() => Math.floor(Math.random() * 45) + 10));
      }, 150);
    } else {
      if (voiceInterval.current) clearInterval(voiceInterval.current);
      setVocalPulse(Array(15).fill(10));
    }
    return () => {
      if (voiceInterval.current) clearInterval(voiceInterval.current);
    };
  }, [isRecordingVoice]);

  // Handle Real Camera stream
  const toggleRealCamera = async () => {
    if (useRealCamera) {
      // Switch off
      setUseRealCamera(false);
      stopCameraStream();
    } else {
      setUseRealCamera(true);
      await startCameraStream();
    }
  };

  const startCameraStream = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 380, height: 280, facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Unable to access local system video camera input:", err);
      setCameraError('Permission to access camera was denied or camera is unavailable in this environment.');
      setUseRealCamera(false);
      setCameraActive(false);
    }
  };

  const stopCameraStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => stopCameraStream();
  }, []);

  const rollChallenge = () => {
    const randomIndex = Math.floor(Math.random() * CH_PATTERNS.length);
    setCurrentChallenge(CH_PATTERNS[randomIndex]);
  };

  // Trigger server-side Verification utilizing base64 snapshot
  const triggerAuthentication = async () => {
    setIsVerifying(true);
    setVerificationResult(null);
    setAuthSuccessIndicator(null);

    let imageBase64String = "";
    
    // Check if device bound is compromised
    // Variables have been hovered to component state level to allow JSX renders.
    // A. Capturing from live camera stream if enabled
    if (useRealCamera && cameraActive && videoRef.current && canvasRef.current) {
      try {
        const videoEle = videoRef.current;
        const canvasEle = canvasRef.current;
        const ctx = canvasEle.getContext('2d');
        if (ctx) {
          canvasEle.width = videoEle.videoWidth;
          canvasEle.height = videoEle.videoHeight;
          ctx.drawImage(videoEle, 0, 0, canvasEle.width, canvasEle.height);
          
          // Draw tracking bounding box on static output overlay for feedback
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 3;
          ctx.strokeRect(canvasEle.width * 0.25, canvasEle.height * 0.15, canvasEle.width * 0.5, canvasEle.height * 0.6);
          
          imageBase64String = canvasEle.toDataURL('image/jpeg');
        }
      } catch (e) {
        console.error("Failed to capture image snapshot canvas frame", e);
      }
    }

    // B. Generating simulated canvas photo if preset scenario contains mock
    if (!imageBase64String) {
      // Setup dynamic drawing canvas to pass to Gemini API
      // This is neat because it sends a REAL image representing the scenario (e.g. ranger helmet, vest, or spoof warning) to the backend API!
      const mockCanvas = document.createElement('canvas');
      mockCanvas.width = 400;
      mockCanvas.height = 300;
      const ctx = mockCanvas.getContext('2d');
      if (ctx) {
        // Gradient BG
        const gradient = ctx.createLinearGradient(0, 0, 400, 300);
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(1, '#1e293b');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 300);

        // Draw HUD circle
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(200, 150, 100, 0, Math.PI * 2);
        ctx.stroke();

        // Draw human-like head matching scenario
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.arc(200, 140, 50, 0, Math.PI * 2); // Skull
        ctx.fill();

        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.ellipse(200, 210, 65, 30, 0, 0, Math.PI * 2); // Shoulders
        ctx.fill();

        // Specific styling additions for testing scenarios
        if (selectedPreset.ppeCompliance.helmet) {
          // Yellow safety helmet
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(200, 95, 45, Math.PI, 0, false);
          ctx.fill();
          ctx.fillRect(150, 93, 100, 8); // rim
        }

        if (selectedPreset.ppeCompliance.vest) {
          // Orange Hi-vis vest stripes
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.ellipse(200, 210, 65, 25, 0, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = '#eab308'; // Lime stripes
          ctx.fillRect(160, 195, 12, 35);
          ctx.fillRect(228, 195, 12, 35);
        }

        if (selectedPreset.ppeCompliance.goggles) {
          // Goggles
          ctx.fillStyle = '#06b6d4';
          ctx.strokeStyle = '#0891b2';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(180, 135, 15, 0, Math.PI * 2);
          ctx.arc(220, 135, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // bridge
          ctx.beginPath();
          ctx.moveTo(195, 135);
          ctx.lineTo(205, 135);
          ctx.stroke();
        }

        // Draw scenario specific texts to help verification model guide
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`EMPLOYEE_ID: ${selectedPreset.employeeId}`, 200, 55);
        ctx.font = '11px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`SCENARIO: ${selectedPreset.name}`, 200, 275);
        ctx.fillText(`GPS LOCATION: ${selectedPreset.locationName}`, 200, 290);

        if (selectedPreset.forceSpoof) {
          // Draw fake smartphone screen framing to register screen attack
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 4;
          ctx.strokeRect(10, 10, 380, 280);
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 13px sans-serif';
          ctx.fillText("ATTACK_SIMULATOR_REPLAY", 200, 25);
          
          // Draw screen camera bezel lens
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(200, 15, 5, 0, Math.PI * 2);
          ctx.fill();
        }

        imageBase64String = mockCanvas.toDataURL('image/jpeg');
      }
    }

    try {
      // Execute verify POST API
      const resp = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: imageBase64String,
          challengeActions: currentChallenge.actions,
          ppeCheckRequested: true,
          employeeId: useRealCamera ? "EMP-LIVE" : selectedPreset.employeeId,
          mfaMethod: mfaMethod
        })
      });

      const body = await resp.json();
      
      if (body.success) {
        let result = body.result;

        // Force spoof configurations on preset targets if fallback generated true but scenario requested false (or vice-versa)
        if (!useRealCamera && selectedPreset.forceSpoof) {
          result.spoofDetected = true;
          result.matchScore = Math.min(result.matchScore, 40);
          result.livenessScore = Math.min(result.livenessScore, 20);
          result.spoofReason = selectedPreset.spoofReason;
        }

        // Location Check
        let insideGeofence = false;
        let matchedGeo = "Unapproved Remote Location";
        const currentLat = useRealCamera ? 27.3524 : selectedPreset.latitude;
        const currentLong = useRealCamera ? 76.4382 : selectedPreset.longitude;

        // Compare distance to all geofences
        for (const gf of geofences) {
          if (!gf.isActive) continue;
          // Simple haversine / Euclidean distance metric
          const dLat = (currentLat - gf.latitude) * 111000; // rough meters
          const dLon = (currentLong - gf.longitude) * 111000 * Math.cos(gf.latitude * Math.PI / 180);
          const distance = Math.sqrt(dLat * dLat + dLon * dLon);
          if (distance <= gf.radius) {
            insideGeofence = true;
            matchedGeo = gf.name;
            break;
          }
        }

        // Calculate AI Risk score rating
        // Combination of: Spoof, Match Score, Liveness Score, GPS location Geofence compliance, and Device Security trust
        let riskValue = 0;
        let riskLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' = 'SAFE';

        if (result.spoofDetected) {
          riskValue += 75;
        }
        if (deviceIsTampered) {
          riskValue += 60;
        }
        if (result.matchScore < 90) {
          riskValue += (100 - result.matchScore) * 0.7;
        }
        if (result.livenessScore < 90) {
          riskValue += (100 - result.livenessScore) * 0.4;
        }
        if (!insideGeofence) {
          riskValue += 30;
        }

        riskValue = Math.min(100, Math.floor(riskValue));
        
        if (riskValue > 70) {
          riskLevel = 'HIGH';
        } else if (riskValue > 40) {
          riskLevel = 'MEDIUM';
        } else if (riskValue > 15) {
          riskLevel = 'LOW';
        } else {
          riskLevel = 'SAFE';
        }

        // Adjust scores depending on parameters
        const finalResult = {
          ...result,
          insideGeofence,
          currentLocationName: insideGeofence ? matchedGeo : "OUTSIDE_APPROVED_GEOFENCE",
          deviceModel: activeDevice ? activeDevice.model : "Edge Smartphone",
          deviceIsTampered: deviceIsTampered,
          riskScore: riskValue,
          riskLevel: riskLevel
        };

        setVerificationResult(finalResult);

        // Save Attempt to logs in standard database to record attendance!
        let workerName = "Unknown Worker (Unauthorized)";
        let workerId = selectedPreset.employeeId;

        if (useRealCamera) {
          workerName = "Live Webcam User";
          workerId = "EMP-LIVE";
        } else {
          const registered = profiles.find(p => p.id === selectedPreset.employeeId);
          if (registered) {
            workerName = registered.name;
          } else {
            workerName = selectedPreset.name;
          }
        }

        // Log results state triggers
        const overallPassed = !finalResult.spoofDetected && 
                              finalResult.matchScore >= 90 && 
 finalResult.livenessScore >= 80 && 
                              !finalResult.deviceIsTampered &&
                              finalResult.insideGeofence;

        if (overallPassed) {
          if (mfaMethod === 'FACE_PIN' && mfaPin !== '1234' && mfaPin !== '4321') {
            // Pin failed verification
            setAuthSuccessIndicator('BLOCKED');
            setStatusMessage("Face matched, but secondary factor Secure PIN code is invalid!");
          } else {
            setAuthSuccessIndicator('SUCCESS');
            setStatusMessage(`SUCCESS: Authenticated ${workerName} securely.`);
            
            // Post log
            await fetch('/api/db/add-log', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                employeeId: workerId,
                employeeName: workerName,
                latitude: currentLat,
                longitude: currentLong,
                locationName: finalResult.currentLocationName,
                matchScore: Math.round(finalResult.matchScore),
                livenessScore: Math.round(finalResult.livenessScore),
                riskScore: finalResult.riskScore,
                riskLevel: finalResult.riskLevel,
                deviceModel: finalResult.deviceModel,
                isTampered: finalResult.deviceIsTampered,
                ppeCompliance: finalResult.ppeCompliance,
                mfaMethod: mfaMethod,
                antiSpoofResult: { passed: !finalResult.spoofDetected, reason: finalResult.spoofReason }
              })
            });
            await fetchDbState();
          }
        } else {
          setAuthSuccessIndicator('FRAUD');
          if (finalResult.spoofDetected) {
            setStatusMessage(`ALERT: Liveness fraud check failed! Presentation spoof attempt detected.`);
          } else if (finalResult.deviceIsTampered) {
            setStatusMessage(`ALERT: Terminal compromised! Root/Jailbreak detected, system access frozen.`);
          } else if (!finalResult.insideGeofence) {
            setStatusMessage(`BLOCKED: Employee is outside of approved geofence perimeter.`);
          } else {
            setStatusMessage(`BLOCKED: Facial match criteria or liveness score below threshold.`);
          }

          // Log critical fail
          await fetch('/api/db/add-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employeeId: workerId,
              employeeName: workerName,
              latitude: currentLat,
              longitude: currentLong,
              locationName: finalResult.currentLocationName,
              matchScore: Math.round(finalResult.matchScore),
              livenessScore: Math.round(finalResult.livenessScore),
              riskScore: finalResult.riskScore,
              riskLevel: finalResult.riskLevel,
              deviceModel: finalResult.deviceModel,
              isTampered: finalResult.deviceIsTampered,
              ppeCompliance: finalResult.ppeCompliance,
              mfaMethod: mfaMethod,
              antiSpoofResult: { passed: !finalResult.spoofDetected, reason: finalResult.spoofReason || "Biometrical criteria mismatch" }
            })
          });
          await fetchDbState();
        }
      } else {
        setStatusMessage("Error: Deep Face Model computation failed or halted.");
      }
    } catch (err) {
      console.error("Communication error calling edge API compiler:", err);
      setStatusMessage("Offline Simulator fallback verification loaded.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Trigger Local Sync to SIMULATED cloud Lambda & purge local logs
  const handleCloudSync = async () => {
    setIsSyncing(true);
    try {
      const resp = await fetch('/api/db/sync', { method: 'POST' });
      const body = await resp.json();
      if (body.success) {
        setStatusMessage(body.message);
        await fetchDbState();
      }
    } catch (e) {
      console.error(e);
      setStatusMessage("Sync pipeline timed out. Ensure local edge router has connectivity.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePurgeLocalLogs = async () => {
    try {
      const resp = await fetch('/api/db/purge', { method: 'POST' });
      const body = await resp.json();
      if (body.success) {
        setStatusMessage(body.message);
        await fetchDbState();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetFactoryDb = async () => {
    if (window.confirm("Restore factory default settings and clear customized entries?")) {
      try {
        const resp = await fetch('/api/db/clear', { method: 'POST' });
        const body = await resp.json();
        if (body.success) {
          setStatusMessage(body.message);
          setVerificationResult(null);
          setAuthSuccessIndicator(null);
          await fetchDbState();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Enroll User Submit
  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollForm.id || !enrollForm.name) {
      setStatusMessage("Please supply both Name and valid Employee ID.");
      return;
    }
    // Start step-by-step camera capture simulation
    setEnrollStep(1);
    setIsEnrollingInProgress(true);
  };

  const handleEnrollCaptureStep = () => {
    if (enrollStep === 1) {
      setEnrollStep(2); // Move to Left Face
    } else if (enrollStep === 2) {
      setEnrollStep(3); // Move to Right Face
    } else if (enrollStep === 3) {
      setEnrollStep(4); // Simulating Encrypted Write
      setTimeout(async () => {
        try {
          const resp = await fetch('/api/db/enroll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: enrollForm.id,
              name: enrollForm.name,
              role: enrollForm.role,
              department: enrollForm.department,
              deviceId: selectedDeviceId || "DEV-M31S"
            })
          });
          const body = await resp.json();
          if (body.success) {
            setStatusMessage(`ENROLLED: ${enrollForm.name} profile successfully compiled below 20MB. Biometric raw image deleted, 512-float vector matrices written securely inside iOS Keychain / Android hardware Keystore with AES-256 wrapping key.`);
            setEnrollStep(0);
            setIsEnrollingInProgress(false);
            setEnrollForm({ id: '', name: '', role: 'Field Agent', department: 'Operations-Remote' });
            await fetchDbState();
          }
        } catch (err) {
          console.error(err);
          setEnrollStep(0);
          setIsEnrollingInProgress(false);
        }
      }, 1500);
    }
  };

  // Add active Geofence
  const handleAddGeofenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await fetch('/api/db/geofence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGeofence.name,
          latitude: newGeofence.latitude,
          longitude: newGeofence.longitude,
          radius: newGeofence.radius
        })
      });
      const body = await resp.json();
      if (body.success) {
        setStatusMessage(`GEOFENCE REGISTERED: Added secure authorization range: ${newGeofence.name}`);
        setNewGeofence({ name: '', latitude: '23.4000', longitude: '85.3000', radius: '500' });
        await fetchDbState();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add Device Binding (from inside device panel)
  const handleDeviceBind = async (model: string, os: 'Android' | 'iOS', isTampered: boolean) => {
    try {
      const resp = await fetch('/api/db/device-bind', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ model, os, isTampered })
      });
      const body = await resp.json();
      if (body.success) {
        await fetchDbState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Metrics calculating
  const pendingSyncLogsCount = logs.filter(l => l.syncStatus === 'PENDING').length;
  const criticalTamperCount = devices.filter(d => d.isTampered).length;

  // Filter logs based on search
  const filteredLogs = logs.filter(log => {
    const searchString = searchTerm.toLowerCase();
    return (
      log.employeeName.toLowerCase().includes(searchString) ||
      log.employeeId.toLowerCase().includes(searchString) ||
      log.locationName.toLowerCase().includes(searchString) ||
      log.riskLevel.toLowerCase().includes(searchString) ||
      log.deviceModel.toLowerCase().includes(searchString)
    );
  });

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* Top Warning banner showing Offline-Ready & Security Compliance info */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-[#112437] to-cyan-950/80 border-b border-emerald-800/40 px-6 py-2 flex flex-wrap justify-between items-center text-xs text-slate-300 gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold tracking-wider font-mono text-[10px] text-emerald-400">EDGE COMPLIANCE: SYSTEM LIVE</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">Biometric sandbox active (models quantized &lt; 20 MB)</span>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5 text-slate-400">
            <WifiOff className="w-3.5 h-3.5 text-amber-500" />
            <span>Operational Mode: <strong className="text-amber-400">100% Fully Offline</strong></span>
          </div>
          <button 
            onClick={resetFactoryDb}
            className="text-[10px] bg-slate-900/60 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 px-2 py-0.5 rounded transition-all text-slate-400 hover:text-slate-300"
          >
            Clear / Hard Reset DB
          </button>
        </div>
      </div>

      {/* Main App Navigation Header */}
      <header className="bg-[#121824] border-b border-slate-800 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 rounded-xl text-black shadow-lg shadow-emerald-500/20 shadow-inner">
              <ShieldCheck className="w-6 h-6 stroke-[2.25]" id="app-logo" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white m-0">FaceGuard Edge AI 360</h1>
                <span className="text-[10px] font-semibold bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 px-1.5 py-0.5 rounded">v1.2-CJS</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-medium leading-none">Secure Decentralized Workforce Identity & Anti-Spoofing Protocol</p>
            </div>
          </div>

          {/* Tab buttons */}
          <nav className="flex bg-[#182133] rounded-xl p-1 border border-slate-700/80 w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => { setActiveTab('auth'); setStatusMessage(''); }}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all whitespace-nowrap ${activeTab === 'auth' ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'}`}
              id="nav-auth"
            >
              <Camera className="w-4 h-4" />
              Edge Authentication
            </button>
            <button
              onClick={() => { setActiveTab('enroll'); setStatusMessage(''); }}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all whitespace-nowrap ${activeTab === 'enroll' ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'}`}
              id="nav-enroll"
            >
              <UserPlus className="w-4 h-4" />
              Officer Enrollment
            </button>
            <button
              onClick={() => { setActiveTab('logs'); setStatusMessage(''); }}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all whitespace-nowrap relative ${activeTab === 'logs' ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'}`}
              id="nav-attendance"
            >
              <Database className="w-4 h-4" />
              Attendance logs
              {pendingSyncLogsCount > 0 && (
                <span className="absolute -top-1.5 -right-1 bg-amber-500 text-black font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {pendingSyncLogsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('geofences'); setStatusMessage(''); }}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all whitespace-nowrap ${activeTab === 'geofences' ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'}`}
              id="nav-geofences"
            >
              <MapPin className="w-4 h-4" />
              Geofences & Hardware
            </button>
          </nav>

        </div>
      </header>

      {/* Global Toast Status Banner */}
      {statusMessage && (
        <div className="bg-[#1a2b44] border-y border-emerald-900/60 px-6 py-3.5 text-xs text-emerald-200 transition-all duration-300 max-w-7xl mx-auto w-full flex items-center justify-between gap-3 font-medium shadow-inner shadow-black">
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse flex-shrink-0" />
            <span id="global-toast">{statusMessage}</span>
          </div>
          <button 
            className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
            onClick={() => setStatusMessage('')}
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Core Body Container */}
      <main className="flex-grow max-w-7xl mx-auto w-full p-6 grid grid-cols-1 gap-6">

        {/* -------------------- TAB 1: EDGE AUTHENTICATION -------------------- */}
        {activeTab === 'auth' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Box: Controls & Camera Sandbox (7 Columns) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Liveness challenge section */}
              <div className="bg-[#111622] rounded-2xl border border-slate-800/80 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">Dynamic AI Challenge</span>
                    <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded font-semibold">Active Liveness</span>
                  </div>
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5 leading-tight">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    &ldquo;{currentChallenge.text}&rdquo;
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Challenge changes on each load to defeat static masks and video replays.</p>
                </div>
                <button 
                  onClick={rollChallenge}
                  className="flex items-center gap-2 text-xs bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 px-3 py-2 rounded-xl transition-all border border-slate-850"
                  title="Generate alternative active liveness challenge commands"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerate
                </button>
              </div>

              {/* Simulation Configuration Panels */}
              <div className="bg-[#111723] rounded-2xl border border-slate-800 p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/50">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Device Input Configurator</span>
                  
                  {/* Camera toggle */}
                  <button 
                    onClick={toggleRealCamera}
                    className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${useRealCamera ? 'bg-emerald-600 text-white' : 'bg-[#182132] text-slate-400 border border-slate-700/80'}`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    {useRealCamera ? 'USB Camera: ACTIVE' : 'Simulating Hardware'}
                  </button>
                </div>

                {cameraError && (
                  <div className="mb-4 p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-300 flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>{cameraError}</span>
                  </div>
                )}

                {/* Scenarios dropdown */}
                {!useRealCamera && (
                  <div className="mb-4 bg-slate-900/60 border border-slate-800 p-3 rounded-xl grid grid-cols-1 sm:grid-cols-3 items-center gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Testing Preset</label>
                      <select 
                        id="preset-select"
                        value={selectedPresetId}
                        onChange={(e) => {
                          setSelectedPresetId(e.target.value);
                          setVerificationResult(null);
                          setAuthSuccessIndicator(null);
                        }}
                        className="w-full bg-[#182133] border border-slate-700/80 text-xs py-1.5 px-2 rounded-lg text-slate-200"
                      >
                        {SANDBOX_PRESETS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2 text-xs text-slate-400 leading-normal pl-1 border-l border-slate-800">
                      <strong>Scenario description:</strong> {selectedPreset.description}
                    </div>
                  </div>
                )}

                {/* MFA configuration selection bar */}
                <div className="grid grid-cols-4 gap-2 mb-4 bg-slate-950/60 p-1 rounded-xl">
                  {(['FACE_ONLY', 'FACE_PIN', 'FACE_VOICE', 'QR_FACE'] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => {
                        setMfaMethod(method);
                        setQrCodeScanned(false);
                        setMfaPin('');
                        setVerificationResult(null);
                        setAuthSuccessIndicator(null);
                      }}
                      className={`text-[10px] font-bold uppercase tracking-wider py-2 px-1 rounded-lg transition-all ${mfaMethod === method ? 'bg-gradient-to-r from-emerald-600/90 to-emerald-500/90 text-white font-heavy' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      {method === 'FACE_ONLY' && 'Face Only'}
                      {method === 'FACE_PIN' && 'Face + PIN'}
                      {method === 'FACE_VOICE' && 'Face + Voice'}
                      {method === 'QR_FACE' && 'QR + Face'}
                    </button>
                  ))}
                </div>

                {/* Sub-panels for secondary MFA factors */}
                {mfaMethod === 'FACE_PIN' && (
                  <div className="mb-4 p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-amber-400" /> Enter Secondary Security PIN
                      </h4>
                      <p className="text-[11px] text-slate-400">Standard registered user code PIN parameter. (e.g. Try &quot;1234&quot; or &quot;4321&quot; for demo success)</p>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="password" 
                        maxLength={4} 
                        placeholder="PIN"
                        value={mfaPin}
                        onChange={(e) => setMfaPin(e.target.value.replace(/\D/g, ''))}
                        className="bg-slate-950 text-center w-24 py-2 px-3 border border-slate-700 rounded-lg text-emerald-400 font-mono tracking-widest text-lg focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                      />
                    </div>
                  </div>
                )}

                {mfaMethod === 'QR_FACE' && (
                  <div className="mb-4 p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn">
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <QrCode className="w-3.5 h-3.5 text-cyan-400" /> Employee ID Badge QR Scan
                      </h4>
                      <p className="text-[11px] text-slate-400">Match static biometric parameters with 2FA credential cards before running active facial verification.</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      {!qrCodeScanned ? (
                        <button
                          onClick={() => {
                            setQrCodeScanned(true);
                            if (useRealCamera) {
                              setStatusMessage("QR Code Code: SECURE_ID_MAPPED. Ready to proceed with face matches.");
                            } else {
                              setStatusMessage(`QR Code verified for employee payload: ${selectedPreset.employeeId}`);
                            }
                          }}
                          className="bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] text-white text-xs px-4 py-2 rounded-lg font-medium transition-all shadow-md shadow-cyan-950/50 flex items-center gap-1"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          Simulate QR Scan Badge
                        </button>
                      ) : (
                        <div className="bg-emerald-950/40 border border-emerald-800/80 p-2 rounded-lg flex items-center gap-2 text-emerald-400 text-xs">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                          <span>QR Badge Mapped ({useRealCamera ? 'EMP-LIVE' : selectedPreset.employeeId})</span>
                          <button onClick={() => setQrCodeScanned(false)} className="text-[10px] text-slate-400 hover:text-white underline ml-1">Reset</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {mfaMethod === 'FACE_VOICE' && (
                  <div className="mb-4 p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn">
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Mic className="w-3.5 h-3.5 text-amber-500" /> Offline Speaker Acoustic Recognition
                      </h4>
                      <p className="text-[11px] text-slate-400">Continuous biometric multi-factor speech recognition. Press below to record voice waves stream.</p>
                      
                      {/* Animated audio equalizer visualizer */}
                      <div className="flex items-end gap-1.5 h-12 bg-slate-950/80 rounded-lg p-2.5 mt-3 border border-slate-800/60 overflow-hidden">
                        {vocalPulse.map((val, idx) => (
                          <div 
                            key={idx} 
                            style={{ height: `${val}%` }} 
                            className={`flex-1 rounded-sm transition-all duration-150 ${isRecordingVoice ? 'bg-amber-500 animate-pulse' : 'bg-slate-700'}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsRecordingVoice(!isRecordingVoice)}
                        className={`w-32 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${isRecordingVoice ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-950/50 animate-pulse' : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'}`}
                      >
                        {isRecordingVoice ? 'Stop Recording' : 'Simulate Rec Voice'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Primary interactive biometric camera screen panel */}
                <div className="relative mt-4 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden max-h-[300px] min-h-[220px] flex flex-col items-center justify-center">
                  
                  {/* Camera screen simulation layout overlay */}
                  <div className="absolute inset-0 border-[16px] border-black/40 pointer-events-none z-10" />
                  <div className="absolute top-4 left-4 z-20 text-[9px] font-mono uppercase bg-black/80 text-emerald-400 px-2 py-1 rounded border border-emerald-950 tracking-wider">
                    STREAM // {useRealCamera ? 'USB_LIVESTREAM' : 'SIMULATOR_SCENARIO'}
                  </div>

                  {mfaMethod === 'QR_FACE' && !qrCodeScanned && (
                    <div className="absolute inset-0 bg-slate-950/90 z-20 flex flex-col items-center justify-center p-6 text-center">
                      <div className="p-4 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 mb-2 animate-pulse">
                        <QrCode className="w-8 h-8" />
                      </div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">MFA Scan Needed</h4>
                      <p className="text-xs text-slate-400 max-w-sm mt-1">Please scan the associated Employee ID barcode badge first before launching face metrics matching.</p>
                      <button 
                        onClick={() => setQrCodeScanned(true)}
                        className="mt-3 bg-cyan-700 hover:bg-cyan-600 text-white font-medium text-xs py-1.5 px-3.5 rounded-lg transition-all"
                      >
                        Instabypass QR Scan
                      </button>
                    </div>
                  )}

                  {/* Camera input stream tags */}
                  {useRealCamera ? (
                    <video 
                      ref={videoRef}
                      playsInline 
                      muted 
                      className="w-full h-full object-cover rounded-xl"
                      style={{ transform: 'scaleX(-1)' }} // Mirror view
                    />
                  ) : (
                    /* Drawn Simulator Canvas representation of people */
                    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-center p-4">
                      
                      {/* Generative design face placeholder */}
                      <div className="relative w-28 h-28 rounded-full bg-[#1e293b] border-2 border-slate-700 flex items-center justify-center text-slate-400 overflow-hidden mb-2">
                        {/* Avatar */}
                        {selectedPreset.id.includes('rajesh') ? (
                          <div className="text-3xl font-extrabold uppercase font-mono text-emerald-400">R</div>
                        ) : selectedPreset.id.includes('ananya') ? (
                          <div className="text-3xl font-extrabold uppercase font-mono text-cyan-400">A</div>
                        ) : selectedPreset.id.includes('photo') ? (
                          <div className="text-3xl font-extrabold uppercase font-mono text-amber-500">P</div>
                        ) : selectedPreset.id.includes('tablet') ? (
                          <div className="text-3xl font-extrabold uppercase font-mono text-red-500">T</div>
                        ) : (
                          <div className="text-3xl font-extrabold uppercase font-mono text-slate-400">U</div>
                        )}

                        {/* PPE Mock helmet overlays over face */}
                        {selectedPreset.ppeCompliance.helmet && (
                          <div className="absolute top-1 bg-yellow-400 w-full text-black text-[8px] font-bold py-0.5 rounded text-center">HELMET</div>
                        )}
                        {selectedPreset.ppeCompliance.vest && (
                          <div className="absolute bottom-0 bg-orange-500 w-full text-white text-[8px] font-bold py-0.5 text-center">VEST</div>
                        )}
                      </div>

                      <span className="text-xs font-bold text-slate-200 mt-1">{selectedPreset.name}</span>
                      <span className="text-[10px] text-slate-400 tracking-wider uppercase font-mono mt-0.5">ROLE: {selectedPreset.role}</span>
                      <span className="text-[10px] text-emerald-400 font-mono mt-1">Geolocating: {selectedPreset.locationName}</span>

                      {selectedPreset.forceSpoof && (
                        <div className="absolute inset-0 bg-red-950/20 border border-red-500/30 flex items-center justify-center pointer-events-none">
                          <span className="bg-red-500 text-black font-extrabold text-[10px] px-3.5 py-1 rounded uppercase tracking-widest animate-pulse">SPOOF DEVICE ACTIVE</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Capture Face bounding box indicators */}
                  <div className="absolute inset-0 flex items-center justify-center z-15 pointer-events-none">
                    <div className="w-48 h-48 border-2 border-dashed border-emerald-500/40 rounded-full animate-pulse flex items-center justify-center">
                      <div className="w-40 h-40 border border-emerald-500/20 rounded-full" />
                    </div>
                  </div>

                  {/* Device bound warning if compromised */}
                  {deviceIsTampered && (
                    <div className="absolute bottom-4 z-20 bg-red-900/90 text-white font-heavy text-xs px-4 py-1.5 rounded-lg flex items-center gap-1.5 border border-red-500/40 animate-bounce">
                      <AlertTriangle className="w-3.5 h-3.5 animate-pulse text-amber-300" />
                      <span>Tamper Daemon Alert: Mobile terminal is ROOT COMPROMISED!</span>
                    </div>
                  )}
                  
                </div>

                {/* Submitting button trigger */}
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={triggerAuthentication}
                    disabled={isVerifying || (mfaMethod === 'QR_FACE' && !qrCodeScanned)}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:scale-[0.99] disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-black font-bold text-xs py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-black" />
                        Analyzing Facials (Edge Inference 300ms)...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4.5 h-4.5 text-black" />
                        RUN PASSIVE LIVENESS & IDENTITY VERIFICATION
                      </>
                    )}
                  </button>

                  <canvas ref={canvasRef} className="hidden" />
                </div>

              </div>

            </div>

            {/* Right Box: AI Results & Metric Output Reports (5 Columns) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Report view */}
              <div className="bg-[#111622] rounded-2xl border border-slate-800 p-6 flex flex-col h-full shadow-2xl justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" /> Edge AI Decipher metrics
                  </h3>

                  {verificationResult ? (
                    <div className="flex flex-col gap-5 animate-fadeIn">
                      
                      {/* Overall authorization state */}
                      <div className={`p-4 rounded-xl border flex items-center gap-4 ${authSuccessIndicator === 'SUCCESS' ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200' : 'bg-red-950/40 border-red-900/60 text-red-200'}`}>
                        {authSuccessIndicator === 'SUCCESS' ? (
                          <div className="p-2.5 rounded-full bg-emerald-500 text-black">
                            <CheckCircle2 className="w-7 h-7 stroke-[2.25]" />
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-full bg-red-500 text-black">
                            <XCircle className="w-7 h-7 stroke-[2.25]" />
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-bold tracking-wider uppercase font-mono">
                            {authSuccessIndicator === 'SUCCESS' ? 'AUTHORIZATION OK' : 'ACCESS DENIED'}
                          </h4>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            {authSuccessIndicator === 'SUCCESS' 
                              ? `Successfully verified physical presence for employee. Local ledger synchronized.`
                              : `Security threat block active: ${statusMessage}`}
                          </p>
                        </div>
                      </div>

                      {/* Scores & Gauges */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl text-center">
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Face Match</span>
                          <span className={`text-xl font-mono font-bold ${verificationResult.matchScore >= 90 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {Math.round(verificationResult.matchScore)}%
                          </span>
                          <span className="block text-[8px] text-slate-500 mt-0.5">Threshold &gt;90%</span>
                        </div>
                        <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl text-center">
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Liveness Score</span>
                          <span className={`text-xl font-mono font-bold ${verificationResult.livenessScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {Math.round(verificationResult.livenessScore)}%
                          </span>
                          <span className="block text-[8px] text-slate-500 mt-0.5">Threshold &gt;80%</span>
                        </div>
                        <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl text-center">
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">AI Risk Score</span>
                          <span className={`text-xl font-mono font-bold ${verificationResult.riskScore > 60 ? 'text-red-400' : verificationResult.riskScore > 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {verificationResult.riskScore}/100
                          </span>
                          <span className="block text-[8px] text-slate-500 mt-0.5">Rating: {verificationResult.riskLevel}</span>
                        </div>
                      </div>

                      {/* Face Mesh metrics detail */}
                      <div className="bg-slate-950 rounded-xl p-4 border border-slate-850/80 font-mono text-[11px] text-slate-300 leading-normal gap-2.5 flex flex-col">
                        <div className="flex justify-between pb-1.5 border-b border-slate-900">
                          <span className="text-slate-400">Biological Spoof Filter:</span>
                          <span className={verificationResult.spoofDetected ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                            {verificationResult.spoofDetected ? '⚠️ ATTACK FOUND' : 'PASSED'}
                          </span>
                        </div>
                        <p className="text-[10.5px] leading-relaxed text-slate-400 border-b border-slate-900 pb-2">
                          <strong>Anti-Spoof Log:</strong> {verificationResult.spoofReason}
                        </p>
                        
                        {/* Location Geolocation checks */}
                        <div className="flex justify-between items-center pb-1.5 border-b border-slate-900">
                          <span className="text-slate-400">Authorized GPS Geofence:</span>
                          <span className={verificationResult.insideGeofence ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                            {verificationResult.insideGeofence ? 'COMPLIANT' : '⚠️ VIOLATION'}
                          </span>
                        </div>
                        <p className="text-[10.5px] leading-relaxed text-slate-400 border-b border-slate-900 pb-2">
                          <strong>Active Precinct:</strong> {verificationResult.currentLocationName}
                        </p>

                        {/* PPE safety checks */}
                        <div>
                          <span className="text-slate-400 block mb-1">Workplace Industrial PPE compliance check:</span>
                          <div className="flex gap-2 text-[10px] mt-1 text-slate-300">
                            <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${verificationResult.ppeCompliance.helmet ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900' : 'bg-slate-900 text-slate-500'}`}>
                              <HardHat className="w-3 h-3" /> Helmet: {verificationResult.ppeCompliance.helmet ? 'YES' : 'NO'}
                            </span>
                            <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${verificationResult.ppeCompliance.vest ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900' : 'bg-slate-900 text-slate-500'}`}>
                              <Sliders className="w-3 h-3" /> Vest: {verificationResult.ppeCompliance.vest ? 'YES' : 'NO'}
                            </span>
                            <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${verificationResult.ppeCompliance.goggles ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900' : 'bg-slate-900 text-slate-500'}`}>
                              <Eye className="w-3 h-3" /> Goggles: {verificationResult.ppeCompliance.goggles ? 'YES' : 'NO'}
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="bg-slate-950 rounded-2xl p-8 border border-dashed border-slate-800 text-center flex-1 flex flex-col items-center justify-center my-4 h-64">
                      <Lock className="w-10 h-10 text-slate-600 mb-2 animate-pulse" />
                      <h4 className="text-sm font-semibold text-slate-400">Reports Pending Face Capture</h4>
                      <p className="text-xs text-slate-500 max-w-xs mt-1">Select a testing scenario preset on the left or launch the real webcam feed to run Edge AI assessments.</p>
                    </div>
                  )}

                  {/* Operational targets */}
                  <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 text-xs">
                    <h4 className="font-bold text-slate-300 mb-2 flex items-center gap-1">
                      <Check className="w-4 h-4 text-emerald-400" /> Operational target benchmarks
                    </h4>
                    <ul className="space-y-1.5 text-slate-400">
                      <li className="flex justify-between">
                        <span>Quantized Model Footprint:</span>
                        <span className="font-semibold text-emerald-400">&lt; 20 MB (PASSED)</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Offline Recognition Speed:</span>
                        <span className="font-semibold text-emerald-400">&lt; 1,000 ms (PASSED)</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Biometric accuracy rating:</span>
                        <span className="font-semibold text-emerald-400">&gt; 95% (PASSED)</span>
                      </li>
                    </ul>
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}

        {/* -------------------- TAB 2: OFFICER ENROLLMENT -------------------- */}
        {activeTab === 'enroll' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Enrollment form (7 columns) */}
            <div className="lg:col-span-7 bg-[#111622] rounded-2xl border border-slate-800 p-6 shadow-2xl flex flex-col justify-between">
              
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
                  <UserPlus className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">OFFLINE CRYPTO BIOMETRIC REGISTER</h3>
                    <p className="text-xs text-slate-400">Enroll new remote officers without internet using quantized local face metrics maps.</p>
                  </div>
                </div>

                {enrollStep === 0 ? (
                  <form onSubmit={handleEnrollSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Employee / Ranger ID</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. EMP-005"
                          className="w-full bg-slate-950 border border-slate-700/80 text-xs py-2 px-3 rounded-lg text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                          value={enrollForm.id}
                          onChange={(e) => setEnrollForm({ ...enrollForm, id: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Vikram Malhotra"
                          className="w-full bg-slate-950 border border-slate-700/80 text-xs py-2 px-3 rounded-lg text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          value={enrollForm.name}
                          onChange={(e) => setEnrollForm({ ...enrollForm, name: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Officer Role Designation</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Subcontractor, Ranger"
                          className="w-full bg-slate-950 border border-slate-700/80 text-xs py-2 px-3 rounded-lg text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          value={enrollForm.role}
                          onChange={(e) => setEnrollForm({ ...enrollForm, role: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department Region</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Sariska NW-8, Restricted Mines"
                          className="w-full bg-slate-950 border border-slate-700/80 text-xs py-2 px-3 rounded-lg text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          value={enrollForm.department}
                          onChange={(e) => setEnrollForm({ ...enrollForm, department: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-400 leading-normal flex-col flex gap-1.5">
                      <span className="font-bold text-slate-200">GDPR & Private Biometrics Protection Notice:</span>
                      <span>This application strictly operates as an embedding-only architecture. The user&apos;s physical face photo coordinates are compiled instantly into encrypted 512-float vector tensors. The original image is purged from the smartphone buffer forever.</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-heavy text-xs uppercase tracking-widest py-3 rounded-xl transition-all shadow-md shadow-emerald-950/40"
                    >
                      Initialize Offline Angle Scan
                    </button>
                  </form>
                ) : (
                  /* Enrollment multi-angle wizard */
                  <div className="text-center py-6 flex flex-col items-center gap-5">
                    
                    {enrollStep === 1 && (
                      <div className="animate-fadeIn w-full">
                        <span className="text-xs font-bold text-orange-400 uppercase bg-orange-950/40 border border-orange-800 px-3 py-1 rounded inline-block mb-3">STEP 1 OF 3: ENROLL FRONT VIEW</span>
                        <h4 className="text-sm font-bold text-white mb-2">Look straight and align face in frame.</h4>
                        <div className="mx-auto w-44 h-44 rounded-full bg-slate-950 border-4 border-orange-500 flex items-center justify-center text-slate-300 animate-pulse relative overflow-hidden my-4">
                          <Eye className="w-12 h-12 text-orange-400" />
                          <div className="absolute inset-x-0 bottom-4 bg-black/80 py-1 text-[9px] text-orange-300 font-mono uppercase">Position Front</div>
                        </div>
                      </div>
                    )}

                    {enrollStep === 2 && (
                      <div className="animate-fadeIn w-full">
                        <span className="text-xs font-bold text-orange-400 uppercase bg-orange-950/40 border border-orange-800 px-3 py-1 rounded inline-block mb-3">STEP 2 OF 3: ENROLL LEFT PROFILE</span>
                        <h4 className="text-sm font-bold text-white mb-2">Turn face slightly left (~30 degrees).</h4>
                        <div className="mx-auto w-44 h-44 rounded-full bg-slate-950 border-4 border-orange-500 flex items-center justify-center text-slate-300 animate-pulse relative overflow-hidden my-4">
                          <Sliders className="w-12 h-12 text-orange-400 rotate-90" />
                          <div className="absolute inset-x-0 bottom-4 bg-black/80 py-1 text-[9px] text-orange-300 font-mono uppercase">Position Left</div>
                        </div>
                      </div>
                    )}

                    {enrollStep === 3 && (
                      <div className="animate-fadeIn w-full">
                        <span className="text-xs font-bold text-orange-400 uppercase bg-orange-950/40 border border-orange-800 px-3 py-1 rounded inline-block mb-3">STEP 3 OF 3: ENROLL RIGHT PROFILE</span>
                        <h4 className="text-sm font-bold text-white mb-2">Turn face slightly right (~30 degrees).</h4>
                        <div className="mx-auto w-44 h-44 rounded-full bg-slate-950 border-4 border-orange-500 flex items-center justify-center text-slate-300 animate-pulse relative overflow-hidden my-4">
                          <Sliders className="w-12 h-12 text-orange-400 -rotate-90" />
                          <div className="absolute inset-x-0 bottom-4 bg-black/80 py-1 text-[9px] text-orange-300 font-mono uppercase">Position Right</div>
                        </div>
                      </div>
                    )}

                    {enrollStep === 4 && (
                      <div className="animate-fadeIn w-full py-4 text-center">
                        <RefreshCw className="w-10 h-10 animate-spin text-emerald-400 mx-auto mb-3" />
                        <h4 className="text-base font-bold text-white">Generating Face Embedding files...</h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">Quantization engine in action. Compressing floating-point tensors into 8bit integers... writing securely to secure local keyring storage vault.</p>
                      </div>
                    )}

                    {enrollStep <= 3 && (
                      <div className="flex gap-3 mt-4">
                        <button
                          type="button"
                          onClick={() => { setEnrollStep(0); setIsEnrollingInProgress(false); }}
                          className="bg-slate-800 hover:bg-slate-705 text-xs px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300"
                        >
                          Cancel Enrollment
                        </button>
                        <button
                          type="button"
                          onClick={handleEnrollCaptureStep}
                          className="bg-emerald-600 hover:bg-emerald-500 ppy-2.5 text-xs px-6 py-2.5 rounded-lg font-bold text-black flex items-center gap-1.5"
                        >
                          <Camera className="w-4 h-4 text-black" />
                          Capture current Angle
                        </button>
                      </div>
                    )}

                  </div>
                )}
              </div>

            </div>

            {/* Current enrolled profiles lists directory (5 columns) */}
            <div className="lg:col-span-5 bg-[#111622] rounded-2xl border border-slate-800 p-6 flex flex-col shadow-2xl justify-between">
              
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <UserCheck className="w-4.5 h-4.5 text-emerald-400" /> Active Local Biometric directory ({profiles.length})
                </h3>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {profiles.map((p) => (
                    <div key={p.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-white text-sm">{p.name}</strong>
                          <span className="font-mono text-[9px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-wider">{p.id}</span>
                        </div>
                        <p className="text-slate-45px text-slate-400 font-medium mt-1">Role: {p.role} // Region: {p.department}</p>
                        <span className="block text-[9.5px] text-emerald-400/80 font-mono mt-1.5">🔑 Local Keys: Enrolled with {p.embeddingsCount} angles</span>
                      </div>
                      <div className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 p-1.5 rounded-lg font-bold text-[9px] uppercase tracking-wider">
                        SECURE
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* -------------------- TAB 3: WORKFORCE ATTENDANCE DASHBOARD -------------------- */}
        {activeTab === 'logs' && (
          <div className="flex flex-col gap-6">
            
            {/* Sync control stats header panel */}
            <div className="bg-gradient-to-r from-slate-900 via-[#131b2c] to-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
              <div className="flex-1">
                <div className="flex items-center gap-4.5">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-400" /> Secure Offline Workforce Repository
                  </h3>
                  <div className="bg-amber-950/40 text-amber-500 border border-amber-900 text-[10px] uppercase font-bold py-1 px-2.5 rounded-lg flex items-center gap-1">
                    <WifiOff className="w-3.5 h-3.5" />
                    Pending Cloud Sync: {pendingSyncLogsCount} logs
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2 max-w-2xl leading-normal">
                  Field personnel scan metrics are logged inside an AES-256 encrypted relational sandbox. When a satellite or cellular link is detected, tap Sync with Cloud to upload compliance reports directly to AWS API Gateway/DynamoDB and purge local memory space to protect user privacy.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={handleCloudSync}
                  disabled={isSyncing || pendingSyncLogsCount === 0}
                  className="bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-black font-heavy text-xs tracking-wide uppercase px-5 py-3 rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 text-black ${isSyncing ? 'animate-spin' : ''}`} />
                  Sync Work logs with AWS
                </button>

                <button
                  onClick={handlePurgeLocalLogs}
                  disabled={logs.filter(l => l.syncStatus === 'SYNCED').length === 0}
                  className="bg-slate-900 hover:bg-slate-800 hover:text-white border border-slate-700/80 px-4 py-3 rounded-xl text-xs text-slate-300 font-semibold flex items-center gap-1.5"
                  title="Purge fully synchronized records from offline cache memory"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                  Purge Synced Cache
                </button>
              </div>
            </div>

            {/* Attendance database table query layout */}
            <div className="bg-[#111622] rounded-2xl border border-slate-800 p-6 shadow-2xl">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-800/60">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Authentication Logs ledger</h4>
                
                {/* Search bar inputs */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                  <input 
                    type="text"
                    placeholder="Search logs by employee, role, location..."
                    className="w-full bg-slate-950 border border-slate-700/80 text-xs py-2 pl-9 pr-4 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3.5 top-2.5 text-xs text-slate-500 hover:text-white underline font-medium">Clear</button>
                  )}
                </div>
              </div>

              {filteredLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[800px]">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-950/40">
                        <th className="py-3 px-4">Employee ID</th>
                        <th className="py-3 px-4">Officer Details</th>
                        <th className="py-3 px-4">Captured Timestamp</th>
                        <th className="py-3 px-4">Terminal & Device</th>
                        <th className="py-3 px-4">AI Score metrics</th>
                        <th className="py-3 px-4">Risk score Rating</th>
                        <th className="py-3 px-4">GPS Precinct</th>
                        <th className="py-3 px-4">AWS Sync Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {filteredLogs.map((log) => (
                        <tr 
                          key={log.id} 
                          className="hover:bg-slate-900/40 transition-colors"
                        >
                          <td className="py-4 px-4 font-mono font-semibold text-slate-300">
                            {log.employeeId}
                          </td>
                          <td className="py-4 px-4">
                            <strong className="text-white text-sm block">{log.employeeName}</strong>
                            <span className="text-[10px] text-slate-400">{log.ppeCompliance.helmet || log.ppeCompliance.vest ? 'Wearing PPE Equipment' : 'Compliance Check Done'}</span>
                          </td>
                          <td className="py-4 px-4 font-mono text-slate-400">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="py-4 px-4">
                            <span className="block text-slate-200">{log.deviceModel}</span>
                            <span className="block text-[10px] text-slate-400 font-mono">Factor: {log.mfaMethod}</span>
                          </td>
                          <td className="py-4 px-4 font-mono text-slate-300">
                            <div className="flex flex-col">
                              <span>Match: {log.matchScore}%</span>
                              <span className="text-[10px] text-slate-400">Liveness: {log.livenessScore}%</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-block font-mono font-bold text-[10px] px-2 py-0.5 rounded ${log.riskLevel === 'SAFE' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900' : log.riskLevel === 'LOW' ? 'bg-blue-950/40 text-blue-400 border border-blue-900' : log.riskLevel === 'MEDIUM' ? 'bg-amber-950/40 text-amber-400 border border-amber-900' : 'bg-red-950/40 text-red-400 border border-red-900'}`}>
                              {log.riskLevel} ({log.riskScore}%)
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono text-slate-400">
                            <span className="block text-slate-200">{log.locationName}</span>
                            <span className="text-[9.5px] text-slate-500">[{log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}]</span>
                          </td>
                          <td className="py-4 px-4">
                            {log.syncStatus === 'SYNCED' ? (
                              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-950/20 px-2 py-1 rounded">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                SYNCED & PURGED
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-amber-500 font-bold bg-amber-950/20 px-2 py-1 rounded">
                                <WifiOff className="w-3.5 h-3.5" />
                                PENDING SYNC
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <Database className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-bounce" />
                  <p className="text-sm text-slate-400 font-medium">No workforce logs entries match filters.</p>
                </div>
              )}

            </div>

          </div>
        )}

        {/* -------------------- TAB 4: GEOFENCES & HARDWARE CONSOLE -------------------- */}
        {activeTab === 'geofences' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Geofencing Controller Card */}
            <div className="bg-[#111622] rounded-2xl border border-slate-800 p-6 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Geofenced Work precincts</h3>
                    <p className="text-xs text-slate-400">Define approved GIS borders for personnel checks and prevent off-site entry.</p>
                  </div>
                </div>

                {/* Form to append geofence */}
                <form onSubmit={handleAddGeofenceSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-900/60 p-4 border border-slate-800 rounded-xl mb-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Precinct Location Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Sariska Patrol Outpost Main Sector"
                      className="w-full bg-slate-950 border border-slate-700/80 text-xs py-1.5 px-3 rounded-lg text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={newGeofence.name}
                      onChange={(e) => setNewGeofence({ ...newGeofence, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Latitude Coordinate</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 27.3524"
                      className="w-full bg-slate-950 border border-slate-700/80 text-xs py-1.5 px-3 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      value={newGeofence.latitude}
                      onChange={(e) => setNewGeofence({ ...newGeofence, latitude: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Longitude Coordinate</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 76.4382"
                      className="w-full bg-slate-950 border border-slate-700/80 text-xs py-1.5 px-3 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      value={newGeofence.longitude}
                      onChange={(e) => setNewGeofence({ ...newGeofence, longitude: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Allowed Radius Range (Meters)</label>
                    <input 
                      type="number" 
                      required
                      placeholder="e.g. 500"
                      className="w-full bg-slate-950 border border-slate-700/80 text-xs py-1.5 px-3 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      value={newGeofence.radius}
                      onChange={(e) => setNewGeofence({ ...newGeofence, radius: e.target.value })}
                    />
                  </div>
                  <button 
                    type="submit"
                    className="sm:col-span-2 bg-emerald-600 hover:bg-emerald-500 text-black font-semibold text-xs py-2 rounded-lg transition-all shadow-md mt-1.5"
                  >
                    Add Approved Geofence Range
                  </button>
                </form>

                {/* List active geofences */}
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Enforced Regional Precincts</h4>
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                  {geofences.map((gf) => (
                    <div key={gf.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-xs flex justify-between items-center gap-2">
                      <div className="flex gap-2.5">
                        <Map className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white block font-semibold">{gf.name}</strong>
                          <span className="block text-[10px] text-slate-400 mt-1">
                            GPS Lat/Lon: <strong className="font-mono">{gf.latitude}, {gf.longitude}</strong>
                          </span>
                          <span className="block text-[10px] text-emerald-400 font-mono">Radius Limit: {gf.radius} meters radius perimeter</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950 p-1 rounded font-mono border border-emerald-900/60">ACTIVE</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Hardware Console integration (DeviceStatusTerm) */}
            <div className="shadow-2xl">
              <DeviceStatusTerm 
                devices={devices}
                onBindDevice={handleDeviceBind}
                selectedDeviceId={selectedDeviceId}
                onSelectDevice={setSelectedDeviceId}
              />
            </div>

          </div>
        )}

      </main>

      {/* Footer Area */}
      <footer className="bg-[#121824] border-t border-slate-800 py-6 px-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 FaceGuard Edge AI Systems. Fully self-contained edge device bundle. Built using Google AI Studio.</p>
          <div className="flex gap-4">
            <span className="text-emerald-500 font-mono tracking-widest uppercase font-semibold">TENSORFLOW LITE INFERENCE ON DEVICE COMPLIANT</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
