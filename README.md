<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/20106ffc-3498-4259-b941-234b3b5ca3d4

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

# FaceGuard Edge AI 360

## Secure Offline Facial Recognition and Liveness Detection System for Remote Operations

FaceGuard Edge AI 360 is a lightweight, secure, and fully offline facial recognition and liveness detection platform designed for field personnel operating in remote and zero-network environments. The solution enables fast and reliable identity verification directly on mobile devices without requiring internet connectivity.

The system combines Edge AI, facial recognition, anti-spoofing mechanisms, encrypted local storage, attendance tracking, geofencing, and cloud synchronization capabilities to provide secure authentication for organizations working in challenging environments.

---

## Problem Statement

Organizations operating in remote locations often face difficulties in verifying personnel identities because traditional facial recognition systems rely heavily on cloud connectivity.

FaceGuard Edge AI 360 addresses this challenge by enabling:

* Offline facial recognition
* Offline liveness detection
* Secure local authentication
* Fast verification on mobile devices
* Automatic synchronization when connectivity returns

---

## Key Features

### Offline Facial Recognition

Authenticate users entirely on-device without internet access.

### Advanced Liveness Detection

Prevent spoofing attacks using:

* Blink Detection
* Smile Detection
* Head Movement Verification
* Dynamic Challenge Response

### Anti-Spoofing Protection

Detect and reject:

* Printed photographs
* Mobile screen attacks
* Replay videos
* Basic deepfake attempts

### Secure Local Storage

* AES-256 Encryption
* Encrypted Face Embeddings
* Offline Authentication Logs

### Adaptive Lighting Engine

Improve recognition performance under:

* Harsh sunlight
* Low-light conditions
* Shadows
* Outdoor environments

### Geofencing Authentication

Restrict authentication to approved operational zones.

### Device Binding

Ensure authentication only from authorized devices.

### Offline Attendance Tracking

Automatically create attendance records after successful authentication.

### Fraud Detection Engine

Identify suspicious authentication attempts and unusual behavior patterns.

### AWS Sync & Purge Mechanism

* Store data locally during offline operation
* Synchronize records once internet becomes available
* Automatically purge synchronized records

---

## Technology Stack

### Frontend

* React Native
* TypeScript

### Artificial Intelligence

* TensorFlow Lite
* MobileFaceNet
* BlazeFace
* MediaPipe Face Mesh
* OpenCV

### Database

* SQLite
* Realm Database

### Security

* AES-256 Encryption
* Android Keystore
* iOS Keychain

### Cloud Infrastructure

* AWS Lambda
* API Gateway
* DynamoDB
* Amazon S3

---

## System Workflow

```text
User Authentication Request
            │
            ▼
      Face Detection
            │
            ▼
   Face Quality Assessment
            │
            ▼
    Liveness Verification
            │
            ▼
  Face Embedding Generation
            │
            ▼
      Face Matching
            │
            ▼
 Authentication Decision
            │
            ▼
Encrypted Local Storage
            │
            ▼
      AWS Synchronization
            │
            ▼
        Data Purge
```

---

## Security Features

* Offline Authentication
* Face Embedding Encryption
* Device Binding
* Root/Jailbreak Detection
* Tamper Detection
* Anti-Spoofing Protection
* Secure Key Management
* Privacy-Preserving Architecture

---

## Performance Targets

| Metric               | Target        |
| -------------------- | ------------- |
| Authentication Speed | < 1 Second    |
| Recognition Accuracy | > 95%         |
| Model Size           | < 20 MB       |
| Platform Support     | Android & iOS |
| Minimum RAM          | 3 GB          |

---

## Applications

### Government Sector

* Field Officers
* Public Service Personnel
* Inspection Teams

### Industrial Sector

* Construction Sites
* Manufacturing Facilities
* Mining Operations

### Security Sector

* Security Guards
* Restricted Access Facilities
* Border Security Operations

### Disaster Management

* Emergency Response Teams
* Rescue Personnel

### Forestry & Wildlife

* Forest Officers
* Wildlife Protection Teams

---

## Future Enhancements

* Voice Authentication
* Multi-Factor Authentication
* Blockchain Audit Logs
* Federated Learning
* Thermal Face Recognition
* Wearable Device Integration
* AI Behavioral Analytics

---

## Project Impact

FaceGuard Edge AI 360 provides a secure, scalable, and privacy-focused solution for personnel authentication in remote environments. By eliminating dependency on internet connectivity and leveraging lightweight Edge AI models, the platform ensures reliable identity verification, reduces fraud, improves operational efficiency, and enhances security for organizations operating in zero-network zones.

---

## License

This project is developed for educational, research, and hackathon purposes. All third-party libraries and frameworks used are open-source and comply with their respective licenses.
