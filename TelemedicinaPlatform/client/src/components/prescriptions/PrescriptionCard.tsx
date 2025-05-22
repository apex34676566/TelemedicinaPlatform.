import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { 
  Download, 
  ChevronDown, 
  ChevronUp, 
  FilePenLine, 
  Clock, 
  Calendar, 
  User
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface PrescriptionCardProps {
  prescription: any;
  isDoctor: boolean;
}

const PrescriptionCard = ({ prescription, isDoctor }: PrescriptionCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const isActive = prescription.status === "active";
  
  return (
    <Card className="overflow-hidden">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <CardContent className="p-0">
          <div className="flex items-start p-5">
            <div className={`flex-shrink-0 p-3 rounded-md ${isActive ? "bg-green-100" : "bg-neutral-100"}`}>
              <FilePenLine className={`h-6 w-6 ${isActive ? "text-green-600" : "text-neutral-500"}`} />
            </div>
            
            <div className="ml-4 flex-grow">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-neutral-900">{prescription.medicationName}</h3>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  isActive 
                    ? "bg-green-100 text-green-800" 
                    : "bg-neutral-100 text-neutral-600"
                }`}>
                  {isActive ? "Activa" : "Expirada"}
                </span>
              </div>
              
              <p className="text-neutral-600 mt-1">
                {prescription.dosage} - {prescription.frequency}
              </p>
              
              <div className="flex flex-wrap mt-2 gap-3">
                <div className="flex items-center text-sm text-neutral-500">
                  <Clock className="text-neutral-400 h-4 w-4 mr-1" />
                  {prescription.duration}
                </div>
                <div className="flex items-center text-sm text-neutral-500">
                  <Calendar className="text-neutral-400 h-4 w-4 mr-1" />
                  Emitida: {formatDate(prescription.issuedAt)}
                </div>
                {prescription.expiresAt && (
                  <div className="flex items-center text-sm text-neutral-500">
                    <Calendar className="text-neutral-400 h-4 w-4 mr-1" />
                    Expira: {formatDate(prescription.expiresAt)}
                  </div>
                )}
              </div>
            </div>
            
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-2 flex-shrink-0">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent>
            <div className="px-5 pb-5 pt-1 border-t border-neutral-100">
              <div className="bg-neutral-50 rounded-md p-4">
                <h4 className="font-medium text-neutral-900 mb-2">Instrucciones</h4>
                <p className="text-neutral-700">
                  {prescription.instructions || "No se proporcionaron instrucciones específicas."}
                </p>
                
                <div className="mt-4 flex items-center">
                  <User className="text-neutral-400 h-4 w-4 mr-1" />
                  <span className="text-sm text-neutral-500 mr-2">
                    {isDoctor ? "Paciente:" : "Doctor:"}
                  </span>
                  <span className="text-sm font-medium text-neutral-900">
                    {isDoctor ? prescription.patientName : prescription.doctorName}
                  </span>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
      
      <CardFooter className="bg-neutral-50 border-t p-4 flex justify-between">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={prescription.doctorProfileImageUrl} />
            <AvatarFallback>{getInitials(prescription.doctorFirstName, prescription.doctorLastName)}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-neutral-500">
            Recetado por {prescription.doctorName || "Dr."}
          </span>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" />
          Descargar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PrescriptionCard;
