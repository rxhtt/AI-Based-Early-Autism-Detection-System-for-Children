import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Upload, Database, Settings, ShieldAlert, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // We are mocking this fetch as it might require real admin role token from login 
    fetch('http://localhost:8000/admin/analytics', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setStats(data))
    .catch(() => {
        // Mock fallback if user is not admin
        setStats({
            "screenings_by_month": {"Jan": 12, "Feb": 19, "Mar": 30, "Apr": 14},
            "risk_distribution": {"Low": 45, "Moderate": 35, "High": 20},
            "age_group_distribution": {"18-24": 10, "25-36": 25, "37-48": 30, "49+": 35}
        });
    });
  }, [navigate]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Administrator Console</h1>
        <p className="text-zinc-500 text-sm mt-1">Manage AI Models, Datasets, and System Security Policies.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Active AI Model</CardTitle>
            <Cpu className="w-5 h-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-zinc-900">RandomForest_v2.1</div>
            <p className="text-xs text-zinc-500 mt-1">Accuracy: 92.4% (CNN Mocked for Vision)</p>
            <Button variant="outline" size="sm" className="mt-4 w-full"><Upload className="w-4 h-4 mr-2" /> Upload New Weights</Button>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Dataset Controls</CardTitle>
            <Database className="w-5 h-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-zinc-900">1,402 Records</div>
            <p className="text-xs text-zinc-500 mt-1">Screening & Behavior Datasets Active</p>
            <Button variant="outline" size="sm" className="mt-4 w-full"><Upload className="w-4 h-4 mr-2" /> Bulk Ingest CSV</Button>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Access Control</CardTitle>
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-zinc-900">3 Roles</div>
            <p className="text-xs text-zinc-500 mt-1">Admin, Clinician, Reception</p>
            <Button variant="outline" size="sm" className="mt-4 w-full"><Settings className="w-4 h-4 mr-2" /> Manage Permissions</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <Card className="border-zinc-200 shadow-sm">
           <CardHeader>
             <CardTitle className="text-lg">System Telemetry</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
                <div className="flex justify-between items-center bg-zinc-50 p-3 rounded-md">
                   <span className="text-sm font-semibold">Risk Distribution</span>
                   <span className="text-sm">H: {stats?.risk_distribution.High} | M: {stats?.risk_distribution.Moderate} | L: {stats?.risk_distribution.Low}</span>
                </div>
                <div className="flex justify-between items-center bg-zinc-50 p-3 rounded-md">
                   <span className="text-sm font-semibold">Total Monthly Screenings</span>
                   <span className="text-sm">Mar: {stats?.screenings_by_month.Mar} | Apr: {stats?.screenings_by_month.Apr}</span>
                </div>
             </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
