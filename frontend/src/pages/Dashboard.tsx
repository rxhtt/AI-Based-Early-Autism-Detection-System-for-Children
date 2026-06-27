import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Users, FileText, AlertTriangle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/dashboard/summary', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => {
      if(res.status === 401) navigate('/login');
      return res.json();
    })
    .then(data => setSummary(data))
    .catch(console.error);
  }, [navigate]);

  if (!summary) return <div className="animate-pulse flex space-x-4">Loading clinical data...</div>;

  const stats = [
    { title: 'Total Active Cases', value: summary.total_active_cases, icon: Users, color: 'text-blue-600' },
    { title: 'Screenings This Week', value: summary.new_screenings_this_week, icon: FileText, color: 'text-emerald-600' },
    { title: 'High-Risk Alerts', value: summary.high_risk_cases, icon: AlertTriangle, color: 'text-red-600' },
    { title: 'Pending Reviews', value: summary.pending_reviews, icon: Clock, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto cursor-default">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Clinical Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">Overview of patient screenings and priority alerts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-zinc-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600">{stat.title}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.recent_activity?.length === 0 && (
                <p className="text-sm text-zinc-500">No recent activity.</p>
              )}
              {summary.recent_activity?.map((act: any) => (
                <div key={act.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-zinc-900 text-sm">{act.patient_name}</p>
                    <p className="text-xs text-zinc-500">{new Date(act.date).toLocaleDateString()}</p>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                    act.risk_level === 'High' ? 'bg-red-100 text-red-700' : 
                    act.risk_level === 'Moderate' ? 'bg-amber-100 text-amber-700' : 
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {act.risk_level} Risk
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
