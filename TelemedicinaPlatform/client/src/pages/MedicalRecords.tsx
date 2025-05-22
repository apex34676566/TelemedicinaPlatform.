import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDate, uploadFile } from "@/lib/utils";
import { 
  Filter, 
  Search, 
  Loader2, 
  FileUp, 
  FilePlus, 
  Stethoscope, 
  ClipboardList,
  Download,
  FileText,
  Plus
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFullName, getInitials } from "@/lib/utils";

// Filter types
type RecordType = "all" | "diagnosis" | "test" | "note";

// Medical record form schema
const medicalRecordFormSchema = z.object({
  patientId: z.string().min(1, { message: "Selecciona un paciente" }),
  recordType: z.string().min(1, { message: "Selecciona un tipo de registro" }),
  title: z.string().min(3, { message: "Ingresa un título para el registro" }),
  description: z.string().min(5, { message: "Ingresa una descripción detallada" }),
});

type MedicalRecordFormValues = z.infer<typeof medicalRecordFormSchema>;

// File upload form schema
const fileUploadFormSchema = z.object({
  relatedToType: z.string().optional(),
  relatedToId: z.string().optional(),
  file: z.any().refine((file) => file?.length > 0, { message: "Selecciona un archivo" }),
});

type FileUploadFormValues = z.infer<typeof fileUploadFormSchema>;

