import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { specialties, appointmentTypes, generateTimeSlots } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface AppointmentFormProps {
  userId: string;
  role: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const appointmentFormSchema = z.object({
  specialty: z.string().min(1, { message: "Selecciona una especialidad" }),
  doctorId: z.string().min(1, { message: "Selecciona un médico" }),
  type: z.string().min(1, { message: "Selecciona un tipo de consulta" }),
  appointmentDate: z.string().min(1, { message: "Selecciona una fecha" }),
  appointmentTime: z.string().min(1, { message: "Selecciona una hora" }),
  reason: z.string().min(5, { message: "Describe brevemente el motivo de tu consulta" }),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

const AppointmentForm = ({ userId, role, onSuccess, onCancel }: AppointmentFormProps) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  
  const { data: doctors, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ["/api/doctors"],
    enabled: selectedSpecialty !== "",
  });
  
  const filteredDoctors = selectedSpecialty
    ? doctors?.filter((doctor: any) => doctor.specialty === selectedSpecialty)
    : doctors;
  
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      specialty: "",
      doctorId: "",
      type: "video",
      appointmentDate: "",
      appointmentTime: "",
      reason: "",
    },
  });
  
  const appointmentMutation = useMutation({
    mutationFn: async (data: AppointmentFormValues) => {
      const appointmentData = {
        ...data,
        patientId: role === "patient" ? userId : data.doctorId, // If doctor is creating, they select the patient
        doctorId: role === "doctor" ? userId : data.doctorId, // If patient is creating, they select the doctor
        status: "scheduled",
      };
      
      return await apiRequest("POST", "/api/appointments", appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/upcoming"] });
      onSuccess();
    },
  });
  
  const onSubmit = (data: AppointmentFormValues) => {
    appointmentMutation.mutate(data);
  };
  
  const handleSpecialtyChange = (value: string) => {
    setSelectedSpecialty(value);
    form.setValue("specialty", value);
    form.setValue("doctorId", ""); // Reset doctor selection when specialty changes
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="specialty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Especialidad</FormLabel>
              <Select
                onValueChange={(value) => handleSpecialtyChange(value)}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar especialidad" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty.value} value={specialty.value}>
                      {specialty.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="doctorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Médico</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar médico" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingDoctors ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cargando...
                    </div>
                  ) : filteredDoctors && filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doctor: any) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.firstName ? `Dr. ${doctor.lastName || doctor.firstName}` : doctor.email}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-neutral-500 text-center">
                      No hay médicos disponibles para esta especialidad
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
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo de consulta</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  {appointmentTypes.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={type.value} id={`type-${type.value}`} />
                      <FormLabel htmlFor={`type-${type.value}`} className="font-normal">
                        {type.label}
                      </FormLabel>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="appointmentDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha</FormLabel>
                <FormControl>
                  <Input type="date" {...field} min={new Date().toISOString().split('T')[0]} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="appointmentTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar hora" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {generateTimeSlots().map((timeSlot) => (
                      <SelectItem key={timeSlot} value={timeSlot}>
                        {timeSlot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo de consulta</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describa brevemente el motivo de su consulta" 
                  {...field} 
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={appointmentMutation.isPending}
          >
            {appointmentMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Confirmar cita
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AppointmentForm;
