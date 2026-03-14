import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Verify from "./pages/Verify";
import Admin from "./pages/Admin";
import PostJob from "./pages/PostJob";
import NotFound from "./pages/NotFound";
import Login from '@/pages/Login';


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/verify/:userId" element={<Verify />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/login" element={<Login />} />

          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
