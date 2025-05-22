import { HelpCircle, Settings, Lock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <a href="#" className="text-neutral-400 hover:text-neutral-500">
            <span className="sr-only">Ayuda</span>
            <HelpCircle className="h-6 w-6" />
          </a>
          <a href="#" className="text-neutral-400 hover:text-neutral-500">
            <span className="sr-only">Configuración</span>
            <Settings className="h-6 w-6" />
          </a>
          <a href="#" className="text-neutral-400 hover:text-neutral-500">
            <span className="sr-only">Privacidad</span>
            <Lock className="h-6 w-6" />
          </a>
        </div>
        <div className="mt-8 md:mt-0 md:order-1">
          <p className="text-center text-sm text-neutral-500">&copy; {new Date().getFullYear()} MediConnect. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
