import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronDown, Dices, User, Users, MapPin, Languages, Loader2, Info, Brain, Database } from 'lucide-react';

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

function getApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();
  if (envUrl) {
    const match = envUrl.match(/https?:\/\/[^\s)\]"',]+/i);
    if (match) {
      return match[0].replace(/\/$/, '');
    }
  }
  return 'https://census-marriage-predictor.onrender.com';
}

export default function App() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({ sex: '', age: 25, language: '', province: '' });
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('privacyAccepted')) {
      setShowPrivacyModal(true);
    }
  }, []);

  const handlePredict = async (data: FormData) => {
    setLoading(true);
    setError(null);
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/predict`;
    console.log('Attempting prediction at:', url);
    console.log('Sending data:', data);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Prediction error response:', errorText);
        throw new Error(`Server returned ${response.status}: ${errorText || response.statusText}`);
      }

      const result = await response.json();
      console.log('Prediction result:', result);

      if (result && result.predictions && typeof result.predictions === 'object') {
        const formattedResult = Object.entries(result.predictions).map(([ethnicity, probability]) => ({
          ethnicity,
          probability: typeof probability === 'number' ? parseFloat(probability.toFixed(2)) : 0
        })).sort((a, b) => b.probability - a.probability);

        setPrediction(formattedResult);
        setStep(5);
      } else if (Array.isArray(result)) {
        setPrediction(result);
        setStep(5);
      } else {
        throw new Error('Unexpected response format received from backend.');
      }
    } catch (e: any) {
      console.error('Caught error during fetch:', e);
      setError(`Prediction request failed: ${e?.message || 'Network error'}. If the server is on a free tier, it may take 30-50s to wake up on first call.`);
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
      <header className="mb-6 text-center max-w-2xl mx-auto w-full">
        <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">Could there be a zulu on my stoep?</h1>
        <p className="text-neutral-600 mt-1 text-sm md:text-base">Discover your ethnic compatibility</p>

        {/* Universal "How it works" button available for all steps & pages */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowMethodology(!showMethodology)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs md:text-sm font-semibold border border-blue-200 shadow-sm transition-all cursor-pointer"
          >
            <Info className="size-4 text-blue-600 shrink-0" />
            <span>How it works</span>
            <ChevronDown className={`size-3.5 text-blue-600 transition-transform duration-200 shrink-0 ${showMethodology ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showMethodology && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -10 }}
                animate={{ height: 'auto', opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden mt-3 text-left"
              >
                <div className="p-5 rounded-2xl bg-white border border-blue-100 shadow-lg text-xs md:text-sm text-neutral-700 space-y-3.5">
                  <div className="flex gap-3 items-start">
                    <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 shrink-0 mt-0.5">
                      <Users className="size-4" />
                    </div>
                    <div>
                      <strong className="text-neutral-900 block font-semibold mb-0.5">What it is</strong>
                      <p className="text-neutral-600 leading-relaxed">Inspired by Mzansi demographic trends, calculating cross-language partner likelihoods across South Africa's diverse communities.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 shrink-0 mt-0.5">
                      <Brain className="size-4" />
                    </div>
                    <div>
                      <strong className="text-neutral-900 block font-semibold mb-0.5">How it works</strong>
                      <p className="text-neutral-600 leading-relaxed">Trained on millions of paired household records from the Stats SA Census, analyzing Sex, Age, Home Language, and Province using a machine learning Random Forest model.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 shrink-0 mt-0.5">
                      <MapPin className="size-4" />
                    </div>
                    <div>
                      <strong className="text-neutral-900 block font-semibold mb-0.5">Why Province matters</strong>
                      <p className="text-neutral-600 leading-relaxed">Highlights how economic hubs and migration patterns shape local demographics and pairing probabilities.</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 text-center text-xs text-neutral-500 font-medium">
                    Made by <a href="https://ksdigitalsolutionz.co.za" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline">KSDigitalSolutionz</a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main className="flex-grow">
        {!loading && step < 4 && (
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
                  <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div>
                      <p className="text-sm md:text-base text-neutral-600 leading-relaxed text-center">
                        Discover the statistical likelihood of partner demographics across South Africa based on real Stats SA Census data.
                      </p>
                    </div>

                    <div>
                      <h2 className="mb-3 text-lg font-semibold text-neutral-900 text-center">Select your gender</h2>
                      <div className="grid grid-cols-2 gap-4">
                        {['Male', 'Female'].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => { setFormData(prev => ({ ...prev, sex: g as any })); setStep(1); }}
                            className="group p-5 rounded-xl bg-neutral-50 hover:bg-blue-50/80 border-2 border-neutral-200 hover:border-blue-500 transition-all flex flex-col items-center justify-center gap-2 text-center cursor-pointer shadow-sm hover:shadow"
                          >
                            <span className="size-11 rounded-full bg-neutral-200/80 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-neutral-700 transition">
                              <User className="size-5" />
                            </span>
                            <span className="font-semibold text-base text-neutral-800 group-hover:text-blue-900 transition">{g}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="mb-4 text-xl font-semibold">Select your age: <span className="text-blue-600 font-bold">{formData.age}</span></h2>
                    <input type="range" min="18" max="100" value={formData.age} onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))} className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    <button onClick={() => setStep(2)} className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition">Next</button>
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="mb-4 text-xl font-semibold">Select your language</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {LANGUAGES.map(lang => (
                        <button key={lang} onClick={() => { setFormData(prev => ({ ...prev, language: lang })); setStep(3); }} className={`p-3 rounded-lg border font-medium text-sm transition ${formData.language === lang ? 'bg-blue-600 text-white border-blue-600' : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200'}`}>{lang}</button>
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
                        <button key={prov} onClick={() => { const nextData = { ...formData, province: prov }; setFormData(nextData); handlePredict(nextData); }} className="p-3 rounded-lg border bg-neutral-100 hover:bg-blue-50 hover:border-blue-300 font-medium text-sm transition">{prov}</button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {step > 0 && step < 4 && (
                <div className="mt-8">
                  <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition"><ChevronLeft size={18} /> Back</button>
                </div>
              )}
            </div>
            <div className="mt-6 text-center">
              <button onClick={surpriseMe} className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-full hover:bg-neutral-800 transition font-medium shadow-md hover:shadow-lg"><Dices size={18} /> Surprise Me</button>
            </div>
          </div>
        )}

        {loading && (
          <div className="mx-auto max-w-md bg-white p-8 rounded-2xl shadow-sm border border-neutral-200 flex flex-col items-center justify-center gap-4 py-12 text-center">
            <Loader2 className="animate-spin size-12 text-blue-600" />
            <div>
              <p className="text-lg font-bold text-neutral-900">Calculating demographic compatibility...</p>
              <p className="text-sm text-neutral-500 mt-1">Connecting to census prediction model.</p>
            </div>
          </div>
        )}

        {step === 5 && prediction && Array.isArray(prediction) && (
          <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">Your Prediction Results</h2>
                <p className="text-sm text-neutral-500">Based on census demographic patterns</p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">Model Output</span>
            </div>

            <ul className="space-y-3">
              {prediction.slice(0, 8).map((item: any, i: number) => (
                <li key={i} className={`p-4 rounded-xl flex items-center justify-between transition ${i === 0 ? 'bg-amber-50 border-2 border-amber-400' : 'bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/60'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`size-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-500 text-white' : 'bg-neutral-200 text-neutral-700'}`}>
                      {i + 1}
                    </span>
                    <span className="font-semibold text-neutral-900">{item.ethnicity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-neutral-900">{item.probability}%</span>
                    {i === 0 && <span className="text-lg">🏆</span>}
                  </div>
                </li>
              ))}
            </ul>

            <button onClick={() => { setStep(0); setPrediction(null); }} className="mt-8 w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition shadow-sm">
              Try Another Combination
            </button>
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-md mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
            <p className="text-red-700 text-sm font-medium mb-3">{error}</p>
            <button onClick={() => handlePredict(formData)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition">
              Retry Prediction
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
