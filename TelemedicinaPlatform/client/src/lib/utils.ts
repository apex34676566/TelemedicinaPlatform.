import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { apiRequest } from "./queryClient";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "dd MMM yyyy");
}

export function formatTime(time: string): string {
  // Convert "HH:MM:SS" to "HH:MM AM/PM"
  const [hours, minutes] = time.split(":");
  const hoursNum = parseInt(hours, 10);
  const period = hoursNum >= 12 ? "PM" : "AM";
  const formattedHours = hoursNum % 12 || 12;
  return `${formattedHours}:${minutes} ${period}`;
}

export function getInitials(firstName?: string, lastName?: string): string {
  if (!firstName && !lastName) return "U";
  
  const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : "";
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "";
  
  return `${firstInitial}${lastInitial}` || "U";
}

export function getFullName(firstName?: string, lastName?: string): string {
  if (!firstName && !lastName) return "Usuario";
  
  return `${firstName || ""} ${lastName || ""}`.trim();
}

export const specialties = [
  { value: "cardiology", label: "Cardiología" },
  { value: "dermatology", label: "Dermatología" },
  { value: "endocrinology", label: "Endocrinología" },
  { value: "gastroenterology", label: "Gastroenterología" },
  { value: "general", label: "Medicina General" },
  { value: "neurology", label: "Neurología" },
  { value: "orthopedics", label: "Ortopedia" },
  { value: "pediatrics", label: "Pediatría" },
  { value: "psychiatry", label: "Psiquiatría" },
];

export const appointmentTypes = [
  { value: "video", label: "Videoconsulta" },
  { value: "in-person", label: "Consulta presencial" },
];

export const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 17; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

export async function downloadFile(fileId: number, originalName: string) {
  try {
    const response = await fetch(`/api/files/${fileId}`);
    if (!response.ok) throw new Error('Failed to download file');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = originalName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}

export async function uploadFile(
  file: File, 
  relatedToId?: number, 
  relatedToType?: string
) {
  const formData = new FormData();
  formData.append('file', file);
  
  if (relatedToId) {
    formData.append('relatedToId', relatedToId.toString());
  }
  
  if (relatedToType) {
    formData.append('relatedToType', relatedToType);
  }
  
  try {
    const response = await fetch('/api/files/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('File upload failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}
