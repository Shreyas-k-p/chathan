# Scan4Serve SaaS Platform

## Core Architecture
- **Multi-Tenant Isolation**: Data partitioned by `restaurantId`.
- **Strict State Machine**: Placed → Accepted → Preparing → Ready → Served → Completed.
- **Real-Time Engine**: Socket.io for live updates.
- **Modern UI**: Next.js 14 (App Router) + shadcn/ui + Tailwind CSS.

## Tech Stack
- Frontend: Next.js, Tailwind CSS, shadcn/ui, Zustand, Lucide-React.
- Backend: Node.js (Express), MongoDB (Mongoose), Socket.io, JWT.

## Folder Structure
```
root/
├── client/          # Next.js Frontend
│   ├── src/
│   │   ├── app/     # Pages: /order, /kitchen, /dashboard, /login
│   │   ├── store/   # Zustand State Management
│   │   ├── lib/     # Utilities (Socket, etc.)
│   │   └── components/ui/ # shadcn/ui Components
└── server/          # Node.js Backend
    ├── models/      # Mongoose Schemas (Order, User, Restaurant)
    ├── controllers/ # Business Logic (Strict State transitions)
    └── routes/      # Secure API Endpoints
```

## Setup & Run
1. **Server**:
   ```bash
   cd server
   npm install
   npm start
   ```
2. **Client**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

## Key Control Features
- **Customer Control**: Edit quantity/cancel ONLY in "Placed". Request cancel in "Accepted". Blocked in "Preparing".
- **Kitchen Control**: Approve/Reject cancel requests. Full menu availability control.
- **Real-time Events**: `new_order`, `order_updated`, `cancel_requested`, `cancel_approved`, `cancel_rejected`, `status_changed`.
