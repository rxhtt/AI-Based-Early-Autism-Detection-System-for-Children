import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Activity } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: "Any", email, password, role: "Any" }), // Simplification for demo
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 selection:bg-blue-100">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 text-zinc-900">
          <div className="w-12 h-12 bg-white shadow-sm border border-zinc-200 rounded-xl flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">AURA Clinical</h1>
          <p className="text-sm text-zinc-500 mt-1 text-center">Autism Spectrum Disorder (ASD) AI<br/>Early Detection System for Children</p>
          <div className="mt-3 px-3 py-1 bg-zinc-100 rounded-full border border-zinc-200">
             <p className="text-xs font-semibold text-zinc-600">Clinical Framework & Development by Rohit Bagewadi</p>
          </div>
        </div>

        <Card className="border-zinc-200 shadow-sm">
          <form onSubmit={handleLogin}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Sign in to your account</CardTitle>
              <CardDescription>Enter your clinical credentials to access patient data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="dr.smith@clinic.com" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required 
                  className="focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required 
                  className="focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <p className="text-center text-xs text-zinc-500 mt-8">
          Enterprise Healthcare Software. Authorized Personnel Only. <br />
          Try admin@clinic.com / admin123 or dr.smith@clinic.com / doctor123
        </p>
      </div>
    </div>
  );
}
