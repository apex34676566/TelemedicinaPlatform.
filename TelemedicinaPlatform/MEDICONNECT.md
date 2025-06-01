# MediConnect - Telemedicine Platform

## Overview

MediConnect is a telemedicine platform that allows patients to connect with doctors for remote medical consultations. The application enables appointment scheduling, real-time video consultations, secure messaging, prescription management, and medical record keeping.

This is a full-stack web application built with a modern React frontend and a Node.js/Express backend. The application uses PostgreSQL for data storage via Drizzle ORM and integrates with Replit Auth for user authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built using:
- **React**: Core UI library
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: Component library based on Radix UI primitives
- **Wouter**: Lightweight router for navigation
- **React Query**: Data fetching and caching library
- **React Hook Form**: Form validation and submission

The UI follows a component-based architecture with a clear separation between pages, UI components, and business logic. The design system uses a consistent theme with a light/dark mode toggle capability.

### Backend Architecture

The backend is built using:
- **Express.js**: Web framework for handling HTTP requests
- **Drizzle ORM**: Database toolkit for working with PostgreSQL
- **Replit Auth**: Authentication system for user management
- **Express Session**: Session management for maintaining user state

The server follows a RESTful API design pattern where routes are organized by resource type. Authentication middleware protects routes that require user login.

### Data Storage

The application uses PostgreSQL for data persistence, with Drizzle ORM handling database interactions. The database schema includes tables for:

- Users (patients and doctors)
- Appointments
- Messages (for chat functionality)
- Prescriptions
- Medical records
- Files (for document uploads)

The database connection is managed via the Neon serverless Postgres client (@neondatabase/serverless).

### Authentication and Authorization

Authentication is implemented using Replit Auth, which provides:
- User identification and session management
- OAuth-based login
- Secure session storage in PostgreSQL

Authorization is role-based, differentiating between patient and doctor roles to control access to different features and resources.

## Key Components

### Frontend Components

1. **Pages**:
   - Home: Landing page and dashboard
   - Appointments: Schedule and manage appointments
   - Messages: Chat with doctors/patients
   - Prescriptions: View and manage prescriptions
   - MedicalRecords: Access and upload medical documents

2. **UI Components**:
   - Common UI elements from shadcn/ui
   - Custom components for video calls, chat interfaces, etc.
   - Form components for data entry

3. **Hooks**:
   - `useAuth`: Authentication state management
   - `useIsMobile`: Responsive design helper
   - `useToast`: Notification system

### Backend Components

1. **Routes**:
   - Auth routes: Login, logout, user profile
   - Appointment routes: CRUD operations for appointments
   - Message routes: Real-time and persistent messaging
   - Prescription routes: Create and manage prescriptions
   - Medical record routes: Upload and retrieve medical documents

2. **Middleware**:
   - Authentication middleware (isAuthenticated)
   - Error handling middleware
   - Logging middleware

3. **Services**:
   - Storage service: Database operations abstraction
   - Auth service: User authentication and session management

## Data Flow

1. **Authentication Flow**:
   - User navigates to the application
   - If not authenticated, redirected to login
   - Replit Auth handles the authentication process
   - Upon successful authentication, user session is created
   - User is redirected to the dashboard

2. **Appointment Booking Flow**:
   - Patient selects "Appointments" from navigation
   - Views available doctors and selects one
   - Chooses a time slot for the appointment
   - Appointment is created in the database
   - Notifications are sent to both patient and doctor

3. **Video Consultation Flow**:
   - When an appointment time arrives, both parties can join
   - Video conference room is created
   - Real-time communication occurs via the VideoCall component
   - Session data is recorded in the medical records

4. **Messaging Flow**:
   - Users select a contact from their list
   - Send and receive messages in real-time
   - Messages are persisted in the database
   - Unread message indicators are updated

## External Dependencies

### Frontend Dependencies

- **@radix-ui**: UI primitives for accessible components
- **@tanstack/react-query**: Data fetching and caching
- **@hookform/resolvers**: Form validation with zod
- **wouter**: Lightweight router
- **date-fns**: Date manipulation
- **lucide-react**: Icon library
- **clsx/class-variance-authority**: Utility for conditional class names

### Backend Dependencies

- **express**: Web server framework
- **@neondatabase/serverless**: PostgreSQL client
- **drizzle-orm**: Database ORM
- **openid-client/passport**: Authentication libraries
- **connect-pg-simple**: Session storage
- **multer**: File upload handling

## Deployment Strategy

The application is deployed on Replit with the following configuration:

1. **Development**:
   - Run with `npm run dev` which starts the development server
   - Vite handles hot module replacement for frontend
   - Backend runs with tsx for TypeScript execution

2. **Production**:
   - Build step: `npm run build`
     - Vite builds the frontend assets
     - esbuild bundles the server code
   - Run step: `npm run start`
     - Node.js runs the optimized server bundle

3. **Database**:
   - Uses Replit's PostgreSQL module for data persistence
   - Database migrations are handled via Drizzle ORM

4. **Environment Variables**:
   - `DATABASE_URL`: PostgreSQL connection string
   - `SESSION_SECRET`: Secret for securing sessions
   - `REPLIT_DOMAINS`: Allowed domains for authentication
   - `REPL_ID`: Replit-specific identifier

## Development Workflow

1. **Setting Up**:
   - The project uses Replit's Node.js 20 and PostgreSQL 16 modules
   - Database is automatically provisioned through Replit
   - Install dependencies with `npm install`

2. **Running Locally**:
   - Start the development server with `npm run dev`
   - Access the application at the provided URL

3. **Database Management**:
   - Use `npm run db:push` to sync the database schema
   - Database schema is defined in `shared/schema.ts`

4. **Adding New Features**:
   - Create components in the appropriate directories
   - Add routes in the server/routes.ts file
   - Update the database schema if necessary
   - Implement the frontend UI and connect to the backend

5. **Testing**:
   - Manual testing through the UI
   - API testing using the browser developer tools
