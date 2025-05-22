import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getFullName, getInitials } from "@/lib/utils";
import { 
  Search, 
  Paperclip, 
  Send, 
  Loader2, 
  MessageSquare,
  Users,
  ArrowLeft
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import ChatInterface from "@/components/chat/ChatInterface";

const Messages = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isMobileViewChat, setIsMobileViewChat] = useState(false);
  
  const { data: doctors, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ["/api/doctors"],
  });
  
  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ["/api/patients"],
    enabled: user?.role === "doctor",
  });
  
  // Get the contacts based on the user's role
  const contacts = user?.role === "doctor" ? patients : doctors;
  const isLoadingContacts = user?.role === "doctor" ? isLoadingPatients : isLoadingDoctors;
  
  const filteredContacts = contacts?.filter((contact: any) => {
    if (!searchTerm) return true;
    
    const fullName = getFullName(contact.firstName, contact.lastName).toLowerCase();
    const email = contact.email?.toLowerCase() || "";
    const searchLower = searchTerm.toLowerCase();
    
    return fullName.includes(searchLower) || email.includes(searchLower);
  });
  
  // Handle mobile view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobileViewChat(!!selectedUserId);
      } else {
        setIsMobileViewChat(false);
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [selectedUserId]);
  
  const handleSelectContact = (contactId: string) => {
    setSelectedUserId(contactId);
  };
  
  const handleBackToContacts = () => {
    setSelectedUserId(null);
  };
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-800 mb-1">Mensajes</h1>
          <p className="text-neutral-600">Comunícate de forma segura con tus {user?.role === "doctor" ? "pacientes" : "médicos"}</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Contacts list - Hide on mobile when chat is open */}
          <div className={`w-full md:w-1/3 ${isMobileViewChat ? "hidden md:block" : ""}`}>
            <Card className="h-[80vh] flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle>Contactos</CardTitle>
                <CardDescription>
                  {user?.role === "doctor" ? "Tus pacientes" : "Tus médicos"}
                </CardDescription>
                <div className="relative mt-2">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Buscar contactos..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-grow overflow-y-auto pb-0">
                {isLoadingContacts ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
                  </div>
                ) : filteredContacts?.length > 0 ? (
                  <ul className="space-y-2">
                    {filteredContacts.map((contact: any) => (
                      <li 
                        key={contact.id}
                        className={`flex items-center p-3 rounded-md cursor-pointer hover:bg-neutral-100 transition-colors ${
                          selectedUserId === contact.id ? "bg-primary-50 border border-primary-200" : ""
                        }`}
                        onClick={() => handleSelectContact(contact.id)}
                      >
                        <Avatar className="h-10 w-10">
                          {contact.profileImageUrl ? (
                            <AvatarImage src={contact.profileImageUrl} alt={getFullName(contact.firstName, contact.lastName)} />
                          ) : (
                            <AvatarFallback>{getInitials(contact.firstName, contact.lastName)}</AvatarFallback>
                          )}
                        </Avatar>
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 truncate">
                            {getFullName(contact.firstName, contact.lastName)}
                          </p>
                          <p className="text-xs text-neutral-500 truncate">
                            {contact.specialty || contact.email || ""}
                          </p>
                        </div>
                        {/* Unread indicator - example placeholder */}
                        {contact.hasUnread && (
                          <div className="h-2 w-2 rounded-full bg-primary-500"></div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Users className="h-12 w-12 text-neutral-300 mb-4" />
                    <h3 className="text-lg font-medium text-neutral-900">No hay contactos</h3>
                    <p className="text-sm text-neutral-500 max-w-xs mt-2">
                      {searchTerm
                        ? "No se encontraron contactos con ese término de búsqueda."
                        : user?.role === "doctor"
                        ? "No tienes pacientes asignados en este momento."
                        : "No tienes médicos asociados en este momento."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Chat area - Full width on mobile when active */}
          <div className={`w-full md:w-2/3 ${!isMobileViewChat && !selectedUserId ? "hidden md:block" : ""}`}>
            {selectedUserId ? (
              <ChatInterface
                userId={user?.id || ""}
                contactId={selectedUserId}
                onBack={handleBackToContacts}
              />
            ) : (
              <Card className="h-[80vh] flex flex-col justify-center items-center">
                <CardContent className="text-center">
                  <MessageSquare className="mx-auto h-16 w-16 text-neutral-300 mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900">Selecciona un contacto</h3>
                  <p className="text-sm text-neutral-500 max-w-xs mt-2">
                    Elige un contacto de la lista para comenzar una conversación.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
