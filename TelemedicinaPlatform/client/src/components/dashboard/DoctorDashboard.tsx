import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { getFullName } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import UpcomingAppointments from "@/components/appointments/UpcomingAppointments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  UserPlus, 
  Users, 
  Calendar, 
  Clock, 
  MessageSquare, 
  FileText, 
  Loader2,
  BarChart4,
  PieChart
} from "lucide-react";

const DoctorDashboard = () => {
  const { user } = useAuth();
  
  const { data: upcomingAppointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["/api/appointments/upcoming"],
  });
  
  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ["/api/patients"],
  });
  
  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["/api/messages"],
  });
  
  const hasUnreadMessages = messages?.some((msg: any) => !msg.read && msg.receiverId === user?.id);
  
  const todayAppointments = upcomingAppointments?.filter((apt: any) => {
    const today = new Date();
    const aptDate = new Date(apt.appointmentDate);
    return aptDate.toDateString() === today.toDateString();
  });
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-800 mb-2">
            Bienvenido, {user?.firstName ? `Dr. ${user?.lastName || ''}` : 'Doctor'}
          </h1>
          <p className="text-neutral-600">
            Tienes{" "}
            <span className="text-primary-600 font-medium">
              {isLoadingAppointments ? "..." : todayAppointments?.length || 0} citas
            </span>{" "}
            programadas para hoy.
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Patients Card */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-500 truncate">Pacientes</dt>
                    <dd>
                      {isLoadingPatients ? (
                        <div className="flex items-center mt-1">
                          <Loader2 className="h-5 w-5 text-neutral-400 animate-spin mr-2" />
                          <span className="text-neutral-500">Cargando...</span>
                        </div>
                      ) : (
                        <div className="text-lg font-semibold text-neutral-900">
                          {patients?.length || 0} pacientes
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
            <div className="bg-neutral-50 px-5 py-3">
              <div className="text-sm">
                <Link href="/patients">
                  <a className="font-medium text-primary-600 hover:text-primary-500">
                    Ver todos &rarr;
                  </a>
                </Link>
              </div>
            </div>
          </Card>
          
          {/* Today's Appointments Card */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-500 truncate">Citas hoy</dt>
                    <dd>
                      {isLoadingAppointments ? (
                        <div className="flex items-center mt-1">
                          <Loader2 className="h-5 w-5 text-neutral-400 animate-spin mr-2" />
                          <span className="text-neutral-500">Cargando...</span>
                        </div>
                      ) : (
                        <div className="text-lg font-semibold text-neutral-900">
                          {todayAppointments?.length || 0} citas
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
            <div className="bg-neutral-50 px-5 py-3">
              <div className="text-sm">
                <Link href="/appointments">
                  <a className="font-medium text-primary-600 hover:text-primary-500">
                    Ver agenda &rarr;
                  </a>
                </Link>
              </div>
            </div>
          </Card>
          
          {/* Messages Card */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-500 truncate">Mensajes sin leer</dt>
                    <dd>
                      {isLoadingMessages ? (
                        <div className="flex items-center mt-1">
                          <Loader2 className="h-5 w-5 text-neutral-400 animate-spin mr-2" />
                          <span className="text-neutral-500">Cargando...</span>
                        </div>
                      ) : (
                        <div className="text-lg font-semibold text-neutral-900">
                          {hasUnreadMessages ? "Nuevos mensajes" : "0 nuevos"}
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
            <div className="bg-neutral-50 px-5 py-3">
              <div className="text-sm">
                <Link href="/messages">
                  <a className="font-medium text-primary-600 hover:text-primary-500">
                    Ver todos &rarr;
                  </a>
                </Link>
              </div>
            </div>
          </Card>
          
          {/* New Patient Card */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <UserPlus className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-500 truncate">Agregar paciente</dt>
                    <dd>
                      <div className="text-lg font-semibold text-neutral-900">Nuevo paciente</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
            <div className="bg-neutral-50 px-5 py-3">
              <div className="text-sm">
                <Button variant="link" className="font-medium text-primary-600 hover:text-primary-500 p-0">
                  Agregar &rarr;
                </Button>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Charts and Appointments */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de consultas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <div className="text-center text-neutral-500">
                  <BarChart4 className="h-16 w-16 mx-auto mb-4 text-neutral-300" />
                  <p>Estadísticas de consultas por categoría</p>
                  <Button variant="outline" className="mt-4">Ver detalles</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Distribución de pacientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <div className="text-center text-neutral-500">
                  <PieChart className="h-16 w-16 mx-auto mb-4 text-neutral-300" />
                  <p>Distribución por género y edad</p>
                  <Button variant="outline" className="mt-4">Ver detalles</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Upcoming Appointments */}
        <div className="mt-8">
          <UpcomingAppointments />
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
