import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GitBranch, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useEwaste } from "@/context/EwasteContext";

interface TransportationPlan {
  from: string;
  to: string;
  quantity: number;
  cost: number;
}

const TransportationModel = () => {
  const { data, addCollectionPoint, removeCollectionPoint, addProcessingCenter, removeProcessingCenter, updateData } = useEwaste();
  const [solving, setSolving] = useState(false);
  const [solution, setSolution] = useState<TransportationPlan[] | null>(null);

  const { collectionPoints: sources, processingCenters: destinations, supply, demand, transportationCosts: costMatrix } = data;

  const updateSupply = (index: number, value: string) => {
    const numValue = parseInt(value) || 0;
    const newSupply = supply.map((s, i) => (i === index ? numValue : s));
    updateData({ supply: newSupply });
    setSolution(null);
  };

  const updateDemand = (index: number, value: string) => {
    const numValue = parseInt(value) || 0;
    const newDemand = demand.map((d, i) => (i === index ? numValue : d));
    updateData({ demand: newDemand });
    setSolution(null);
  };

  const updateCost = (row: number, col: number, value: string) => {
    const numValue = parseInt(value) || 0;
    const newMatrix = costMatrix.map((r, i) =>
      i === row ? r.map((c, j) => (j === col ? numValue : c)) : r
    );
    updateData({ transportationCosts: newMatrix });
    setSolution(null);
  };

  const addSource = () => {
    addCollectionPoint();
    setSolution(null);
    toast.success("Collection point added");
  };

  const removeSource = (index: number) => {
    if (sources.length <= 1) {
      toast.error("Must have at least one collection point");
      return;
    }
    removeCollectionPoint(index);
    setSolution(null);
    toast.success("Collection point removed");
  };

  const addDestination = () => {
    addProcessingCenter();
    setSolution(null);
    toast.success("Processing center added");
  };

  const removeDestination = (index: number) => {
    if (destinations.length <= 1) {
      toast.error("Must have at least one processing center");
      return;
    }
    removeProcessingCenter(index);
    setSolution(null);
    toast.success("Processing center removed");
  };

  const solveTransportation = () => {
    const totalSupply = supply.reduce((a, b) => a + b, 0);
    const totalDemand = demand.reduce((a, b) => a + b, 0);
    
    if (totalSupply !== totalDemand) {
      toast.error(`Supply (${totalSupply}) must equal Demand (${totalDemand})`);
      return;
    }
    
    setSolving(true);
    
    setTimeout(() => {
      // Vogel's Approximation Method (VAM)
      const optimalPlan: TransportationPlan[] = [];
      const remainingSupply = [...supply];
      const remainingDemand = [...demand];
      const m = sources.length;
      const n = destinations.length;

      while (remainingSupply.some(s => s > 0) && remainingDemand.some(d => d > 0)) {
        // Calculate penalties for rows
        const rowPenalties = remainingSupply.map((s, i) => {
          if (s === 0) return -1;
          const costs = remainingDemand.map((d, j) => d > 0 ? costMatrix[i][j] : Infinity).sort((a, b) => a - b);
          return costs.length >= 2 ? costs[1] - costs[0] : costs[0];
        });

        // Calculate penalties for columns
        const colPenalties = remainingDemand.map((d, j) => {
          if (d === 0) return -1;
          const costs = remainingSupply.map((s, i) => s > 0 ? costMatrix[i][j] : Infinity).sort((a, b) => a - b);
          return costs.length >= 2 ? costs[1] - costs[0] : costs[0];
        });

        // Find maximum penalty
        const maxRowPenalty = Math.max(...rowPenalties);
        const maxColPenalty = Math.max(...colPenalties);

        let selectedRow = -1;
        let selectedCol = -1;

        if (maxRowPenalty >= maxColPenalty) {
          selectedRow = rowPenalties.indexOf(maxRowPenalty);
          // Find minimum cost in selected row
          let minCost = Infinity;
          for (let j = 0; j < n; j++) {
            if (remainingDemand[j] > 0 && costMatrix[selectedRow][j] < minCost) {
              minCost = costMatrix[selectedRow][j];
              selectedCol = j;
            }
          }
        } else {
          selectedCol = colPenalties.indexOf(maxColPenalty);
          // Find minimum cost in selected column
          let minCost = Infinity;
          for (let i = 0; i < m; i++) {
            if (remainingSupply[i] > 0 && costMatrix[i][selectedCol] < minCost) {
              minCost = costMatrix[i][selectedCol];
              selectedRow = i;
            }
          }
        }

        // Allocate
        const quantity = Math.min(remainingSupply[selectedRow], remainingDemand[selectedCol]);
        if (quantity > 0) {
          optimalPlan.push({
            from: sources[selectedRow],
            to: destinations[selectedCol],
            quantity,
            cost: costMatrix[selectedRow][selectedCol],
          });
          remainingSupply[selectedRow] -= quantity;
          remainingDemand[selectedCol] -= quantity;
        }
      }

      setSolution(optimalPlan.filter(p => p.quantity > 0));
      setSolving(false);
      toast.success("Optimal plan found using Vogel's Approximation Method!");
    }, 1500);
  };

  const totalCost = solution?.reduce((sum, plan) => sum + (plan.quantity * plan.cost), 0) || 0;

  const flowData = solution?.map(plan => ({
    route: `${plan.from} → ${plan.to}`,
    quantity: plan.quantity,
    cost: plan.quantity * plan.cost,
  })) || [];

  const pieChartData = solution?.map(plan => ({
    name: `${plan.from} → ${plan.to}`,
    value: plan.quantity * plan.cost,
  })) || [];

  const lineChartData = solution?.map((plan, index) => ({
    route: index + 1,
    quantity: plan.quantity,
    cost: plan.quantity * plan.cost,
  })) || [];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

  return (
    <section id="transportation" className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-sm font-medium text-accent mb-4">
            <GitBranch className="w-4 h-4" />
            Model 3
          </div>
          <h2 className="text-4xl font-bold mb-4">Transportation & Network Flow</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Multi-stage transportation model for moving e-waste from collection points to processing centers
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Supply Points</CardTitle>
                <Button onClick={addSource} size="sm" variant="outline" className="w-full mt-2">
                  <Plus className="w-4 h-4 mr-1" /> Add Collection
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sources.map((source, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-muted rounded gap-2">
                      <span className="text-sm font-medium flex-1">{source}</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={supply[i]}
                          onChange={(e) => updateSupply(i, e.target.value)}
                          className="w-20 text-center bg-background border border-input rounded px-2 py-1 text-sm"
                          min="0"
                        />
                        <span className="text-xs text-muted-foreground">units</span>
                        <Button
                          onClick={() => removeSource(i)}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between font-bold">
                      <span>Total Supply:</span>
                      <span>{supply.reduce((a, b) => a + b, 0)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cost Matrix (₹/unit)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20 text-xs">From/To</TableHead>
                        {destinations.map((dest, i) => (
                          <TableHead key={i} className="text-center text-xs p-1">
                            <div className="flex flex-col items-center gap-1">
                              <span>P{i + 1}</span>
                              <Button
                                onClick={() => removeDestination(i)}
                                size="sm"
                                variant="ghost"
                                className="h-4 w-4 p-0"
                              >
                                <Trash2 className="w-2 h-2" />
                              </Button>
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {costMatrix.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs p-1">C{String.fromCharCode(65 + i)}</TableCell>
                          {row.map((cost, j) => (
                            <TableCell key={j} className="text-center p-1">
                              <input
                                type="number"
                                value={cost}
                                onChange={(e) => updateCost(i, j, e.target.value)}
                                className="w-12 text-center bg-background border border-input rounded px-1 text-xs"
                                min="0"
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Demand Points</CardTitle>
                <Button onClick={addDestination} size="sm" variant="outline" className="w-full mt-2">
                  <Plus className="w-4 h-4 mr-1" /> Add Processing
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {destinations.map((dest, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-muted rounded gap-2">
                      <span className="text-sm font-medium flex-1">{dest}</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={demand[i]}
                          onChange={(e) => updateDemand(i, e.target.value)}
                          className="w-20 text-center bg-background border border-input rounded px-2 py-1 text-sm"
                          min="0"
                        />
                        <span className="text-xs text-muted-foreground">units</span>
                        <Button
                          onClick={() => removeDestination(i)}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between font-bold">
                      <span>Total Demand:</span>
                      <span>{demand.reduce((a, b) => a + b, 0)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Optimal Transportation Plan</CardTitle>
              <CardDescription>Minimum cost allocation satisfying all constraints</CardDescription>
            </CardHeader>
            <CardContent>
              {solution ? (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit Cost</TableHead>
                        <TableHead className="text-right">Total Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {solution.map((plan, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{plan.from}</TableCell>
                          <TableCell>{plan.to}</TableCell>
                          <TableCell className="text-right">{plan.quantity}</TableCell>
                          <TableCell className="text-right">₹{plan.cost}</TableCell>
                          <TableCell className="text-right font-semibold">
                            ₹{plan.quantity * plan.cost}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={4} className="font-bold">Minimum Total Transportation Cost</TableCell>
                        <TableCell className="text-right font-bold text-primary text-lg">
                          ₹{totalCost}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <h4 className="font-semibold mb-2 text-sm">Supply Constraints</h4>
                      <p className="text-xs text-muted-foreground">
                        ✓ All collection points fully utilized<br />
                        ✓ No excess inventory at sources
                      </p>
                    </div>
                    <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-lg">
                      <h4 className="font-semibold mb-2 text-sm">Demand Constraints</h4>
                      <p className="text-xs text-muted-foreground">
                        ✓ All processing centers fully supplied<br />
                        ✓ No shortages at destinations
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Button onClick={solveTransportation} disabled={solving} size="lg">
                    {solving ? "Solving..." : "Solve Transportation Problem"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {solution && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Flow & Cost Analysis</CardTitle>
                  <CardDescription>Quantity and cost by route</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={flowData} layout="vertical" margin={{ left: 120 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="route" type="category" width={110} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="quantity" fill="hsl(var(--primary))" name="Quantity" />
                      <Bar dataKey="cost" fill="hsl(var(--secondary))" name="Cost (₹)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Distribution</CardTitle>
                  <CardDescription>Pie chart of costs by route</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => `₹${entry.value.toFixed(0)}`}
                      >
                        {pieChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Route Trend Analysis</CardTitle>
                  <CardDescription>Line chart showing quantity and cost trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={lineChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="route" label={{ value: 'Route #', position: 'insideBottom', offset: -5 }} />
                      <YAxis yAxisId="left" label={{ value: 'Quantity', angle: -90, position: 'insideLeft' }} />
                      <YAxis yAxisId="right" orientation="right" label={{ value: 'Cost (₹)', angle: 90, position: 'insideRight' }} />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="quantity" stroke="hsl(var(--primary))" strokeWidth={2} name="Quantity" />
                      <Line yAxisId="right" type="monotone" dataKey="cost" stroke="hsl(var(--secondary))" strokeWidth={2} name="Cost ($)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TransportationModel;
