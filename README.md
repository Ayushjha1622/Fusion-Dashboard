# AEGIS-IV | Tactical Intelligence Fusion Dashboard

![AEGIS-IV Banner](https://img.shields.io/badge/PHASE-ACTIVE-00f2ff?style=for-the-badge&logo=opsgenie)
![Version](https://img.shields.io/badge/VERSION-3.0.0-facc15?style=for-the-badge)
![Security](https://img.shields.io/badge/SECURITY-OMEGA-ef4444?style=for-the-badge)

**AEGIS-IV** is a state-of-the-art Strategic Fusion Dashboard designed for real-time geospatial intelligence (GEOINT) and multi-modal data synchronization. It provides a centralized command interface for operators to monitor OSINT, HUMINT, and IMINT streams with professional-grade tactical precision.

---

## 🛰️ Intelligence Streams

### 1. OSINT (Open Source Intelligence)
- **Live News Ingestion**: Automatically pulls real-world security and defense headlines via the **News API**.
- **Automated Geocoding**: Converts textual location data into geospatial coordinates for map visualization.
- **Node Persistence**: New OSINT nodes are synced to the MongoDB core every 10 minutes.

### 2. HUMINT (Human Intelligence)
- **Tactical CSV Ingestion**: Support for bulk deployment of ground asset reports via optimized CSV upload.
- **Flexible Field Mapping**: Intelligence pipeline automatically recognizes various column formats (Lat/Lng, Title, Description).
- **Windows-Safe Processing**: Implementation of lock-safe unlinking for temporary payload files.

### 3. IMINT (Imagery Intelligence)
- **S3 Uplink**: Direct satellite imagery integration with **Amazon S3** storage.
- **Geotagging**: Precise coordinate assignment for high-altitude imagery nodes.
- **AI Tagging**: Automated tactical tag generation based on intelligence briefing content.

---

## 🗺️ Geospatial Visualization

- **Tactical Dark Grid**: Optimized high-contrast base layer for rapid data identification.
- **Sat-Link Mode**: High-resolution satellite imagery bypass via Esri/World_Imagery.
- **Intel Legend**: Real-time geospatial key for immediate source recognition:
  - 🟡 **HUMINT**: Human-sourced ground intelligence.
  - 🔴 **IMINT**: Satellite and aerial imagery nodes.
  - 🔵 **OSINT**: Open-source intercept and news data.
- **Intelligent Clustering**: High-performance marker clustering handling 500+ nodes with zero latency.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Leaflet.js |
| **Backend** | Node.js, Express, Socket.io |
| **Database** | MongoDB Atlas (Cluster Tier) |
| **Cloud Storage** | Amazon S3 (IMINT Repository) |
| **APIs** | News API (Global OSINT Fetch) |
| **Security** | JWT, HttpOnly Cookies, Bcrypt |

---

## 🚀 Deployment Guide

### Environment Variables (.env)
Create a `.env` file in the `Backend` directory with the following parameters:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
NEWS_API_KEY=your_news_api_key
AWS_KEY=your_aws_access_key
AWS_SECRET=your_aws_secret_key
AWS_REGION=your_aws_region
S3_BUCKET=your_s3_bucket_name
```

### Quick Start
1. **Initialize Core (Backend)**
   ```bash
   cd Backend
   npm install
   npm start
   ```

2. **Launch Terminal (Frontend)**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🔐 Security Protocols
- **Omega-Clearance Auth**: Role-based access control with secure session termination.
- **Nodemon Stealth Config**: Server ignores `uploads/` to prevent interruption during critical data sync.
- **Protected Routes**: Frontend intelligence layers are secured via high-order `ProtectedRoute` components.

---

**[ SYSTEM STATUS: OPERATIONAL ]**  
*Maintained by the Strategic Fusion Command*
