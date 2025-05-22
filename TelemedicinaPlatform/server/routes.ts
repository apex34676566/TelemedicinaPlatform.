import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertAppointmentSchema, insertMessageSchema, insertPrescriptionSchema, insertMedicalRecordSchema } from "@shared/schema";

// Set up file upload
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.get('/api/doctors', isAuthenticated, async (req, res) => {
    try {
      const doctors = await storage.getUsersByRole('doctor');
      res.json(doctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(500).json({ message: "Failed to fetch doctors" });
    }
  });

  app.get('/api/patients', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'doctor') {
        return res.status(403).json({ message: "Only doctors can view patients" });
      }
      
      const patients = await storage.getDoctorPatients(userId);
      res.json(patients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  // Appointment routes
  app.post('/api/appointments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = insertAppointmentSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ errors: result.error.format() });
      }
      
      // Ensure patientId matches authenticated user or the user is a doctor
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.role === 'patient' && result.data.patientId !== userId) {
        return res.status(403).json({ message: "Patients can only create appointments for themselves" });
      }
      
      const appointment = await storage.createAppointment(result.data);
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });
  
  app.get('/api/appointments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      let appointments;
      if (user.role === 'doctor') {
        appointments = await storage.getAppointmentsByDoctor(userId);
      } else {
        appointments = await storage.getAppointmentsByPatient(userId);
      }
      
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });
  
  app.get('/api/appointments/upcoming', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      let appointments;
      if (user.role === 'doctor') {
        appointments = await storage.getUpcomingAppointmentsByDoctor(userId);
      } else {
        appointments = await storage.getUpcomingAppointmentsByPatient(userId);
      }
      
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching upcoming appointments:", error);
      res.status(500).json({ message: "Failed to fetch upcoming appointments" });
    }
  });
  
  app.get('/api/appointments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const appointment = await storage.getAppointment(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      const userId = req.user.claims.sub;
      // Ensure user is either the patient or doctor for this appointment
      if (appointment.patientId !== userId && appointment.doctorId !== userId) {
        return res.status(403).json({ message: "Not authorized to view this appointment" });
      }
      
      res.json(appointment);
    } catch (error) {
      console.error("Error fetching appointment:", error);
      res.status(500).json({ message: "Failed to fetch appointment" });
    }
  });
  
  app.put('/api/appointments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Ensure user is either the patient or doctor for this appointment
      if (appointment.patientId !== userId && appointment.doctorId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this appointment" });
      }
      
      const result = insertAppointmentSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ errors: result.error.format() });
      }
      
      const updatedAppointment = await storage.updateAppointment(appointmentId, result.data);
      res.json(updatedAppointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });
  
  app.delete('/api/appointments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Ensure user is either the patient or doctor for this appointment
      if (appointment.patientId !== userId && appointment.doctorId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this appointment" });
      }
      
      await storage.deleteAppointment(appointmentId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });
  
  // Message routes
  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      
      const messageData = {
        ...req.body,
        senderId,
      };
      
      const result = insertMessageSchema.safeParse(messageData);
      if (!result.success) {
        return res.status(400).json({ errors: result.error.format() });
      }
      
      const message = await storage.createMessage(result.data);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  
  app.get('/api/messages/conversation/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const otherUserId = req.params.userId;
      
      const messages = await storage.getConversation(currentUserId, otherUserId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });
  
  app.post('/api/messages/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const messageId = parseInt(req.params.id);
      await storage.markMessageAsRead(messageId);
      res.status(204).send();
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });
  
  // Prescription routes
  app.post('/api/prescriptions', isAuthenticated, async (req: any, res) => {
    try {
      const doctorId = req.user.claims.sub;
      
      // Ensure the user is a doctor
      const doctor = await storage.getUser(doctorId);
      if (!doctor || doctor.role !== 'doctor') {
        return res.status(403).json({ message: "Only doctors can create prescriptions" });
      }
      
      const prescriptionData = {
        ...req.body,
        doctorId,
      };
      
      const result = insertPrescriptionSchema.safeParse(prescriptionData);
      if (!result.success) {
        return res.status(400).json({ errors: result.error.format() });
      }
      
      const prescription = await storage.createPrescription(result.data);
      res.status(201).json(prescription);
    } catch (error) {
      console.error("Error creating prescription:", error);
      res.status(500).json({ message: "Failed to create prescription" });
    }
  });
  
  app.get('/api/prescriptions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      let prescriptions;
      if (user.role === 'doctor') {
        prescriptions = await storage.getPrescriptionsByDoctor(userId);
      } else {
        prescriptions = await storage.getPrescriptionsByPatient(userId);
      }
      
      res.json(prescriptions);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      res.status(500).json({ message: "Failed to fetch prescriptions" });
    }
  });
  
  app.get('/api/prescriptions/active', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activePrescriptions = await storage.getActivePrescriptionsByPatient(userId);
      res.json(activePrescriptions);
    } catch (error) {
      console.error("Error fetching active prescriptions:", error);
      res.status(500).json({ message: "Failed to fetch active prescriptions" });
    }
  });
  
  // Medical record routes
  app.post('/api/medical-records', isAuthenticated, async (req: any, res) => {
    try {
      const doctorId = req.user.claims.sub;
      
      // Ensure the user is a doctor
      const doctor = await storage.getUser(doctorId);
      if (!doctor || doctor.role !== 'doctor') {
        return res.status(403).json({ message: "Only doctors can create medical records" });
      }
      
      const recordData = {
        ...req.body,
        doctorId,
        date: new Date(),
      };
      
      const result = insertMedicalRecordSchema.safeParse(recordData);
      if (!result.success) {
        return res.status(400).json({ errors: result.error.format() });
      }
      
      const record = await storage.createMedicalRecord(result.data);
      res.status(201).json(record);
    } catch (error) {
      console.error("Error creating medical record:", error);
      res.status(500).json({ message: "Failed to create medical record" });
    }
  });
  
  app.get('/api/medical-records', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.role === 'patient') {
        const records = await storage.getMedicalRecordsByPatient(userId);
        return res.json(records);
      }
      
      // If doctor, they need to specify a patientId
      const patientId = req.query.patientId;
      if (!patientId) {
        return res.status(400).json({ message: "Patient ID is required" });
      }
      
      const records = await storage.getMedicalRecordsByPatient(patientId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching medical records:", error);
      res.status(500).json({ message: "Failed to fetch medical records" });
    }
  });
  
  // File upload routes
  app.post('/api/files/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const ownerId = req.user.claims.sub;
      const { relatedToId, relatedToType } = req.body;
      
      const fileData = {
        ownerId,
        relatedToId: relatedToId ? parseInt(relatedToId) : undefined,
        relatedToType,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      };
      
      const savedFile = await storage.saveFile(fileData);
      res.status(201).json(savedFile);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });
  
  app.get('/api/files', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const files = await storage.getFilesByOwner(userId);
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });
  
  app.get('/api/files/related/:type/:id', isAuthenticated, async (req, res) => {
    try {
      const relatedToType = req.params.type;
      const relatedToId = parseInt(req.params.id);
      
      const files = await storage.getFilesByRelation(relatedToId, relatedToType);
      res.json(files);
    } catch (error) {
      console.error("Error fetching related files:", error);
      res.status(500).json({ message: "Failed to fetch related files" });
    }
  });
  
  // Doctor-Patient relationship route
  app.post('/api/doctor-patient/assign', isAuthenticated, async (req: any, res) => {
    try {
      const doctorId = req.user.claims.sub;
      const { patientId } = req.body;
      
      if (!patientId) {
        return res.status(400).json({ message: "Patient ID is required" });
      }
      
      // Ensure the user is a doctor
      const doctor = await storage.getUser(doctorId);
      if (!doctor || doctor.role !== 'doctor') {
        return res.status(403).json({ message: "Only doctors can assign patients" });
      }
      
      // Ensure the patient exists
      const patient = await storage.getUser(patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      await storage.assignPatientToDoctor(doctorId, patientId);
      res.status(204).send();
    } catch (error) {
      console.error("Error assigning patient to doctor:", error);
      res.status(500).json({ message: "Failed to assign patient to doctor" });
    }
  });

  // Serve uploaded files without authentication for simplicity
  app.use('/uploads', express.static(uploadDir));

  const httpServer = createServer(app);
  return httpServer;
}
