import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Activity, 
  FileText, 
  FlaskRound, 
  Calendar, 
  Stethoscope,
  Loader2 
} from "lucide-react";

const ActivityTimeline = () => {
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["/api/appointments"],
  });
  
  const { data: prescriptions, isLoading: isLoadingPrescriptions } = useQuery({
    queryKey: ["/api/prescriptions"],
  });
  
  const { data: medicalRecords, isLoading: isLoadingRecords } = useQuery({
    queryKey: ["/api/medical-records"],
  });
  
  const isLoading = isLoadingAppointments || isLoadingPrescriptions || isLoadingRecords;
  
  // Create a combined timeline of events
  const createTimelineEvents = () => {
    const events = [];
    
    // Add appointments to events
    if (appointments) {
      appointments.forEach((appointment: any) => {
        events.push({
          type: "appointment",
          title: `Cita ${appointment.status === "completed" ? "completada" : "agendada"} con ${appointment.doctorName || "médico"}`,
          description: appointment.reason || "Consulta médica",
          date: new Date(appointment.appointmentDate),
          icon: <Calendar className="h-8 w-8 text-primary-600" />,
          bgColor: "bg-primary-100",
        });
      });
    }
    
    // Add prescriptions to events
    if (prescriptions) {
      prescriptions.forEach((prescription: any) => {
        events.push({
          type: "prescription",
          title: "Receta emitida",
          description: `${prescription.medicationName} - ${prescription.dosage} ${prescription.frequency}`,
          date: new Date(prescription.issuedAt),
          icon: <FileText className="h-8 w-8 text-green-600" />,
          bgColor: "bg-green-100",
        });
      });
    }
    
    // Add medical records to events
    if (medicalRecords) {
      medicalRecords.forEach((record: any) => {
        let icon = <Activity className="h-8 w-8 text-blue-600" />;
        let bgColor = "bg-blue-100";
        
        if (record.recordType === "test") {
          icon = <FlaskRound className="h-8 w-8 text-blue-600" />;
        } else if (record.recordType === "diagnosis") {
          icon = <Stethoscope className="h-8 w-8 text-purple-600" />;
          bgColor = "bg-purple-100";
        }
        
        events.push({
          type: "record",
          title: record.title,
          description: record.description,
          date: new Date(record.date),
          icon,
          bgColor,
        });
      });
    }
    
    // Sort events by date, newest first
    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  };
  
  const timelineEvents = createTimelineEvents();
  
  return (
    <Card>
      <CardHeader className="px-6 py-5 border-b border-neutral-200">
        <CardTitle className="text-lg font-medium text-neutral-800">Actividad reciente</CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-4">
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          </div>
        ) : timelineEvents.length > 0 ? (
          <div className="flow-root">
            <ul className="-mb-8">
              {timelineEvents.slice(0, 4).map((event, index) => (
                <li key={index}>
                  <div className="relative pb-8">
                    {index < timelineEvents.length - 1 && (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-neutral-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full ${event.bgColor} flex items-center justify-center ring-8 ring-white`}>
                          {event.icon}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-neutral-800">{event.title}</p>
                          <p className="mt-1 text-xs text-neutral-500">{event.description}</p>
                        </div>
                        <div className="text-right text-xs whitespace-nowrap text-neutral-500">
                          <time>{formatDate(event.date)}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-center text-neutral-500 py-8">No hay actividad reciente</p>
        )}
      </CardContent>
      <CardFooter className="px-6 py-4 border-t border-neutral-200 bg-neutral-50">
        <Link href="/medical-records">
          <a className="w-full flex justify-center items-center px-4 py-2 text-sm text-primary-600 font-medium">
            Ver todo el historial de actividad
          </a>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ActivityTimeline;
