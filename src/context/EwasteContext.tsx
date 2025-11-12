import { createContext, useContext, useState, ReactNode } from "react";

interface EwasteData {
  // Shared data structure for all models
  zones: string[];
  vehicles: string[];
  collectionPoints: string[];
  processingCenters: string[];
  
  // Cost matrices
  assignmentCosts: number[][]; // vehicles x zones
  transportationCosts: number[][]; // collection x processing
  
  // Supply and demand
  supply: number[];
  demand: number[];
  
  // Collection volumes per zone
  zoneVolumes: number[];
  
  // Processing rates
  processingRates: number[];
  
  // Transportation distances (zones to processing)
  transportDistances: number[][];
}

interface EwasteContextType {
  data: EwasteData;
  updateData: (updates: Partial<EwasteData>) => void;
  addVehicle: () => void;
  removeVehicle: (index: number) => void;
  addZone: () => void;
  removeZone: (index: number) => void;
  addCollectionPoint: () => void;
  removeCollectionPoint: (index: number) => void;
  addProcessingCenter: () => void;
  removeProcessingCenter: (index: number) => void;
}

const EwasteContext = createContext<EwasteContextType | undefined>(undefined);

export const EwasteProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<EwasteData>({
    zones: ["Zone A", "Zone B", "Zone C", "Zone D"],
    vehicles: ["Vehicle 1", "Vehicle 2", "Vehicle 3", "Vehicle 4"],
    collectionPoints: ["Collection Point 1", "Collection Point 2", "Collection Point 3"],
    processingCenters: ["Processing Center 1", "Processing Center 2", "Processing Center 3"],
    assignmentCosts: [
      [45, 60, 50, 55],
      [50, 40, 55, 45],
      [55, 45, 40, 50],
      [50, 55, 45, 40],
    ],
    transportationCosts: [
      [10, 15, 20],
      [12, 10, 18],
      [15, 12, 10],
    ],
    supply: [100, 150, 120],
    demand: [80, 120, 170],
    zoneVolumes: [250, 300, 275, 225],
    processingRates: [0.8, 0.85, 0.75],
    transportDistances: [
      [50, 70, 90],
      [60, 45, 85],
      [75, 65, 40],
      [55, 80, 60],
    ],
  });

  const updateData = (updates: Partial<EwasteData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const addVehicle = () => {
    const newVehicleNumber = data.vehicles.length + 1;
    const newVehicles = [...data.vehicles, `Vehicle ${newVehicleNumber}`];
    const newAssignmentCosts = [...data.assignmentCosts, Array(data.zones.length).fill(50)];
    
    setData((prev) => ({
      ...prev,
      vehicles: newVehicles,
      assignmentCosts: newAssignmentCosts,
    }));
  };

  const removeVehicle = (index: number) => {
    if (data.vehicles.length <= 1) return;
    
    const newVehicles = data.vehicles.filter((_, i) => i !== index);
    const newAssignmentCosts = data.assignmentCosts.filter((_, i) => i !== index);
    
    setData((prev) => ({
      ...prev,
      vehicles: newVehicles,
      assignmentCosts: newAssignmentCosts,
    }));
  };

  const addZone = () => {
    const newZoneLetter = String.fromCharCode(65 + data.zones.length);
    const newZones = [...data.zones, `Zone ${newZoneLetter}`];
    const newAssignmentCosts = data.assignmentCosts.map((row) => [...row, 50]);
    const newZoneVolumes = [...data.zoneVolumes, 250];
    const newTransportDistances = data.transportDistances.map((row) => [...row]);
    newTransportDistances.push(Array(data.processingCenters.length).fill(50));
    
    setData((prev) => ({
      ...prev,
      zones: newZones,
      assignmentCosts: newAssignmentCosts,
      zoneVolumes: newZoneVolumes,
      transportDistances: newTransportDistances,
    }));
  };

  const removeZone = (index: number) => {
    if (data.zones.length <= 1) return;
    
    const newZones = data.zones.filter((_, i) => i !== index);
    const newAssignmentCosts = data.assignmentCosts.map((row) => row.filter((_, i) => i !== index));
    const newZoneVolumes = data.zoneVolumes.filter((_, i) => i !== index);
    const newTransportDistances = data.transportDistances.filter((_, i) => i !== index);
    
    setData((prev) => ({
      ...prev,
      zones: newZones,
      assignmentCosts: newAssignmentCosts,
      zoneVolumes: newZoneVolumes,
      transportDistances: newTransportDistances,
    }));
  };

  const addCollectionPoint = () => {
    const newPointNumber = data.collectionPoints.length + 1;
    const newCollectionPoints = [...data.collectionPoints, `Collection Point ${newPointNumber}`];
    const newTransportationCosts = [...data.transportationCosts, Array(data.processingCenters.length).fill(12)];
    const newSupply = [...data.supply, 100];
    
    setData((prev) => ({
      ...prev,
      collectionPoints: newCollectionPoints,
      transportationCosts: newTransportationCosts,
      supply: newSupply,
    }));
  };

  const removeCollectionPoint = (index: number) => {
    if (data.collectionPoints.length <= 1) return;
    
    const newCollectionPoints = data.collectionPoints.filter((_, i) => i !== index);
    const newTransportationCosts = data.transportationCosts.filter((_, i) => i !== index);
    const newSupply = data.supply.filter((_, i) => i !== index);
    
    setData((prev) => ({
      ...prev,
      collectionPoints: newCollectionPoints,
      transportationCosts: newTransportationCosts,
      supply: newSupply,
    }));
  };

  const addProcessingCenter = () => {
    const newCenterNumber = data.processingCenters.length + 1;
    const newProcessingCenters = [...data.processingCenters, `Processing Center ${newCenterNumber}`];
    const newTransportationCosts = data.transportationCosts.map((row) => [...row, 12]);
    const newDemand = [...data.demand, 100];
    const newProcessingRates = [...data.processingRates, 0.8];
    
    setData((prev) => ({
      ...prev,
      processingCenters: newProcessingCenters,
      transportationCosts: newTransportationCosts,
      demand: newDemand,
      processingRates: newProcessingRates,
    }));
  };

  const removeProcessingCenter = (index: number) => {
    if (data.processingCenters.length <= 1) return;
    
    const newProcessingCenters = data.processingCenters.filter((_, i) => i !== index);
    const newTransportationCosts = data.transportationCosts.map((row) => row.filter((_, i) => i !== index));
    const newDemand = data.demand.filter((_, i) => i !== index);
    const newProcessingRates = data.processingRates.filter((_, i) => i !== index);
    
    setData((prev) => ({
      ...prev,
      processingCenters: newProcessingCenters,
      transportationCosts: newTransportationCosts,
      demand: newDemand,
      processingRates: newProcessingRates,
    }));
  };

  return (
    <EwasteContext.Provider
      value={{
        data,
        updateData,
        addVehicle,
        removeVehicle,
        addZone,
        removeZone,
        addCollectionPoint,
        removeCollectionPoint,
        addProcessingCenter,
        removeProcessingCenter,
      }}
    >
      {children}
    </EwasteContext.Provider>
  );
};

export const useEwaste = () => {
  const context = useContext(EwasteContext);
  if (!context) {
    throw new Error("useEwaste must be used within EwasteProvider");
  }
  return context;
};
