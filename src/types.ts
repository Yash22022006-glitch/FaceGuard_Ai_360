export interface UserProfile {
  id: string;
  name: string;
  role: string;
  department: string;
  deviceBoundId: string;
  enrolledAt: string;
  isEnrolled: boolean;
  embeddingsCount: number;
}

export interface AuthLog {
  id: string;
  employeeId: string;
  employeeName: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  locationName: string;
  matchScore: number;
  livenessScore: number;
  riskScore: number; // 0 to 100
  riskLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH';
  syncStatus: 'PENDING' | 'SYNCED' | 'FAILED';
  deviceModel: string;
  isTampered: boolean;
  ppeCompliance: {
    helmet: boolean;
    vest: boolean;
    goggles: boolean;
  };
  mfaMethod: 'FACE_ONLY' | 'FACE_PIN' | 'QR_FACE' | 'FACE_VOICE';
  antiSpoofResult: {
    passed: boolean;
    reason?: string;
  };
}

export interface GeofenceArea {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  isActive: boolean;
}

export type LivenessAction = 'BLINK' | 'SMILE' | 'HEAD_LEFT' | 'HEAD_RIGHT' | 'OPEN_MOUTH' | 'RAISE_EYEBROWS';

export interface LivenessChallenge {
  id: string;
  actions: LivenessAction[];
  text: string;
}

export interface DeviceBinding {
  id: string;
  model: string;
  os: 'Android' | 'iOS';
  osVersion: string;
  isTampered: boolean; // rooted or jailbroken
  isTrusted: boolean;
  boundAt: string;
}

export interface SystemMetrics {
  totalEnrolled: number;
  totalLogs: number;
  pendingSync: number;
  tamperAlerts: number;
  averageSpeedMs: number;
  accuracyRate: number;
}
