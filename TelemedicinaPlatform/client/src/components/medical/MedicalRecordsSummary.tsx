import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

const MedicalRecordsSummary = () => {
  const { user } = useAuth();
  
  const { data: medicalRecords, isLoading } = useQuery({
    queryKey: ["/api/medical-records"],
  });
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="py-8 flex justify-center">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
        </div>
      );
    }
    
    // If no medical records data available, render sample UI structure without data
    return (
      <div className="px-6 py-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-neutral-900 mb-1">Información general</h3>
            <div className="bg-neutral-50 rounded-md p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-500">Nombre</p>
                  <p className="text-sm font-medium text-neutral-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Fecha de nacimiento</p>
                  <p className="text-sm font-medium text-neutral-900">
                    {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "No disponible"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Tipo de sangre</p>
                  <p className="text-sm font-medium text-neutral-900">
                    {user?.bloodType || "No disponible"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Alergias</p>
                  <p className="text-sm font-medium text-neutral-900">
                    {user?.allergies || "No registradas"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-neutral-900 mb-1">Diagnósticos activos</h3>
            <div className="bg-neutral-50 rounded-md p-4">
              {medicalRecords?.filter((record: any) => record.recordType === "diagnosis")
                .slice(0, 2)
                .map((diagnosis: any, index: number) => (
                  <div key={index} className="flex justify-between mb-2">
                    <span className="text-sm text-neutral-900">{diagnosis.title}</span>
                    <span className="text-xs text-neutral-500">
                      Desde: {new Date(diagnosis.date).toLocaleDateString()}
                    </span>
                  </div>
                )) || (
                <p className="text-sm text-neutral-500">No hay diagnósticos activos registrados</p>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-neutral-900 mb-1">Medicamentos activos</h3>
            <div className="bg-neutral-50 rounded-md p-4">
              {/* Display active medications from prescriptions */}
              <p className="text-sm text-neutral-500">
                Consulta la sección de recetas para ver los medicamentos activos
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-5 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-neutral-800">Expediente médico</h2>
          <Link href="/medical-records">
            <a className="text-sm font-medium text-primary-600 hover:text-primary-500">
              Historial completo
            </a>
          </Link>
        </div>
      </div>
      
      {renderContent()}
      
      <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 rounded-b-lg">
        <Button variant="secondary" className="w-full flex justify-center">
          <Download className="mr-2 h-4 w-4" />
          Descargar expediente completo
        </Button>
      </div>
    </div>
  );
};

export default MedicalRecordsSummary;
