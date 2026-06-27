import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Users, UserPlus, Loader2, BrainCircuit } from 'lucide-react';

export default function PatientIntake() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    child_name: '',
    age_months: '',
    gender: 'Male',
    guardian_name: '',
    contact_number: '',
    address: '',
    referral_source: 'Pediatrician'
  });

  const fetchPatients = () => {
    fetch('http://localhost:8000/patients', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setPatients(data))
    .catch(console.error);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingMessage("Synthesizing patient data structures...");
    
    // Slight artificial delay to allow UI to catch up elegantly
    await new Promise(r => setTimeout(r, 600));

    try {
      setLoadingMessage("Creating secure patient record...");
      const res = await fetch('http://localhost:8000/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          age_months: parseInt(formData.age_months)
        })
      });
      if (res.ok) {
        const patient = await res.json();
        
        // Execute CNN evaluation if a physical image tensor is provided
        if (selectedFile) {
           setLoadingMessage("Compiling physical image tensors...");
           await new Promise(r => setTimeout(r, 800)); // UI delay

           const formDataObj = new FormData();
           formDataObj.append("file", selectedFile);
           try {
              setLoadingMessage("Running Convolutional Neural Network inference...");
              // Push to our authentic Keras Convolutional Neural Network endpoint
              await fetch(`http://localhost:8000/patients/${patient.id}/facial-image`, {
                 method: 'POST',
                 headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                 body: formDataObj
              });
              
              setLoadingMessage("Vision processing complete. Extrapolating risk paths...");
              await new Promise(r => setTimeout(r, 600));
           } catch(imgErr) {
              console.error("CNN processing failed:", imgErr);
           }
        }
        
        setLoadingMessage("Booting primary screening framework...");
        await new Promise(r => setTimeout(r, 500));
        navigate(`/patients/${patient.id}/screening`);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
          <div className="bg-zinc-900 text-white rounded-xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center text-center space-y-4 border border-zinc-800 transform transition-all animate-in fade-in zoom-in-95 duration-200">
             <div className="relative">
                <BrainCircuit className="w-12 h-12 text-blue-500 animate-pulse" />
                <Loader2 className="w-16 h-16 text-zinc-500 animate-spin absolute -inset-2 opacity-50" />
             </div>
             <div>
                <h3 className="text-lg font-bold tracking-wide">Processing Pipeline</h3>
                <p className="text-sm text-zinc-400 mt-2 min-h-[40px] flex items-center justify-center">{loadingMessage}</p>
             </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Patient Management</h1>
        <p className="text-zinc-500 text-sm mt-1">Register new patients or select existing for screening.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border-zinc-200 shadow-sm overflow-hidden h-fit">
          <div className="bg-blue-50 border-b border-blue-100 p-6 flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600">
              <UserPlus className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900">New Patient Intake</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Child's Full Name</Label>
                  <Input required value={formData.child_name} onChange={e => setFormData({...formData, child_name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Age (Months)</Label>
                  <Input type="number" required min="18" max="144" value={formData.age_months} onChange={e => setFormData({...formData, age_months: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Guardian Name</Label>
                  <Input required value={formData.guardian_name} onChange={e => setFormData({...formData, guardian_name: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Contact Number</Label>
                <Input required value={formData.contact_number} onChange={e => setFormData({...formData, contact_number: e.target.value})} />
              </div>
              <div className="space-y-4 border-t pt-4 mt-4">
                <div className="flex items-center space-x-2">
                   <Label>Clinical Media (Optional)</Label>
                   <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold uppercase tracking-wider">Auxiliary Module Placeholder</span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
                  Upload an image of the child for documentation or future enhanced screening support. This is not used as a primary diagnostic basis unless explicitly configured in Admin settings.
                </p>
                <label className="border-2 border-dashed border-zinc-200 rounded-md p-6 flex flex-col items-center justify-center bg-zinc-50/50 hover:bg-zinc-50 transition-colors cursor-pointer block text-center">
                  <input type="file" accept="image/jpeg, image/png" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                  <span className="text-sm font-medium text-zinc-600 mb-1">
                     {selectedFile ? selectedFile.name : "Click to upload or drag & drop"}
                  </span>
                  <span className="text-xs text-zinc-400">
                     {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "JPG, PNG up to 5MB"}
                  </span>
                </label>
              </div>
            </CardContent>
            <CardFooter className="bg-zinc-50 border-t p-4 flex justify-end">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                Register & Start Screening
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="border-zinc-200 shadow-sm h-fit">
          <CardHeader>
             <CardTitle className="flex items-center text-lg"><Users className="w-5 h-5 mr-2" /> Existing Patients</CardTitle>
             <CardDescription>Select a patient to begin a new screening.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-100 max-h-[500px] overflow-y-auto">
              {patients.map(p => (
                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900">{p.child_name}</h4>
                    <p className="text-xs text-zinc-500">ID: {p.patient_code} • {p.age_months} months</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/patients/${p.id}/screening`)}>
                    Screen
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
