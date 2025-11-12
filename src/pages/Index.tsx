import Hero from "@/components/Hero";
import CostMinimization from "@/components/CostMinimization";
import AssignmentProblem from "@/components/AssignmentProblem";
import TransportationModel from "@/components/TransportationModel";
import { EwasteProvider } from "@/context/EwasteContext";

const Index = () => {
  return (
    <EwasteProvider>
      <div className="min-h-screen bg-background">
        <Hero />
        <CostMinimization />
        <AssignmentProblem />
        <TransportationModel />
        
        <footer className="py-8 px-4 border-t border-border mt-16">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>Linear Programming for E-Waste Optimization</p>
            <p className="mt-2">Operations Research • Cost Minimization • Assignment • Transportation</p>
          </div>
        </footer>
      </div>
    </EwasteProvider>
  );
};

export default Index;
