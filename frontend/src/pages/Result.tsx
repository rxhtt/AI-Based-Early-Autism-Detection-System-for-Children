import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Download, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Result() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [screening, setScreening] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:8000/screenings/${id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setScreening(data))
    .catch(console.error);
  }, [id]);

  if (!screening) return <div className="animate-pulse">Loading result...</div>;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-red-50 text-red-700 border-red-200';
      case 'Moderate': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'High': return <AlertCircle className="w-8 h-8 text-red-600 mb-2" />;
      case 'Moderate': return <AlertCircle className="w-8 h-8 text-amber-600 mb-2" />;
      default: return <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-2" />;
    }
  };

  // Aggregate section scores from answers for chart
  const sections = {
    Communication: 0,
    Social: 0,
    Repetitive: 0,
    Sensory: 0,
    Developmental: 0
  };
  screening.answers.forEach((ans: any) => {
    if (ans.section === 'communication') sections.Communication += ans.weighted_score;
    if (ans.section === 'social') sections.Social += ans.weighted_score;
    if (ans.section === 'repetitive') sections.Repetitive += ans.weighted_score;
    if (ans.section === 'sensory') sections.Sensory += ans.weighted_score;
    if (ans.section === 'developmental') sections.Developmental += ans.weighted_score;
  });

  const chartData = Object.keys(sections).map(key => ({
    name: key,
    score: sections[key as keyof typeof sections]
  }));

  const handlePrint = () => {
    window.location.href = `http://localhost:8000/reports/${id}/pdf`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 print:m-0 print:p-0">
      <div className="flex justify-between items-start print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Clinical Report</h1>
          <p className="text-zinc-500 text-sm mt-1">Screening ID: {screening.id} • Date: {new Date(screening.screening_date).toLocaleDateString()}</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          <Button onClick={handlePrint} className="bg-zinc-900 text-white hover:bg-zinc-800"><Download className="w-4 h-4 mr-2" /> Export PDF</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className={`border-2 ${getRiskColor(screening.risk_level)} shadow-sm`}>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              {getRiskIcon(screening.risk_level)}
              <h2 className="text-2xl font-bold">{screening.risk_level} Risk</h2>
              <p className="text-sm opacity-80 mt-1">Total Score: {screening.total_score}</p>
              
              <div className="w-full mt-6 bg-white/50 rounded flex justify-between p-3 border border-black/10">
                <span className="text-xs font-semibold opacity-70">CONFIDENCE</span>
                <span className="font-bold">{screening.confidence_score}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200">
            <CardHeader className="pb-3 border-b border-zinc-100">
              <CardTitle className="text-sm">Clinical Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <p className="text-sm leading-relaxed text-zinc-700">{screening.summary}</p>
              
              <div>
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Recommendation</h4>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-md text-sm text-blue-800 font-medium">
                  {screening.recommendation}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-zinc-200 h-[380px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Risk Assessment Dimensions</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-6 w-full">
              <ResponsiveContainer width={"100%"} height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{fontSize: 12, fill: '#71717a'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 12, fill: '#71717a'}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f4f4f5'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score > 8 ? '#dc2626' : entry.score > 4 ? '#d97706' : '#2563eb'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-zinc-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Primary Flagged Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {screening.answers.filter((a: any) => a.weighted_score > 0).sort((a: any, b: any) => b.weighted_score - a.weighted_score).slice(0, 5).map((ans: any) => (
                  <div key={ans.id} className="flex justify-between items-center p-3 rounded-md bg-zinc-50 border border-zinc-100">
                    <div>
                      <p className="text-sm font-medium text-zinc-900 capitalize">{ans.question_code.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-zinc-500 capitalize">{ans.section} Profile</p>
                    </div>
                    <div className="text-sm font-bold text-zinc-700 bg-white px-2 py-1 border rounded shadow-sm">
                      +{ans.weighted_score}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
