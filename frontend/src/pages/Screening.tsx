import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ChevronRight, Save } from 'lucide-react';
import { Label } from '../components/ui/label';

const SECTIONS = [
  {
    id: "communication", title: "Communication", questions: [
      { code: "delayed_speech", label: "Delayed speech relative to age milestones" },
      { code: "limited_eye_contact", label: "Limited or absent eye contact during social interaction" },
      { code: "does_not_respond_to_name", label: "Does not consistently respond to their name" },
      { code: "difficulty_expressing_needs", label: "Difficulty expressing needs verbally or non-verbally" }
    ]
  },
  {
    id: "social", title: "Social Interaction", questions: [
      { code: "poor_peer_interaction", label: "Poor interaction with peers or siblings" },
      { code: "lack_of_shared_interest", label: "Cannot engage in shared activities or point out objects" },
      { code: "avoids_social_contact", label: "Actively avoids social contact or prefers to be alone" },
      { code: "limited_facial_expression_response", label: "Limited response to others' facial expressions" }
    ]
  },
  {
    id: "repetitive", title: "Repetitive Behaviors", questions: [
      { code: "repetitive_hand_movements", label: "Displays repetitive hand movements (flapping)" },
      { code: "strict_routine_dependence", label: "Exhibits strong dependence on routines" },
      { code: "fixated_interests", label: "Highly restricted, fixated interests" },
      { code: "repetitive_object_use", label: "Repetitive use of objects (lining up toys)" }
    ]
  },
  {
    id: "sensory", title: "Sensory Responses", questions: [
      { code: "sound_sensitivity", label: "Extreme sensitivity to specific sounds" },
      { code: "texture_sensitivity", label: "Aversion to specific textures (food, clothing)" },
      { code: "unusual_visual_fixation", label: "Unusual visual fixation on moving objects" },
      { code: "overreaction_to_environment", label: "Overreaction to changes in the environment" }
    ]
  },
  {
    id: "developmental", title: "Developmental Milestones", questions: [
      { code: "delayed_milestones", label: "Overall delay in motor or cognitive milestones" },
      { code: "regression_of_skills", label: "Apparent loss of previously acquired skills" },
      { code: "sleep_behavior_irregularity", label: "Significant irregularity in sleep patterns" },
      { code: "feeding_difficulty", label: "Extreme feeding difficulties or highly restricted diet" }
    ]
  }
];

export default function Screening() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8000/patients/${id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setPatient(data))
    .catch(console.error);
  }, [id]);

  const handleAnswer = (code: string, val: number) => {
    setAnswers(prev => ({ ...prev, [code]: val }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const answersList = Object.keys(answers).map(code => ({
      question_code: code,
      section: SECTIONS.find(s => s.questions.some(q => q.code === code))?.id || "unknown",
      answer_value: answers[code]
    }));

    try {
      const res = await fetch('http://localhost:8000/screenings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          patient_id: parseInt(id!),
          answers: answersList,
          status: "Completed"
        })
      });
      const data = await res.json();
      navigate(`/screenings/${data.id}/result`);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!patient) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Clinical Assessment</h1>
          <p className="text-zinc-500 text-sm mt-1">Patient: {patient.child_name} ({patient.age_months}m) • ID: {patient.patient_code}</p>
        </div>
      </div>

      <div className="space-y-8">
        {SECTIONS.map((section, idx) => (
          <Card key={section.id} className="border-zinc-200 overflow-hidden shadow-sm">
            <div className="bg-zinc-100 border-b border-zinc-200 px-6 py-3 font-semibold text-zinc-800 text-sm flex items-center">
              <span className="w-6 h-6 rounded bg-zinc-200 text-zinc-600 flex items-center justify-center mr-3 text-xs">{idx + 1}</span>
              {section.title}
            </div>
            <CardContent className="divide-y divide-zinc-100 p-0">
              {section.questions.map(q => (
                <div key={q.code} className="p-6 md:flex justify-between items-center hover:bg-zinc-50/50 transition-colors">
                  <div className="mb-4 md:mb-0 md:pr-8 md:w-1/2 text-sm font-medium text-zinc-700">
                    {q.label}
                  </div>
                  <div className="flex space-x-2 md:w-1/2 justify-end">
                    {[
                      { val: 0, label: "No / Never", color: "hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200" },
                      { val: 1, label: "Rarely", color: "hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200" },
                      { val: 2, label: "Often", color: "hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200" },
                      { val: 3, label: "Consistent", color: "hover:bg-red-50 hover:text-red-700 hover:border-red-200" },
                    ].map(opt => {
                      const selected = answers[q.code] === opt.val;
                      const activeColor = 
                         opt.val === 0 ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                         opt.val === 1 ? "bg-amber-100 text-amber-800 border-amber-200" :
                         opt.val === 2 ? "bg-orange-100 text-orange-800 border-orange-200" :
                         "bg-red-100 text-red-800 border-red-200";

                      return (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => handleAnswer(q.code, opt.val)}
                          className={`px-3 py-2 text-xs font-medium border rounded-md transition-all flex-1 text-center ${
                            selected 
                              ? activeColor 
                              : `bg-white text-zinc-600 border-zinc-200 ${opt.color}`
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center px-4 md:px-0">
          <div className="text-sm font-medium text-zinc-500">
             {Object.keys(answers).length} of 20 answered
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={Object.keys(answers).length < 20 || loading}
            onClick={handleSubmit}
          >
            {loading ? "Processing..." : "Generate Clinical Report"} 
            {!loading && <ChevronRight className="ml-2 w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
