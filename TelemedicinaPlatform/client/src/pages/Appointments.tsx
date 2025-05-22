import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDate, formatTime } from "@/lib/utils";
import { 
  Calendar, 
  Clock, 
  Filter, 
  List, 
  Grid, 
  Loader2, 
  Plus,
  Search
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AppointmentCard from "@/components/appointments/AppointmentCard";
import AppointmentForm from "@/components/appointments/AppointmentForm";
import VideoCall from "@/components/video/VideoCall";

type AppointmentView = "list" | "calendar";
type FilterStatus = "all" | "scheduled" | "completed" | "cancelled";

const Appointments = () => {
  const { user } = useAuth();
  const [view, setView] = useState<AppointmentView>("list");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  
  const { data: appointments, isLoading } = useQuery({
    queryKey: ["/api/appointments"],
  });
  
  const cancelAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      return await apiRequest("PATCH", `/api/appointments/${appointmentId}`, {
        status: "cancelled",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
  });
  
  const joinAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      return await apiRequest("PATCH", `/api/appointments/${appointmentId}`, {
        status: "in-progress",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
  });
  
  const handleCancelAppointment = (appointmentId: number) => {
    if (confirm("¿Estás seguro de que deseas cancelar esta cita?")) {
      cancelAppointmentMutation.mutate(appointmentId);
    }
  };
  
  const handleJoinAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    joinAppointmentMutation.mutate(appointment.id);
    setIsVideoCallOpen(true);
  };
  
  const closeVideoCall = () => {
    setIsVideoCallOpen(false);
    setSelectedAppointment(null);
  };
  
  const openAppointmentForm = () => {
    setIsFormOpen(true);
  };
  
  const closeAppointmentForm = () => {
    setIsFormOpen(false);
  };
  
  const handleAppointmentCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    setIsFormOpen(false);
  };
  
  const filteredAppointments = appointments?.filter((appointment: any) => {
    // Apply status filter
    if (filterStatus !== "all" && appointment.status !== filterStatus) {
      return false;
    }
    
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const doctorName = appointment.doctorName?.toLowerCase() || "";
      const patientName = appointment.patientName?.toLowerCase() || "";
      const reason = appointment.reason?.toLowerCase() || "";
      const specialty = appointment.specialty?.toLowerCase() || "";
      
      return (
        doctorName.includes(searchLower) ||
        patientName.includes(searchLower) ||
        reason.includes(searchLower) ||
        specialty.includes(searchLower)
      );
    }
    
    return true;
  });
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-800 mb-1">Citas médicas</h1>
            <p className="text-neutral-600">Gestiona tus consultas médicas y videollamadas</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAppointmentForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva cita
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
        
        {/* Filters and view toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Buscar citas..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-shrink-0">
              <Select
                value={filterStatus}
                onValueChange={(value) => setFilterStatus(value as FilterStatus)}
              >
                <SelectTrigger className="w-[130px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="scheduled">Programadas</SelectItem>
                  <SelectItem value="completed">Completadas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "calendar" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("calendar")}
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Appointments list/calendar view */}
        <Card>
          <CardHeader>
            <CardTitle>
              {view === "list" ? "Lista de citas" : "Calendario de citas"}
            </CardTitle>
            <CardDescription>
              {isLoading ? "Cargando citas..." : `${filteredAppointments?.length || 0} citas encontradas`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
              </div>
            ) : view === "list" ? (
              // List view
              filteredAppointments?.length > 0 ? (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment: any) => (
                    <div 
                      key={appointment.id} 
                      className="border border-neutral-200 rounded-lg overflow-hidden"
                    >
                      <AppointmentCard
                        appointment={appointment}
                        onJoin={() => handleJoinAppointment(appointment)}
                      />
                      <div className="flex justify-end px-4 py-2 bg-neutral-50 border-t border-neutral-200">
                        {appointment.status === "scheduled" && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mr-2"
                              onClick={() => handleCancelAppointment(appointment.id)}
                            >
                              Cancelar
                            </Button>
                            {appointment.type === "video" && new Date(appointment.appointmentDate) <= new Date() && (
                              <Button 
                                size="sm"
                                onClick={() => handleJoinAppointment(appointment)}
                              >
                                Iniciar videollamada
                              </Button>
                            )}
                          </>
                        )}
                        {appointment.status === "completed" && (
                          <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                            Completada
                          </span>
                        )}
                        {appointment.status === "cancelled" && (
                          <span className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                            Cancelada
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-neutral-300" />
                  <h3 className="mt-2 text-lg font-medium text-neutral-900">No hay citas</h3>
                  <p className="mt-1 text-neutral-500">
                    No se encontraron citas con los filtros aplicados.
                  </p>
                  <Button className="mt-6" onClick={openAppointmentForm}>
                    Agendar nueva cita
                  </Button>
                </div>
              )
            ) : (
              // Calendar view - Simple implementation
              <div className="flex flex-col items-center justify-center h-64">
                <Calendar className="h-16 w-16 text-neutral-300 mb-4" />
                <p className="text-neutral-500 mb-2">La vista de calendario estará disponible próximamente.</p>
                <Button variant="outline" onClick={() => setView("list")}>
                  Volver a vista de lista
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t border-neutral-200 p-4 bg-neutral-50">
            <div className="text-sm text-neutral-500">
              <Clock className="inline-block h-4 w-4 mr-1" />
              <span>
                {isLoading 
                  ? "Cargando..." 
                  : filteredAppointments?.length 
                    ? `Mostrando ${filteredAppointments.length} de ${appointments?.length} citas` 
                    : "No hay citas para mostrar"}
              </span>
            </div>
            <Button variant="link" onClick={openAppointmentForm}>
              <Plus className="h-4 w-4 mr-1" />
              Nueva cita
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Video call dialog */}
      <Dialog open={isVideoCallOpen} onOpenChange={setIsVideoCallOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedAppointment ? `Consulta con ${selectedAppointment.doctorName || selectedAppointment.patientName || ""}` : "Videollamada"}
            </DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <VideoCall appointment={selectedAppointment} onClose={closeVideoCall} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Appointments;
