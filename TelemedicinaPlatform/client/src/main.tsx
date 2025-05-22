import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add a nice title and meta description for the app
document.title = "MediConnect | Plataforma de Telemedicina";

// Add meta description for SEO
const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'MediConnect es una plataforma de telemedicina que permite consultas médicas remotas, agendamiento de citas, mensajería segura y recetas electrónicas.';
document.head.appendChild(metaDescription);

// Add Open Graph tags for better social media sharing
const ogTitle = document.createElement('meta');
ogTitle.property = 'og:title';
ogTitle.content = 'MediConnect | Plataforma de Telemedicina';
document.head.appendChild(ogTitle);

const ogDescription = document.createElement('meta');
ogDescription.property = 'og:description';
ogDescription.content = 'Plataforma de telemedicina que permite consultas médicas remotas, agendamiento de citas, mensajería segura y recetas electrónicas.';
document.head.appendChild(ogDescription);

const ogType = document.createElement('meta');
ogType.property = 'og:type';
ogType.content = 'website';
document.head.appendChild(ogType);

createRoot(document.getElementById("root")!).render(<App />);
