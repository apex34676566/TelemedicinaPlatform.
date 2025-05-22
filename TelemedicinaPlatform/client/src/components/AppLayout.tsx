import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useAuth } from "@/hooks/useAuth";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header isAuthenticated={isAuthenticated} isLoading={isLoading} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
