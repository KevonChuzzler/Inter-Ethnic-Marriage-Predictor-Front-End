import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Dices, User, Users, MapPin, Languages, Loader2 } from 'lucide-react';

const LANGUAGES = ['isiZulu', 'isiXhosa', 'Afrikaans', 'English', 'Sepedi', 'Setswana', 'Sesotho', 'Xitsonga', 'Siswati', 'Tshivenda', 'Isindebele'];
const PROVINCES = ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape'];

type FormData = {
  sex: 'Male' | 'Female' | '';
  age: number;
  language: string;
  province: string;
};

const PrivacyModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-neutral-900/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-xl">
      <h2 className="text-xl font-bold mb-4">Privacy & Compliance</h2>
      <p className="mb-4 text-neutral-600 text-sm">
        This application is purely informational. No personal data is collected, stored, or processed, ensuring full compliance with the Protection of Personal Information Act (POPIA) and the Electronic Communications and Transactions Act (ECTSA).
      </p>
      <p className="mb-6 text-sm text-neutral-600">
        Developed by <a href="https://ksdigitalsolutionz.co.za" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">KS Digital Solutionz</a>.
      </p>
      <button onClick={onClose} className="w-full bg-blue-600 text-white py-2 rounded-xl font-medium">Accept</button>
      <p className="mt-4 text-xs text-center text-neutral-400">
        Created by <a href="https://ksdigitalsolutionz.co.za" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">KS Digital Solutionz</a>
      </p>
    </div>
  </div>
);

const Footer = () => (
  <footer className="mt-12 py-6 text-center text-sm text-neutral-400">
    Created by <a href="https://ksdigitalsolutionz.co.za" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">KS Digital Solutionz</a>
  </footer>
);

export default function App() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({ sex: '', age: 25, language: '', province: '' });
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('privacyAccepted')) {
      setShowPrivacyModal(true);
    }
  }, []);

  const handlePredict = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Prediction failed');
      const result = await response.json();
      setPrediction(result);
      setStep(5);
    } catch (e) {
      setError('Failed to fetch prediction. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const surpriseMe = () => {
    const randomData: FormData = {
      sex: Math.random() > 0.5 ? 'Male' : 'Female',
      age: Math.floor(Math.random() * (100 - 18 + 1)) + 18,
      language: LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)],
      province: PROVINCES[Math.floor(Math.random() * PROVINCES.length)],
    };
    setFormData(randomData);
    handlePredict(randomData);
  };

  const steps = [
    { title: 'Gender', icon: User },
    { title: 'Age', icon: Users },
    { title: 'Language', icon: Languages },
    { title: 'Province', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8 flex flex-col">
      {showPrivacyModal && (
        <PrivacyModal onClose={() => {
          localStorage.setItem('privacyAccepted', 'true');
          setShowPrivacyModal(false);
        }} />
      )}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-neutral-900">Could there be a zulu on my stoep?</h1>
        <p className="text-neutral-600">Discover your ethnic compatibility</p>
      </header>

      <main className="flex-grow">
        {step < 4 && (
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 flex items-center justify-between">
              {steps.map((s, i) => (
                <div key={i} className={`flex flex-col items-center ${i <= step ? 'text-blue-600' : 'text-neutral-400'}`}>
                  <s.icon className="size-8" />
                  <span className="text-xs font-medium">{s.title}</span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-neutral-200">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="mb-4 text-xl font-semibold">Select your gender</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {['Male', 'Female'].map((g) => (
                        <button key={g} onClick={() => { setFormData(prev => ({ ...prev, sex: g as any })); setStep(1); }} className="p-6 rounded-xl bg-neutral-100 hover:bg-blue-100 border-2 border-transparent hover:border-blue-500 transition">
                          {g}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="mb-4 text-xl font-semibold">Select your age: {formData.age}</h2>
                    <input type="range" min="18" max="100" value={formData.age} onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))} className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    <button onClick={() => setStep(2)} className="mt-6 w-full bg-blue-600 text-white py-2 rounded-xl font-medium hover:bg-blue-700 transition">Next</button>
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="mb-4 text-xl font-semibold">Select your language</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {LANGUAGES.map(lang => (
                        <button key={lang} onClick={() => { setFormData(prev => ({ ...prev, language: lang })); setStep(3); }} className={`p-2 rounded-lg border ${formData.language === lang ? 'bg-blue-600 text-white' : 'bg-neutral-100'}`}>{lang}</button>
                      ))}
                    </div>
                  </motion.div>
                )}
                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="mb-4 text-xl font-semibold">Select your province</h2>
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
                      <p className="font-semibold mb-1">📍 Why do we need your province?</p>
                      <p>Demographics and migration patterns change drastically depending on where you live! Economic hubs like Gauteng and the Western Cape are massive cultural melting pots, while other regions have distinct local communities. Your province anchors the model to real-world regional statistics so the predictions match your actual surroundings.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {PROVINCES.map(prov => (
                        <button key={prov} onClick={() => { setFormData(prev => ({ ...prev, province: prov })); handlePredict({ ...formData, province: prov }); }} className="p-2 rounded-lg border bg-neutral-100 hover:bg-blue-50">{prov}</button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {step > 0 && step < 4 && (
                <div className="mt-8">
                  <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-neutral-600"><ChevronLeft /> Back</button>
                </div>
              )}
            </div>
            <div className="mt-6 text-center">
              <button onClick={surpriseMe} className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-full hover:bg-neutral-800 transition"><Dices size={18} /> Surprise Me</button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2 className="animate-spin size-12 text-blue-600" />
            <p className="text-lg font-medium">Predicting your destiny...</p>
          </div>
        )}

        {step === 5 && prediction && Array.isArray(prediction) && (
          <div className="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-sm border border-neutral-200">
            <h2 className="text-2xl font-bold mb-6">Your Results</h2>
            <ul className="space-y-3">
              {prediction.map((item: any, i: number) => (
                <li key={i} className={`p-3 rounded-lg flex justify-between ${i === 0 ? 'bg-amber-100 border-2 border-amber-400' : 'bg-neutral-50'}`}>
                  <span>{item.ethnicity}</span>
                  <span className="font-bold">{item.probability}% {i === 0 && '🏆'}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => { setStep(0); setPrediction(null); }} className="mt-8 w-full py-3 bg-blue-600 text-white rounded-xl">Try Another Combo</button>
          </div>
        )}

        {error && <div className="text-center text-red-600 p-4">{error}</div>}
      </main>

      <Footer />
    </div>
  );
}
