import {
  users,
  appointments,
  messages,
  prescriptions,
  medicalRecords,
  files,
  doctorPatients,
  type User,
  type UpsertUser,
  type Appointment,
  type InsertAppointment,
  type Message,
  type InsertMessage,
  type Prescription,
  type InsertPrescription,
  type MedicalRecord,
  type InsertMedicalRecord,
  type File,
  type InsertFile,
} from "@shared/schema";
import { db } from "./db";
import { and, eq, gt, gte, lt, or } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Get users by role
  getUsersByRole(role: string): Promise<User[]>;
  
  // Appointment operations
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByPatient(patientId: string): Promise<Appointment[]>;
  getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]>;
  getUpcomingAppointmentsByPatient(patientId: string): Promise<Appointment[]>;
  getUpcomingAppointmentsByDoctor(doctorId: string): Promise<Appointment[]>;
  updateAppointment(id: number, data: Partial<InsertAppointment>): Promise<Appointment>;
  deleteAppointment(id: number): Promise<void>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByUser(userId: string): Promise<Message[]>;
  getConversation(user1Id: string, user2Id: string): Promise<Message[]>;
  markMessageAsRead(id: number): Promise<void>;
  
  // Prescription operations
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  getPrescriptionsByPatient(patientId: string): Promise<Prescription[]>;
  getPrescriptionsByDoctor(doctorId: string): Promise<Prescription[]>;
  getActivePrescriptionsByPatient(patientId: string): Promise<Prescription[]>;
  
  // Medical record operations
  createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord>;
  getMedicalRecordsByPatient(patientId: string): Promise<MedicalRecord[]>;
  
  // File operations
  saveFile(file: InsertFile): Promise<File>;
  getFilesByOwner(ownerId: string): Promise<File[]>;
  getFilesByRelation(relatedToId: number, relatedToType: string): Promise<File[]>;
  
  // Doctor-Patient operations
  assignPatientToDoctor(doctorId: string, patientId: string): Promise<void>;
  getDoctorPatients(doctorId: string): Promise<User[]>;
  getPatientDoctors(patientId: string): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({...userData})
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }
  
  // Appointment operations
  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db
      .insert(appointments)
      .values(appointmentData)
      .returning();
    return appointment;
  }
  
  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id));
    return appointment;
  }
  
  async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.patientId, patientId))
      .orderBy(appointments.appointmentDate, appointments.appointmentTime);
  }
  
  async getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.doctorId, doctorId))
      .orderBy(appointments.appointmentDate, appointments.appointmentTime);
  }
  
  async getUpcomingAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    const today = new Date();
    return await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.patientId, patientId),
          or(
            gt(appointments.appointmentDate, today),
            and(
              eq(appointments.appointmentDate, today),
              gte(appointments.appointmentTime, today)
            )
          )
        )
      )
      .orderBy(appointments.appointmentDate, appointments.appointmentTime);
  }
  
  async getUpcomingAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
    const today = new Date();
    return await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, doctorId),
          or(
            gt(appointments.appointmentDate, today),
            and(
              eq(appointments.appointmentDate, today),
              gte(appointments.appointmentTime, today)
            )
          )
        )
      )
      .orderBy(appointments.appointmentDate, appointments.appointmentTime);
  }
  
  async updateAppointment(id: number, data: Partial<InsertAppointment>): Promise<Appointment> {
    const [appointment] = await db
      .update(appointments)
      .set({...data, updatedAt: new Date()})
      .where(eq(appointments.id, id))
      .returning();
    return appointment;
  }
  
  async deleteAppointment(id: number): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
  }
  
  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(messageData)
      .returning();
    return message;
  }
  
  async getMessagesByUser(userId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      )
      .orderBy(messages.sentAt);
  }
  
  async getConversation(user1Id: string, user2Id: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(
            eq(messages.senderId, user1Id),
            eq(messages.receiverId, user2Id)
          ),
          and(
            eq(messages.senderId, user2Id),
            eq(messages.receiverId, user1Id)
          )
        )
      )
      .orderBy(messages.sentAt);
  }
  
  async markMessageAsRead(id: number): Promise<void> {
    await db
      .update(messages)
      .set({ read: true })
      .where(eq(messages.id, id));
  }
  
  // Prescription operations
  async createPrescription(prescriptionData: InsertPrescription): Promise<Prescription> {
    const [prescription] = await db
      .insert(prescriptions)
      .values(prescriptionData)
      .returning();
    return prescription;
  }
  
  async getPrescriptionsByPatient(patientId: string): Promise<Prescription[]> {
    return await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.patientId, patientId))
      .orderBy(prescriptions.issuedAt);
  }
  
  async getPrescriptionsByDoctor(doctorId: string): Promise<Prescription[]> {
    return await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.doctorId, doctorId))
      .orderBy(prescriptions.issuedAt);
  }
  
  async getActivePrescriptionsByPatient(patientId: string): Promise<Prescription[]> {
    return await db
      .select()
      .from(prescriptions)
      .where(
        and(
          eq(prescriptions.patientId, patientId),
          eq(prescriptions.status, "active")
        )
      )
      .orderBy(prescriptions.issuedAt);
  }
  
  // Medical record operations
  async createMedicalRecord(recordData: InsertMedicalRecord): Promise<MedicalRecord> {
    const [record] = await db
      .insert(medicalRecords)
      .values(recordData)
      .returning();
    return record;
  }
  
  async getMedicalRecordsByPatient(patientId: string): Promise<MedicalRecord[]> {
    return await db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.patientId, patientId))
      .orderBy(medicalRecords.date);
  }
  
  // File operations
  async saveFile(fileData: InsertFile): Promise<File> {
    const [file] = await db
      .insert(files)
      .values(fileData)
      .returning();
    return file;
  }
  
  async getFilesByOwner(ownerId: string): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(eq(files.ownerId, ownerId))
      .orderBy(files.uploadedAt);
  }
  
  async getFilesByRelation(relatedToId: number, relatedToType: string): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.relatedToId, relatedToId),
          eq(files.relatedToType, relatedToType)
        )
      )
      .orderBy(files.uploadedAt);
  }
  
  // Doctor-Patient operations
  async assignPatientToDoctor(doctorId: string, patientId: string): Promise<void> {
    await db
      .insert(doctorPatients)
      .values({
        doctorId,
        patientId,
      })
      .onConflictDoNothing();
  }
  
  async getDoctorPatients(doctorId: string): Promise<User[]> {
    const result = await db
      .select({
        patient: users,
      })
      .from(doctorPatients)
      .innerJoin(users, eq(doctorPatients.patientId, users.id))
      .where(eq(doctorPatients.doctorId, doctorId));
    
    return result.map(r => r.patient);
  }
  
  async getPatientDoctors(patientId: string): Promise<User[]> {
    const result = await db
      .select({
        doctor: users,
      })
      .from(doctorPatients)
      .innerJoin(users, eq(doctorPatients.doctorId, users.id))
      .where(eq(doctorPatients.patientId, patientId));
    
    return result.map(r => r.doctor);
  }
}

export const storage = new DatabaseStorage();
