import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/components/dashboard/Dashboard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check, ArrowRight, Video, Users, MessageSquare, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Home = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  // If authenticated, show dashboard
  if (isAuthenticated && user) {
    return <Dashboard />;
  }
  
  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // If not authenticated, show landing page
  return <LandingPage />;
};

const LandingPage = () => {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-neutral-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Cuidado médico</span>{' '}
                  <span className="block text-primary-600 xl:inline">desde cualquier lugar</span>
                </h1>
                <p className="mt-3 text-base text-neutral-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Conectamos pacientes y médicos a través de una plataforma segura y fácil de usar. Consultas médicas, citas, recetas y seguimiento de tratamientos en un solo lugar.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Button
                      size="lg"
                      onClick={() => window.location.href = "/api/login"}
                      className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                    >
                      Comenzar
                    </Button>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10"
                    >
                      Saber más
                    </Button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80"
            alt="Doctor en teleconferencia con paciente"
          />
        </div>
      </div>

      {/* Features section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Características</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
              Una mejor manera de recibir atención médica
            </p>
            <p className="mt-4 max-w-2xl text-xl text-neutral-500 lg:mx-auto">
              Nuestra plataforma está diseñada para facilitar la atención médica, ahorrando tiempo y haciendo que el proceso sea más cómodo y accesible.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <Video className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-neutral-900">Consultas por video</h3>
                  <p className="mt-2 text-base text-neutral-500">
                    Conecta con médicos a través de videoconferencias seguras desde la comodidad de tu hogar.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-neutral-900">Médicos especializados</h3>
                  <p className="mt-2 text-base text-neutral-500">
                    Accede a una red de profesionales de la salud en diversas especialidades médicas.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-neutral-900">Mensajería segura</h3>
                  <p className="mt-2 text-base text-neutral-500">
                    Comunícate con tu médico de forma segura y privada a través de nuestro sistema de mensajería.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-neutral-900">Historial médico digital</h3>
                  <p className="mt-2 text-base text-neutral-500">
                    Mantén un registro de tu historial médico, recetas y resultados en un solo lugar seguro.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">¿Listo para comenzar?</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-primary-100">
            Regístrate hoy y comienza a experimentar una nueva forma de atención médica.
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = "/api/login"}
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 sm:w-auto"
          >
            Registrarse
            <ArrowRight className="ml-3 -mr-1 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
