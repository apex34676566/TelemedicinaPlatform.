import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDate, formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import AppointmentCard from "./AppointmentCard";
import AppointmentForm from "./AppointmentForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Calendar, Loader2 } from "lucide-react";

const UpcomingAppointments = () => {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const { data: appointments, isLoading } = useQuery({
    queryKey: ["/api/appointments/upcoming"],
  });
  
  const joinAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      return await apiRequest("PATCH", `/api/appointments/${appointmentId}`, {
        status: "in-progress",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/upcoming"] });
    },
  });
  
  const handleJoinAppointment = (appointmentId: number) => {
    joinAppointmentMutation.mutate(appointmentId);
    // In a real app, this would open the video call interface
  };
  
  const openAppointmentForm = () => {
    setIsFormOpen(true);
  };
  
  const closeAppointmentForm = () => {
    setIsFormOpen(false);
  };
  
  const handleAppointmentCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/appointments/upcoming"] });
    setIsFormOpen(false);
  };
  
  const renderAppointments = () => {
    if (isLoading) {
      return (
        <div className="py-8 flex justify-center">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
        </div>
      );
    }
    
    if (!appointments || appointments.length === 0) {
      return (
        <div className="py-8 text-center">
          <p className="text-neutral-500">No tienes citas programadas próximamente.</p>
        </div>
      );
    }
    
    return (
      <ul className="divide-y divide-neutral-200">
        {appointments.map((appointment: any) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onJoin={() => handleJoinAppointment(appointment.id)}
          />
        ))}
      </ul>
    );
  };
  
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-5 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-neutral-800">Próximas citas</h2>
          <Link href="/appointments">
            <a className="text-sm font-medium text-primary-600 hover:text-primary-500">
              Ver todas
            </a>
          </Link>
        </div>
      </div>
      
      {renderAppointments()}
      
      <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 rounded-b-lg">
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full flex justify-center items-center">
              <Plus className="h-4 w-4 mr-2" />
              Programar nueva cita
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Agendar nueva cita</DialogTitle>
              <DialogDescription>
                Completa el formulario para solicitar una cita con un médico.
              </DialogDescription>
            </DialogHeader>
            <AppointmentForm 
              userId={user?.id || ""} 
              role={user?.role || "patient"} 
              onSuccess={handleAppointmentCreated} 
              onCancel={closeAppointmentForm} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UpcomingAppointments;