const MedicalRecords = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recordType, setRecordType] = useState<RecordType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("records");
  
  const isDoctor = user?.role === "doctor";
  
  // Fetch medical records
  const { data: medicalRecords, isLoading: isLoadingRecords } = useQuery({
    queryKey: ["/api/medical-records"],
  });
  
  // Fetch files
  const { data: files, isLoading: isLoadingFiles } = useQuery({
    queryKey: ["/api/files"],
  });
  
  // Fetch patients (for doctors only)
  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ["/api/patients"],
    enabled: isDoctor,
  });
  
  // Form for creating medical records (doctors only)
  const recordForm = useForm<MedicalRecordFormValues>({
    resolver: zodResolver(medicalRecordFormSchema),
    defaultValues: {
      patientId: "",
      recordType: "",
      title: "",
      description: "",
    },
  });
  
  // Form for uploading files
  const fileForm = useForm<FileUploadFormValues>({
    resolver: zodResolver(fileUploadFormSchema),
    defaultValues: {
      relatedToType: "medical-record",
      relatedToId: "",
      file: undefined,
    },
  });
  
  // Create medical record mutation
  const createRecordMutation = useMutation({
    mutationFn: async (data: MedicalRecordFormValues) => {
      return await apiRequest("POST", "/api/medical-records", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical-records"] });
      setIsRecordFormOpen(false);
      recordForm.reset();
      toast({
        title: "Registro médico creado",
        description: "El registro ha sido creado exitosamente.",
      });
    },
  });
  
  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (data: FileUploadFormValues) => {
      const fileList = data.file as FileList;
      const file = fileList[0];
      
      const relatedToId = data.relatedToId ? parseInt(data.relatedToId) : undefined;
      
      return await uploadFile(file, relatedToId, data.relatedToType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      setIsFileUploadOpen(false);
      fileForm.reset();
      toast({
        title: "Archivo subido",
        description: "El archivo ha sido subido exitosamente.",
      });
    },
  });
  
  const onSubmitRecord = (data: MedicalRecordFormValues) => {
    createRecordMutation.mutate(data);
  };
  
  const onSubmitFile = (data: FileUploadFormValues) => {
    uploadFileMutation.mutate(data);
  };
  
  // Filter medical records
  const filteredRecords = medicalRecords?.filter((record: any) => {
    // Apply type filter
    if (recordType !== "all" && record.recordType !== recordType) {
      return false;
    }
    
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const title = record.title.toLowerCase();
      const description = record.description.toLowerCase();
      const doctorName = record.doctorName?.toLowerCase() || "";
      const patientName = record.patientName?.toLowerCase() || "";
      
      return (
        title.includes(searchLower) ||
        description.includes(searchLower) ||
        doctorName.includes(searchLower) ||
        patientName.includes(searchLower)
      );
    }
    
    return true;
  });
  
  // Filter files
  const filteredFiles = files?.filter((file: any) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const filename = file.originalName.toLowerCase();
      
      return filename.includes(searchLower);
    }
    
    return true;
  });
  
  // Get record type badge color
  const getRecordTypeBadge = (type: string) => {
    switch (type) {
      case "diagnosis":
        return "bg-purple-100 text-purple-800";
      case "test":
        return "bg-blue-100 text-blue-800";
      case "note":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };
  
  // Record type options for dropdown
  const recordTypeOptions = [
    { value: "diagnosis", label: "Diagnóstico" },
    { value: "test", label: "Resultado de prueba" },
    { value: "note", label: "Nota médica" },
  ];
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-800 mb-1">Historial médico</h1>
            <p className="text-neutral-600">
              {isDoctor 
                ? "Gestiona los registros médicos de tus pacientes" 
                : "Consulta tu historial médico y documentos"}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Dialog open={isFileUploadOpen} onOpenChange={setIsFileUploadOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileUp className="mr-2 h-4 w-4" />
                  Subir archivo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Subir documento</DialogTitle>
                  <DialogDescription>
                    Sube documentos médicos o resultados de exámenes.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...fileForm}>
                  <form onSubmit={fileForm.handleSubmit(onSubmitFile)} className="space-y-4">
                    <FormField
                      control={fileForm.control}
                      name="file"
                      render={({ field: { onChange, value, ...rest } }) => (
                        <FormItem>
                          <FormLabel>Archivo</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              onChange={(e) => onChange(e.target.files)}
                              {...rest}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={fileForm.control}
                      name="relatedToType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de documento</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="medical-record">Registro médico</SelectItem>
                              <SelectItem value="test-result">Resultado de examen</SelectItem>
                              <SelectItem value="prescription">Receta</SelectItem>
                              <SelectItem value="other">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {isDoctor && (
                      <FormField
                        control={fileForm.control}
                        name="relatedToId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Paciente relacionado</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar paciente (opcional)" />
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
                    )}
                    
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsFileUploadOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={uploadFileMutation.isPending}
                      >
                        {uploadFileMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Subir
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            {isDoctor && (
              <Dialog open={isRecordFormOpen} onOpenChange={setIsRecordFormOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <FilePlus className="mr-2 h-4 w-4" />
                    Nuevo registro
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Crear registro médico</DialogTitle>
                    <DialogDescription>
                      Añade un nuevo registro al historial médico del paciente.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...recordForm}>
                    <form onSubmit={recordForm.handleSubmit(onSubmitRecord)} className="space-y-4">
                      <FormField
                        control={recordForm.control}
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
                        control={recordForm.control}
                        name="recordType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de registro</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {recordTypeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={recordForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título</FormLabel>
                            <FormControl>
                              <Input placeholder="Título del registro" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={recordForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Descripción detallada del registro" 
                                {...field} 
                                rows={4}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsRecordFormOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createRecordMutation.isPending}
                        >
                          {createRecordMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Guardar
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        
        {/* Tabs for Records and Files */}
        <Tabs defaultValue="records" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="records">Registros médicos</TabsTrigger>
            <TabsTrigger value="files">Documentos</TabsTrigger>
          </TabsList>
          
          {/* Records Tab Content */}
          <TabsContent value="records">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-lg shadow mb-6">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Buscar registros..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex-shrink-0">
                  <Select
                    value={recordType}
                    onValueChange={(value) => setRecordType(value as RecordType)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      <SelectItem value="diagnosis">Diagnósticos</SelectItem>
                      <SelectItem value="test">Resultados de pruebas</SelectItem>
                      <SelectItem value="note">Notas médicas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Medical Records List */}
            <div className="space-y-4">
              {isLoadingRecords ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
                </div>
              ) : filteredRecords?.length > 0 ? (
                filteredRecords.map((record: any) => (
                  <Card key={record.id} className="overflow-hidden">
                    <CardHeader className="bg-neutral-50 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{record.title}</CardTitle>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRecordTypeBadge(record.recordType)}`}>
                          {recordTypeOptions.find(o => o.value === record.recordType)?.label || record.recordType}
                        </span>
                      </div>
                      <CardDescription className="flex items-center mt-1">
                        {isDoctor ? (
                          <span>Paciente: {record.patientName || "Paciente"}</span>
                        ) : (
                          <span>Doctor: {record.doctorName || "Doctor"}</span>
                        )}
                        <span className="mx-2">•</span>
                        <span>{formatDate(record.date)}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-neutral-700">{record.description}</p>
                    </CardContent>
                    <CardFooter className="bg-neutral-50 border-t">
                      <div className="flex justify-between w-full">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={record.doctorProfileImageUrl} />
                            <AvatarFallback>{getInitials(record.doctorFirstName, record.doctorLastName)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-neutral-500">
                            Creado por {record.doctorName || "Doctor"}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-1" /> Descargar
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <ClipboardList className="mx-auto h-12 w-12 text-neutral-300" />
                    <h3 className="mt-2 text-lg font-medium text-neutral-900">No hay registros médicos</h3>
                    <p className="mt-1 text-neutral-500">
                      {searchTerm
                        ? "No se encontraron registros con ese término de búsqueda."
                        : isDoctor
                        ? "No has creado registros médicos para tus pacientes."
                        : "No tienes registros médicos en tu historial."}
                    </p>
                    {isDoctor && (
                      <Button className="mt-6" onClick={() => setIsRecordFormOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Crear nuevo registro
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          {/* Files Tab Content */}
          <TabsContent value="files">
            {/* Filters for files */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-lg shadow mb-6">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Buscar archivos..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={() => setIsFileUploadOpen(true)}>
                <FileUp className="mr-2 h-4 w-4" />
                Subir archivo
              </Button>
            </div>
            
            {/* Files List */}
            <div className="space-y-4">
              {isLoadingFiles ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
                </div>
              ) : filteredFiles?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFiles.map((file: any) => (
                    <Card key={file.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 truncate">
                            <CardTitle className="text-base truncate">{file.originalName}</CardTitle>
                            <CardDescription className="mt-1">
                              Subido el {formatDate(file.uploadedAt)}
                            </CardDescription>
                          </div>
                          <FileText className="h-10 w-10 text-neutral-300 flex-shrink-0 ml-2" />
                        </div>
                      </CardHeader>
                      <CardFooter className="bg-neutral-50 border-t">
                        <div className="flex justify-between w-full">
                          <div className="text-sm text-neutral-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 mr-1" /> Descargar
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <FileText className="mx-auto h-12 w-12 text-neutral-300" />
                    <h3 className="mt-2 text-lg font-medium text-neutral-900">No hay archivos</h3>
                    <p className="mt-1 text-neutral-500">
                      {searchTerm
                        ? "No se encontraron archivos con ese término de búsqueda."
                        : "No hay archivos en tu historial médico."}
                    </p>
                    <Button className="mt-6" onClick={() => setIsFileUploadOpen(true)}>
                      <FileUp className="mr-2 h-4 w-4" />
                      Subir nuevo archivo
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MedicalRecords;
