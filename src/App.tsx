import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth";
import { FamilyProvider } from "@/lib/hooks/useFamily";
import { Router } from "@/Router";
import ProfilePage from "@/pages/ProfilePage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FamilyProvider>
          <Router />
          <Toaster />
        </FamilyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
