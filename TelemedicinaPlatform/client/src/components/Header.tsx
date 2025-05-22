import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Menu, 
  Settings, 
  LogOut, 
  User, 
  FileText, 
  Calendar, 
  MessageCircle, 
  Activity,
  BriefcaseMedical
} from "lucide-react";

interface HeaderProps {
  isAuthenticated: boolean;
  isLoading: boolean;
}

const Header = ({ isAuthenticated, isLoading }: HeaderProps) => {
  const [location] = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navigationItems = [
    { name: "Inicio", href: "/", active: location === "/" },
    { name: "Citas", href: "/appointments", active: location === "/appointments" },
    { name: "Consultas", href: "/medical-records", active: location === "/medical-records" },
    { name: "Historial", href: "/medical-records", active: location === "/medical-records" },
    { name: "Mensajes", href: "/messages", active: location === "/messages" },
  ];
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <BriefcaseMedical className="h-6 w-6 text-primary-600 mr-2" />
              <span className="text-primary-700 font-bold text-xl">MediConnect</span>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    item.active
                      ? "border-primary-500 text-neutral-900"
                      : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center">
            {isLoading ? (
              <div className="animate-pulse h-8 w-8 rounded-full bg-neutral-200"></div>
            ) : isAuthenticated ? (
              <>
                <button className="rounded-full bg-white p-1 text-neutral-400 hover:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <span className="sr-only">Ver notificaciones</span>
                  <Bell className="h-6 w-6" />
                </button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="ml-3 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      <span className="sr-only">Abrir menú de usuario</span>
                      {user?.profileImageUrl ? (
                        <img
                          className="h-8 w-8 rounded-full object-cover"
                          src={user.profileImageUrl}
                          alt="Foto de perfil"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </div>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Mis Citas</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Recetas</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      <span>Mensajes</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configuración</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.location.href = "/api/logout"}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={() => window.location.href = "/api/login"}>
                Iniciar sesión
              </Button>
            )}
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <button 
              type="button" 
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Abrir menú principal</span>
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  item.active
                    ? "bg-primary-50 border-primary-500 text-primary-700"
                    : "border-transparent text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-800"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          {isAuthenticated && (
            <div className="pt-4 pb-3 border-t border-neutral-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  {user?.profileImageUrl ? (
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={user.profileImageUrl}
                      alt="Foto de perfil"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-neutral-800">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-sm font-medium text-neutral-500">
                    {user?.email}
                  </div>
                </div>
                <button className="ml-auto flex-shrink-0 bg-white p-1 rounded-full text-neutral-400 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  <span className="sr-only">Ver notificaciones</span>
                  <Bell className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-3 space-y-1">
                <a
                  href="#"
                  className="block px-4 py-2 text-base font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
                >
                  Tu Perfil
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-base font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
                >
                  Configuración
                </a>
                <a
                  href="/api/logout"
                  className="block px-4 py-2 text-base font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
                >
                  Cerrar sesión
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
