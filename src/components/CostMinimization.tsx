import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useEwaste } from "@/context/EwasteContext";

interface OptimizationResult {
  totalCost: number;
  collectionCost: number;
  transportationCost: number;
  processingCost: number;
  disposalCost: number;
  recoveryValue: number;
  netCost: number;
}

const CostMinimization = () => {
  const { data } = useEwaste();
  const [inputs, setInputs] = useState({
    collectionVolume: 1000,
    transportationDistance: 50,
    processingRate: 0.8,
    disposalVolume: 200,
  });

  const [result, setResult] = useState<OptimizationResult | null>(null);

  // Calculate total from shared data
  const totalZoneVolume = data.zoneVolumes.reduce((sum, vol) => sum + vol, 0);
  const avgProcessingRate = data.processingRates.reduce((sum, rate) => sum + rate, 0) / data.processingRates.length;

  const handleInputChange = (field: string, value: string) => {
    setInputs({ ...inputs, [field]: parseFloat(value) || 0 });
  };

  const calculateOptimization = () => {
    // Use data from shared context
    const actualCollectionVolume = totalZoneVolume > 0 ? totalZoneVolume : inputs.collectionVolume;
    const actualProcessingRate = avgProcessingRate > 0 ? avgProcessingRate : inputs.processingRate;
    
    // Simplified LP model calculation
    const collectionCost = actualCollectionVolume * 415; // ₹415 per unit
    const transportationCost = inputs.transportationDistance * actualCollectionVolume * 8.3; // ₹8.3 per unit-km
    const processingCost = actualCollectionVolume * actualProcessingRate * 830; // ₹830 per unit processed
    const disposalCost = inputs.disposalVolume * 1245; // ₹1245 per unit
    const recoveryValue = actualCollectionVolume * actualProcessingRate * 0.6 * 1660; // ₹1660 per unit recovered
    
    const totalCost = collectionCost + transportationCost + processingCost + disposalCost;
    const netCost = totalCost - recoveryValue;

    setResult({
      totalCost,
      collectionCost,
      transportationCost,
      processingCost,
      disposalCost,
      recoveryValue,
      netCost,
    });

    toast.success("Optimization complete! (Using data from Assignment & Transportation models)");
  };

  return (
    <section id="cost-minimization" className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
            <TrendingDown className="w-4 h-4" />
            Model 1
          </div>
          <h2 className="text-4xl font-bold mb-4">Cost Minimization Model</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Linear programming model to minimize total operational costs while maximizing recovery value
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Parameters</CardTitle>
              <CardDescription>Configure the e-waste management parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="collectionVolume">Collection Volume (units)</Label>
                <Input
                  id="collectionVolume"
                  type="number"
                  value={inputs.collectionVolume}
                  onChange={(e) => handleInputChange("collectionVolume", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transportationDistance">Transportation Distance (km)</Label>
                <Input
                  id="transportationDistance"
                  type="number"
                  value={inputs.transportationDistance}
                  onChange={(e) => handleInputChange("transportationDistance", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="processingRate">Processing Rate (0-1)</Label>
                <Input
                  id="processingRate"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={inputs.processingRate}
                  onChange={(e) => handleInputChange("processingRate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="disposalVolume">Disposal Volume (units)</Label>
                <Input
                  id="disposalVolume"
                  type="number"
                  value={inputs.disposalVolume}
                  onChange={(e) => handleInputChange("disposalVolume", e.target.value)}
                />
              </div>

              <Button onClick={calculateOptimization} className="w-full">
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Optimal Solution
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optimization Results</CardTitle>
              <CardDescription>Optimal cost breakdown and recovery value</CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Collection Cost</div>
                      <div className="text-2xl font-bold">₹{result.collectionCost.toFixed(2)}</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Transportation</div>
                      <div className="text-2xl font-bold">₹{result.transportationCost.toFixed(2)}</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Processing Cost</div>
                      <div className="text-2xl font-bold">₹{result.processingCost.toFixed(2)}</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Disposal Cost</div>
                      <div className="text-2xl font-bold">₹{result.disposalCost.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between items-center text-lg">
                      <span>Total Cost:</span>
                      <span className="font-bold">₹{result.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg text-primary">
                      <span>Recovery Value:</span>
                      <span className="font-bold">-₹{result.recoveryValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xl pt-3 border-t">
                      <span className="font-semibold">Net Cost:</span>
                      <span className="font-bold text-primary">₹{result.netCost.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-sm">
                    <strong>Data Source:</strong> Using {data.zones.length} zones with total volume of {totalZoneVolume} units
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Configure parameters and click Calculate to see results
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {result && (
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>Bar chart of cost components</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Collection', value: result.collectionCost },
                    { name: 'Transport', value: result.transportationCost },
                    { name: 'Processing', value: result.processingCost },
                    { name: 'Disposal', value: result.disposalCost },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="hsl(var(--primary))" name="Cost (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Distribution</CardTitle>
                <CardDescription>Pie chart of cost allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Collection', value: result.collectionCost },
                        { name: 'Transportation', value: result.transportationCost },
                        { name: 'Processing', value: result.processingCost },
                        { name: 'Disposal', value: result.disposalCost },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `₹${entry.value.toFixed(0)}`}
                    >
                      <Cell fill="hsl(var(--primary))" />
                      <Cell fill="hsl(var(--secondary))" />
                      <Cell fill="hsl(var(--accent))" />
                      <Cell fill="hsl(var(--chart-1))" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
};

export default CostMinimization;
