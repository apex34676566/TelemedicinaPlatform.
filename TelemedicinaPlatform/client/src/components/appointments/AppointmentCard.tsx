import { formatDate, formatTime, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock } from "lucide-react";

interface AppointmentCardProps {
  appointment: any;
  onJoin: () => void;
}

const AppointmentCard = ({ appointment, onJoin }: AppointmentCardProps) => {
  const isToday = () => {
    const today = new Date();
    const appointmentDate = new Date(appointment.appointmentDate);
    return today.toDateString() === appointmentDate.toDateString();
  };
  
  const canJoin = isToday() && appointment.status === "scheduled";
  
  // Display doctor or patient details based on the user's role
  const displayName = appointment.doctorName || appointment.patientName || "Consulta médica";
  const specialty = appointment.specialty || "Medicina general";
  
  return (
    <li>
      <div className="px-6 py-4">
        <div className="flex items-center">
          <div className="min-w-0 flex-1 flex">
            <Avatar className="mr-4">
              <AvatarImage src={appointment.profileImageUrl} />
              <AvatarFallback>{getInitials(appointment.firstName, appointment.lastName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-neutral-900 truncate">
                {appointment.type === "video" ? "Videoconsulta" : "Consulta presencial"}
              </p>
              <p className="text-sm text-neutral-500">
                <span className="font-medium text-neutral-700">{displayName}</span> •{" "}
                {specialty}
              </p>
              <div className="mt-2 flex">
                <div className="flex items-center text-sm text-neutral-500 mr-4">
                  <Calendar className="text-neutral-400 h-4 w-4 mr-1" />
                  {formatDate(appointment.appointmentDate)}
                </div>
                <div className="flex items-center text-sm text-neutral-500">
                  <Clock className="text-neutral-400 h-4 w-4 mr-1" />
                  {formatTime(appointment.appointmentTime)}
                </div>
              </div>
            </div>
          </div>
          <div className="ml-5 flex-shrink-0">
            {canJoin ? (
              <Button 
                size="sm" 
                onClick={onJoin}
                className="rounded-full"
              >
                Unirse
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                className="rounded-full border-neutral-300 text-neutral-700"
              >
                Detalles
              </Button>
            )}
          </div>
        </div>
      </div>
    </li>
  );
};

export default AppointmentCard;
