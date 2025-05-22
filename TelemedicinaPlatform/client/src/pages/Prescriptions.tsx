import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import { 
  FilePlus, 
  Filter, 
  Loader2, 
  Search,
  FileText,
  Download
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import PrescriptionCard from "@/components/prescriptions/PrescriptionCard";

// Filter types
type FilterStatus = "all" | "active" | "expired";

// Prescription form schema
const prescriptionFormSchema = z.object({
  patientId: z.string().min(1, { message: "Selecciona un paciente" }),
  medicationName: z.string().min(3, { message: "Ingresa el nombre del medicamento" }),
  dosage: z.string().min(1, { message: "Ingresa la dosificación" }),
  frequency: z.string().min(1, { message: "Ingresa la frecuencia" }),
  duration: z.string().min(1, { message: "Ingresa la duración" }),
  instructions: z.string().optional(),
  expiresAt: z.string().optional(),
});

type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>;

const Prescriptions = () => {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const isDoctor = user?.role === "doctor";
  
  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ["/api/prescriptions"],
  });
  
  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ["/api/patients"],
    enabled: isDoctor,
  });
  
  // Form for creating prescriptions (doctors only)
  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: {
      patientId: "",
      medicationName: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
      expiresAt: "",
    },
  });
  
  const createPrescriptionMutation = useMutation({
    mutationFn: async (data: PrescriptionFormValues) => {
      return await apiRequest("POST", "/api/prescriptions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      setIsFormOpen(false);
      form.reset();
    },
  });
  
  const onSubmit = (data: PrescriptionFormValues) => {
    createPrescriptionMutation.mutate(data);
  };
  
  // Filter prescriptions
  const filteredPrescriptions = prescriptions?.filter((prescription: any) => {
    // Apply status filter
    if (filterStatus === "active" && prescription.status !== "active") {
      return false;
    }
    if (filterStatus === "expired" && prescription.status !== "expired") {
      return false;
    }
    
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const medicationName = prescription.medicationName.toLowerCase();
      const doctorName = prescription.doctorName?.toLowerCase() || "";
      const patientName = prescription.patientName?.toLowerCase() || "";
      
      return (
        medicationName.includes(searchLower) ||
        doctorName.includes(searchLower) ||
        patientName.includes(searchLower)
      );
    }
    
    return true;
  });
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-800 mb-1">Recetas médicas</h1>
            <p className="text-neutral-600">
              {isDoctor 
                ? "Gestiona las recetas de tus pacientes" 
                : "Consulta las recetas emitidas por tus médicos"}
            </p>
          </div>
          {isDoctor && (
            <div className="mt-4 md:mt-0">
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <FilePlus className="mr-2 h-4 w-4" />
                    Nueva receta
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Crear nueva receta</DialogTitle>
                    <DialogDescription>
                      Completa el formulario para emitir una nueva receta médica.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="patientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Paciente</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar paciente" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {isLoadingPatients ? (
                                  <div className="flex items-center justify-center p-2">
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Cargando...
                                  </div>
                                ) : patients?.length > 0 ? (
                                  patients.map((patient: any) => (
                                    <SelectItem key={patient.id} value={patient.id}>
                                      {patient.firstName && patient.lastName 
                                        ? `${patient.firstName} ${patient.lastName}` 
                                        : patient.email}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="p-2 text-neutral-500 text-center">
                                    No hay pacientes disponibles
                                  </div>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="medicationName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medicamento</FormLabel>
                            <FormControl>
                              <Input placeholder="Nombre del medicamento" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="dosage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dosificación</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: 500mg" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="frequency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frecuencia</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: Cada 8 horas" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duración</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: 7 días" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="instructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instrucciones adicionales</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Instrucciones específicas para el paciente" 
                                {...field} 
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="expiresAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de expiración</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsFormOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createPrescriptionMutation.isPending}
                        >
                          {createPrescriptionMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Emitir receta
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Buscar recetas..."
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
                  <SelectItem value="active">Activas</SelectItem>
                  <SelectItem value="expired">Expiradas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Prescriptions list */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
            </div>
          ) : filteredPrescriptions?.length > 0 ? (
            filteredPrescriptions.map((prescription: any) => (
              <PrescriptionCard 
                key={prescription.id} 
                prescription={prescription} 
                isDoctor={isDoctor}
              />
            ))
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="mx-auto h-12 w-12 text-neutral-300" />
                <h3 className="mt-2 text-lg font-medium text-neutral-900">No hay recetas</h3>
                <p className="mt-1 text-neutral-500">
                  {searchTerm
                    ? "No se encontraron recetas con ese término de búsqueda."
                    : isDoctor
                    ? "No has emitido recetas para tus pacientes."
                    : "No tienes recetas activas en este momento."}
                </p>
                {isDoctor && (
                  <Button className="mt-6" onClick={() => setIsFormOpen(true)}>
                    <FilePlus className="mr-2 h-4 w-4" />
                    Crear nueva receta
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Prescriptions;
