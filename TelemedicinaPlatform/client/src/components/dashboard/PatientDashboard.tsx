import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { getFullName } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import UpcomingAppointments from "@/components/appointments/UpcomingAppointments";
import MedicalRecordsSummary from "@/components/medical/MedicalRecordsSummary";
import ActivityTimeline from "@/components/medical/ActivityTimeline";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  MessageSquare, 
  FileText, 
  FlaskRound, 
  Loader2 
} from "lucide-react";

const PatientDashboard = () => {
  const { user } = useAuth();
  
  const { data: upcomingAppointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["/api/appointments/upcoming"],
  });
  
  const { data: prescriptions, isLoading: isLoadingPrescriptions } = useQuery({
    queryKey: ["/api/prescriptions/active"],
  });
  
  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["/api/messages"],
  });
  
  const hasUnreadMessages = messages?.some((msg: any) => !msg.read && msg.receiverId === user?.id);
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-800 mb-2">
            Bienvenido, {getFullName(user?.firstName, user?.lastName)}
          </h1>
          {!isLoadingAppointments && upcomingAppointments && upcomingAppointments.length > 0 && (
            <p className="text-neutral-600">
              Tu próxima cita es dentro de{" "}
              <span className="text-primary-600 font-medium">
                {/* Calculate days until the next appointment */}
                {Math.ceil(
                  (new Date(upcomingAppointments[0].appointmentDate).getTime() - new Date().getTime()) / 
                  (1000 * 60 * 60 * 24)
                )}{" "}
                días
              </span> con el{" "}
              <span className="font-medium text-neutral-700">
                {upcomingAppointments[0].doctorName || "médico"}
              </span>
            </p>
          )}
        </div>
        
        {/* Quick Actions and Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* New Appointment Card */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                  <Calendar className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-500 truncate">Agendar cita</dt>
                    <dd>
                      <div className="text-lg font-semibold text-neutral-900">Consulta médica</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
            <div className="bg-neutral-50 px-5 py-3">
              <div className="text-sm">
                <Link href="/appointments">
                  <a className="font-medium text-primary-600 hover:text-primary-500">
                    Solicitar &rarr;
                  </a>
                </Link>
              </div>
            </div>
          </Card>
          
          {/* Messages Card */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-secondary-100 rounded-md p-3">
                  <MessageSquare className="h-6 w-6 text-secondary-600" />
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
          
          {/* Prescriptions Card */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-500 truncate">Recetas activas</dt>
                    <dd>
                      {isLoadingPrescriptions ? (
                        <div className="flex items-center mt-1">
                          <Loader2 className="h-5 w-5 text-neutral-400 animate-spin mr-2" />
                          <span className="text-neutral-500">Cargando...</span>
                        </div>
                      ) : (
                        <div className="text-lg font-semibold text-neutral-900">
                          {prescriptions?.length || 0} recetas
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
            <div className="bg-neutral-50 px-5 py-3">
              <div className="text-sm">
                <Link href="/prescriptions">
                  <a className="font-medium text-primary-600 hover:text-primary-500">
                    Ver detalles &rarr;
                  </a>
                </Link>
              </div>
            </div>
          </Card>
          
          {/* Lab Results Card */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                  <FlaskRound className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-500 truncate">Resultados de laboratorio</dt>
                    <dd>
                      <div className="text-lg font-semibold text-neutral-900">Ver resultados</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
            <div className="bg-neutral-50 px-5 py-3">
              <div className="text-sm">
                <Link href="/medical-records">
                  <a className="font-medium text-primary-600 hover:text-primary-500">
                    Revisar &rarr;
                  </a>
                </Link>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Upcoming Appointments and Records */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <UpcomingAppointments />
          <MedicalRecordsSummary />
        </div>
        
        {/* Recent Activity */}
        <div className="mt-8">
          <ActivityTimeline />
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
