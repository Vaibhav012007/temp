import { Recycle, TrendingDown, GitBranch, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

const Hero = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="absolute top-4 right-4">
          {user ? (
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          ) : (
            <Button onClick={() => navigate("/auth")} variant="default">
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>
          )}
        </div>
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary">
            <Recycle className="w-4 h-4" />
            Operations Research in Action
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            E-Waste Optimization
            <span className="block text-primary mt-2">Using Linear Programming</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Minimize operational costs and maximize recovery value through advanced 
            optimization models for sustainable e-waste management.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 pt-8 max-w-4xl mx-auto">
            <div className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Cost Minimization</h3>
              <p className="text-sm text-muted-foreground">
                Optimize collection, transportation, processing, and disposal costs
              </p>
            </div>
            
            <div className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Recycle className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Assignment Problem</h3>
              <p className="text-sm text-muted-foreground">
                Efficiently assign collection vehicles to zones
              </p>
            </div>
            
            <div className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <GitBranch className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Network Flow</h3>
              <p className="text-sm text-muted-foreground">
                Multi-stage transportation and distribution optimization
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
