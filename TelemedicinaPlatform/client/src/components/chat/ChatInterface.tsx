import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getFullName, getInitials } from "@/lib/utils";
import { 
  Paperclip, 
  Send, 
  Loader2, 
  ArrowLeft, 
  FileUp, 
  Download
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";

interface ChatInterfaceProps {
  userId: string;
  contactId: string;
  onBack: () => void;
}

interface Message {
  id: number;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  sentAt: string;
}

const ChatInterface = ({ userId, contactId, onBack }: ChatInterfaceProps) => {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get conversation
  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["/api/messages/conversation", contactId],
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });
  
  // Get contact details
  const { data: contact, isLoading: isLoadingContact } = useQuery({
    queryKey: ["/api/users", contactId],
    queryFn: async () => {
      // This is a placeholder since we don't have a direct user endpoint
      // In a real implementation, you would fetch user details from a proper endpoint
      return { id: contactId, firstName: "", lastName: "", profileImageUrl: "" };
    },
  });
  
  // Mark messages as read
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!messages) return;
      
      const unreadMessages = messages.filter(
        (msg: Message) => !msg.read && msg.senderId === contactId
      );
      
      for (const msg of unreadMessages) {
        try {
          await apiRequest("POST", `/api/messages/${msg.id}/read`, {});
        } catch (error) {
          console.error("Error marking message as read:", error);
        }
      }
      
      if (unreadMessages.length > 0) {
        queryClient.invalidateQueries({ queryKey: ["/api/messages/conversation", contactId] });
      }
    };
    
    markMessagesAsRead();
  }, [messages, contactId]);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", "/api/messages", {
        receiverId: contactId,
        content,
      });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversation", contactId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });
  
  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === "") return;
    
    sendMessageMutation.mutate(message);
  };
  
  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      
      // Upload the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('relatedToType', 'message');
      
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Error uploading file');
      }
      
      const fileData = await response.json();
      
      // Send a message with the file info
      const fileMessage = `📎 Archivo: ${file.name} (${(file.size / 1024).toFixed(1)} KB) [ID: ${fileData.id}]`;
      sendMessageMutation.mutate(fileMessage);
      
      toast({
        title: "Archivo enviado",
        description: "El archivo se ha enviado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo subir el archivo. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  
  // Trigger file input click
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };
  
  // Group messages by date
  const groupMessagesByDate = () => {
    if (!messages) return {};
    
    const groups: Record<string, Message[]> = {};
    
    messages.forEach((msg: Message) => {
      const date = new Date(msg.sentAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    
    return groups;
  };
  
  const messageGroups = groupMessagesByDate();
  
  // Format time for message display
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <Card className="h-[80vh] flex flex-col">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="md:hidden mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          {isLoadingContact ? (
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-neutral-200 animate-pulse mr-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-neutral-200 rounded animate-pulse w-24"></div>
                <div className="h-3 bg-neutral-200 rounded animate-pulse w-16"></div>
              </div>
            </div>
          ) : (
            <>
              <Avatar className="h-10 w-10 mr-3">
                {contact?.profileImageUrl ? (
                  <AvatarImage src={contact.profileImageUrl} alt={getFullName(contact.firstName, contact.lastName)} />
                ) : (
                  <AvatarFallback>{getInitials(contact?.firstName, contact?.lastName)}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <CardTitle className="text-base">
                  {getFullName(contact?.firstName, contact?.lastName) || "Usuario"}
                </CardTitle>
                <CardDescription>
                  {contact?.isOnline ? "En línea" : "Último acceso recientemente"}
                </CardDescription>
              </div>
            </>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-y-auto p-4">
        {isLoadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          </div>
        ) : Object.keys(messageGroups).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(messageGroups).map(([date, msgs]) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex justify-center mb-4">
                  <span className="text-xs text-neutral-500 bg-white px-2 py-1 rounded-full border">
                    {date}
                  </span>
                </div>
                
                {/* Messages for this date */}
                <div className="space-y-3">
                  {msgs.map((msg: Message) => {
                    const isSentByMe = msg.senderId === userId;
                    const isFileMessage = msg.content.startsWith("📎 Archivo:");
                    
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}
                      >
                        {!isSentByMe && (
                          <Avatar className="h-8 w-8 mr-2 flex-shrink-0 self-end mb-1">
                            {contact?.profileImageUrl ? (
                              <AvatarImage src={contact.profileImageUrl} alt={getFullName(contact.firstName, contact.lastName)} />
                            ) : (
                              <AvatarFallback>{getInitials(contact?.firstName, contact?.lastName)}</AvatarFallback>
                            )}
                          </Avatar>
                        )}
                        
                        <div className={`max-w-[70%] ${isSentByMe ? "bg-primary-100 text-neutral-900" : "bg-white border border-neutral-200"} rounded-lg px-4 py-2 ${isSentByMe ? "rounded-br-none" : "rounded-bl-none"}`}>
                          {isFileMessage ? (
                            <div>
                              <div className="flex items-center">
                                <FileUp className="h-4 w-4 mr-2 text-neutral-500" />
                                <span>{msg.content.split("Archivo: ")[1].split(" [ID:")[0]}</span>
                              </div>
                              <div className="mt-1 flex justify-end">
                                <Button variant="ghost" size="sm" className="h-6 px-2">
                                  <Download className="h-3 w-3 mr-1" />
                                  <span className="text-xs">Descargar</span>
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p>{msg.content}</p>
                          )}
                          <span className="text-xs text-neutral-500 block text-right mt-1">
                            {formatMessageTime(msg.sentAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-neutral-100 rounded-full p-6 mb-4">
              <Send className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900">
              Comienza una nueva conversación
            </h3>
            <p className="text-sm text-neutral-500 max-w-xs mt-2">
              Envía un mensaje para iniciar una conversación segura con esta persona.
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex w-full items-center">
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={handleAttachClick}
            disabled={isUploading}
            className="mr-2 flex-shrink-0"
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-neutral-500" />
            ) : (
              <Paperclip className="h-5 w-5 text-neutral-500" />
            )}
          </Button>
          
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-grow"
            disabled={sendMessageMutation.isPending}
          />
          
          <Button 
            type="submit" 
            size="icon" 
            className="ml-2 rounded-full"
            disabled={sendMessageMutation.isPending || message.trim() === ""}
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;
