import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Monitor,
  MessageSquare,
  UserPlus,
  Settings
} from "lucide-react";

interface VideoCallProps {
  appointment: any;
  onClose: () => void;
}

const VideoCall = ({ appointment, onClose }: VideoCallProps) => {
  const { toast } = useToast();
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCallActive, setIsCallActive] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // Set up video stream on component mount
  useEffect(() => {
    let localStream: MediaStream | null = null;
    
    const setupMedia = async () => {
      try {
        // Request access to user's camera and microphone
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        // Display the local video stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
        
        // In a real implementation, this would connect to a WebRTC service
        // For the demo, we're just setting up local video
        
        // Setup remote video with a placeholder (would be removed in a real implementation)
        setTimeout(() => {
          simulateRemoteVideo();
        }, 1000);
        
        toast({
          title: "Videollamada iniciada",
          description: "Conectado exitosamente a la consulta.",
        });
      } catch (error) {
        console.error("Error accessing media devices:", error);
        toast({
          title: "Error al iniciar videollamada",
          description: "No se pudo acceder a la cámara o micrófono. Verifica los permisos.",
          variant: "destructive",
        });
      }
    };
    
    setupMedia();
    
    // Start call duration timer
    const durationTimer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    // Cleanup function
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      clearInterval(durationTimer);
    };
  }, []);
  
  // Simulate remote video connection for demo purposes
  const simulateRemoteVideo = () => {
    // In a real implementation, this would receive the remote peer's stream
    // For this demo, we'll use a static image as placeholder
    if (remoteVideoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        // Fill with a gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "#4338ca");
        gradient.addColorStop(1, "#3b82f6");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add text
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Esperando a que se conecte el médico...", canvas.width / 2, canvas.height / 2);
        
        // Convert canvas to stream
        // @ts-ignore - createCapture is not in the standard types
        const stream = canvas.captureStream ? canvas.captureStream() : canvas.captureStream(30);
        remoteVideoRef.current.srcObject = stream;
      }
    }
  };
  
  // Format the call duration time
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Toggle audio
  const toggleAudio = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = !isAudioEnabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };
  
  // Toggle video
  const toggleVideo = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };
  
  // Toggle screen sharing
  const toggleScreenSharing = async () => {
    try {
      if (!isScreenSharing) {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        
        if (localVideoRef.current) {
          // Save the current video track to restore later
          const currentStream = localVideoRef.current.srcObject as MediaStream;
          const videoTrack = currentStream.getVideoTracks()[0];
          
          // Replace with screen sharing track
          currentStream.removeTrack(videoTrack);
          currentStream.addTrack(screenStream.getVideoTracks()[0]);
          
          // Listen for the end of screen sharing
          screenStream.getVideoTracks()[0].onended = () => {
            setIsScreenSharing(false);
            // Restore camera
            if (localVideoRef.current) {
              const stream = localVideoRef.current.srcObject as MediaStream;
              stream.removeTrack(stream.getVideoTracks()[0]);
              stream.addTrack(videoTrack);
            }
          };
        }
      } else {
        // Stop screen sharing
        // This should be handled by the onended event above
        // But we'll provide a fallback
        if (localVideoRef.current) {
          const currentStream = localVideoRef.current.srcObject as MediaStream;
          currentStream.getVideoTracks().forEach(track => track.stop());
          
          // Restart camera
          const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
          const newVideoTrack = newStream.getVideoTracks()[0];
          currentStream.addTrack(newVideoTrack);
        }
      }
      
      setIsScreenSharing(!isScreenSharing);
    } catch (error) {
      console.error("Error toggling screen share:", error);
      toast({
        title: "Error al compartir pantalla",
        description: "No se pudo iniciar la compartición de pantalla.",
        variant: "destructive",
      });
    }
  };
  
  // End call
  const endCall = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    setIsCallActive(false);
    onClose();
  };
  
  return (
    <div className="flex flex-col">
      <div className="relative w-full bg-neutral-900 rounded-lg overflow-hidden" style={{ height: "70vh" }}>
        {/* Remote video (main display) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Call duration counter */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {formatDuration(callDuration)}
        </div>
        
        {/* Local video (small overlay) */}
        <div className="absolute bottom-4 right-4 w-48 h-36 border-2 border-white rounded-lg overflow-hidden shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted // Always mute local video to prevent feedback
            className="w-full h-full object-cover"
          />
          
          {/* Video status overlays */}
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
              <VideoOff className="h-8 w-8 text-neutral-400" />
            </div>
          )}
          
          {!isAudioEnabled && (
            <div className="absolute bottom-2 right-2 bg-red-500 rounded-full p-1">
              <MicOff className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
        
        {/* Call information */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {appointment.type === "video" ? "Videoconsulta" : "Consulta"} con {appointment.doctorName || appointment.patientName || "Usuario"}
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex justify-center space-x-4 mt-6 mb-2">
        <Button
          onClick={toggleAudio}
          variant={isAudioEnabled ? "default" : "destructive"}
          size="icon"
          className="rounded-full h-12 w-12"
        >
          {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
        
        <Button
          onClick={toggleVideo}
          variant={isVideoEnabled ? "default" : "destructive"}
          size="icon"
          className="rounded-full h-12 w-12"
        >
          {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>
        
        <Button
          onClick={toggleScreenSharing}
          variant={isScreenSharing ? "destructive" : "outline"}
          size="icon"
          className="rounded-full h-12 w-12"
        >
          <Monitor className="h-5 w-5" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-12 w-12"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
        
        <Button
          onClick={endCall}
          variant="destructive"
          size="icon"
          className="rounded-full h-12 w-12"
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex justify-center space-x-2 mt-2">
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Invitar
        </Button>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Configuración
        </Button>
      </div>
    </div>
  );
};

export default VideoCall;
