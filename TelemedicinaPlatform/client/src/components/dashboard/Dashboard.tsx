import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import PatientDashboard from "./PatientDashboard";
import DoctorDashboard from "./DoctorDashboard";

const Dashboard = () => {
  const { user } = useAuth();
  const [activeRole, setActiveRole] = useState<string>(user?.role || "patient");
  
  const handleRoleSwitch = (role: string) => {
    setActiveRole(role);
  };
  
  return (
    <div>
      {/* Role Switcher - Only show if user is a doctor */}
      {user?.role === "doctor" && (
        <div className="bg-white pt-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="border-b border-neutral-200">
              <nav className="-mb-px flex space-x-8" aria-label="Vista por rol">
                <button 
                  className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm ${
                    activeRole === "patient"
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                  }`}
                  onClick={() => handleRoleSwitch("patient")}
                >
                  Vista Paciente
                </button>
                <button 
                  className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm ${
                    activeRole === "doctor"
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                  }`}
                  onClick={() => handleRoleSwitch("doctor")}
                >
                  Vista Médico
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
      
      {/* Dashboard Content */}
      {activeRole === "doctor" ? <DoctorDashboard /> : <PatientDashboard />}
    </div>
  );
};

export default Dashboard;
