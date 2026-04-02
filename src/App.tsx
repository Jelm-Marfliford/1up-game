import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Brain, 
  Zap, 
  MessageSquare, 
  Map as MapIcon, 
  Sword, 
  Camera, 
  Coffee, 
  Moon, 
  Droplets,
  AlertTriangle,
  TrendingUp,
  User as UserIcon,
  ShieldAlert
} from 'lucide-react';
import { StatBar } from './components/StatBar';
import { Avatar } from './components/Avatar';
import { UserStats, Buff, MoodPost, MoodColor } from './types';
import { getBuddyResponse, analyzeVision } from './services/aiService';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import { translations, Language } from './translations';
import { Settings } from 'lucide-react';

// Initial Mock State
const INITIAL_STATS: UserStats = {
  hp: 85,
  maxHp: 100,
  san: 70,
  maxSan: 100,
  exp: 45,
  level: 1,
  levelTitle: '脆皮萌新 (Crispy Newbie)',
  gold: 250
};

export default function App() {
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'map' | 'quests' | 'settings'>('home');
  const [language, setLanguage] = useState<Language>('zh');
  const t = translations[language];
  const [buffs, setBuffs] = useState<Buff[]>([
    { id: '1', name: '咖啡因充能', type: 'buff', description: '专注力 +20%', icon: 'coffee' }
  ]);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [moodPosts, setMoodPosts] = useState<MoodPost[]>([]);
  const [showVisionModal, setShowVisionModal] = useState<'skin' | 'medicine' | null>(null);
  const [visionResult, setVisionResult] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulated "Sensor" updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        hp: Math.max(0, prev.hp - 0.01), // Passive decay
        san: Math.max(0, prev.san - 0.005)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = (type: 'water' | 'sleep' | 'exercise') => {
    setStats(prev => {
      let newStats = { ...prev };
      if (type === 'water') {
        newStats.hp = Math.min(prev.maxHp, prev.hp + 5);
        newStats.exp += 2;
      } else if (type === 'sleep') {
        newStats.hp = Math.min(prev.maxHp, prev.hp + 20);
        newStats.san = Math.min(prev.maxSan, prev.san + 15);
        newStats.exp += 10;
      } else if (type === 'exercise') {
        newStats.hp = Math.min(prev.maxHp, prev.hp + 10);
        newStats.exp += 15;
        newStats.gold += 5;
      }
      return newStats;
    });
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    const userMsg = { role: 'user', content: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const response = await getBuddyResponse(inputText, stats, language);
    setMessages(prev => [...prev, { role: 'assistant', content: response || '' }]);
    setIsTyping(false);
  };

  const captureVision = async () => {
    if (!videoRef.current || !canvasRef.current || !showVisionModal) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) return;
    
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    
    const base64 = canvasRef.current.toDataURL('image/jpeg');
    setVisionResult('Analyzing pixels...');
    const result = await analyzeVision(base64, showVisionModal, language);
    setVisionResult(result || '');
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowVisionModal(null);
    setVisionResult('');
  };

  const buyItem = (cost: number, name: string) => {
    if (stats.gold >= cost) {
      setStats(prev => ({ ...prev, gold: prev.gold - cost }));
      alert(`${t.purchased} ${name}! (${t.effect}: +10 HP)`);
      setStats(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + 10) }));
    } else {
      alert(t.notEnoughGold);
    }
  };

  return (
    <div className={cn("min-h-screen flex flex-col max-w-md mx-auto relative overflow-hidden", stats.san < 30 && "insanity-mode")}>
      {/* Header */}
      <header className="p-4 border-b-4 border-white flex justify-between items-center bg-black z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-retro-red flex items-center justify-center pixel-border">
            <Heart size={16} className="text-white fill-current" />
          </div>
          <h1 className="font-pixel text-sm tracking-tighter">1UP</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <TrendingUp size={14} className="text-retro-yellow" />
            <span className="font-mono text-lg">LV.{stats.level}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap size={14} className="text-retro-yellow fill-current" />
            <span className="font-mono text-lg">${stats.gold}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-24 space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Avatar Section */}
              <div className="pixel-card text-center">
                <Avatar stats={stats} />
                <h2 className="font-pixel text-xs mt-4 text-retro-yellow">{stats.levelTitle}</h2>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {buffs.map(b => (
                    <div key={b.id} className="px-2 py-1 bg-gray-800 border-2 border-retro-green text-[8px] font-pixel flex items-center gap-1">
                      {b.icon === 'coffee' && <Coffee size={10} />}
                      {b.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats Section */}
              <div className="pixel-card">
                <StatBar label={t.hp} current={Math.round(stats.hp)} max={stats.maxHp} color="bg-retro-red" />
                <StatBar label={t.san} current={Math.round(stats.san)} max={stats.maxSan} color="bg-retro-blue" />
                <StatBar label={t.exp} current={stats.exp} max={100} color="bg-retro-green" />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-4">
                <button onClick={() => handleAction('water')} className="pixel-button flex flex-col items-center gap-1 py-4">
                  <Droplets size={20} />
                  <span className="text-[8px]">{t.drink}</span>
                </button>
                <button onClick={() => handleAction('sleep')} className="pixel-button flex flex-col items-center gap-1 py-4">
                  <Moon size={20} />
                  <span className="text-[8px]">{t.sleep}</span>
                </button>
                <button onClick={() => handleAction('exercise')} className="pixel-button flex flex-col items-center gap-1 py-4">
                  <TrendingUp size={20} />
                  <span className="text-[8px]">{t.move}</span>
                </button>
              </div>

              {/* Vision Tools */}
              <div className="pixel-card space-y-4">
                <h3 className="font-pixel text-[10px]">{t.visionSensors}</h3>
                <div className="flex gap-4">
                  <button 
                    onClick={() => { setShowVisionModal('skin'); startCamera(); }}
                    className="flex-1 pixel-button bg-retro-blue/20 text-retro-blue border-retro-blue flex items-center justify-center gap-2"
                  >
                    <Camera size={16} />
                    <span className="text-[8px]">{t.skinScan}</span>
                  </button>
                  <button 
                    onClick={() => { setShowVisionModal('medicine'); startCamera(); }}
                    className="flex-1 pixel-button bg-retro-yellow/20 text-retro-yellow border-retro-yellow flex items-center justify-center gap-2"
                  >
                    <ShieldAlert size={16} />
                    <span className="text-[8px]">{t.medCheck}</span>
                  </button>
                </div>
              </div>

              {/* Shop Section */}
              <div className="pixel-card space-y-4">
                <h3 className="font-pixel text-[10px]">{t.shop}</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => buyItem(50, t.vitaminG)} className="pixel-button bg-black text-white border-white text-[8px]">
                    {t.vitaminG} ($50)
                  </button>
                  <button onClick={() => buyItem(100, t.revivePotion)} className="pixel-button bg-black text-white border-white text-[8px]">
                    {t.revivePotion} ($100)
                  </button>
                </div>
              </div>

              {/* Warnings */}
              {stats.hp < 30 && (
                <div className="bg-retro-red/20 border-4 border-retro-red p-4 animate-pulse flex items-center gap-4">
                  <AlertTriangle className="text-retro-red" />
                  <p className="font-pixel text-[8px] leading-relaxed">
                    {t.criticalWarning}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col h-[70vh] pixel-card"
            >
              <div className="flex-1 overflow-y-auto space-y-4 p-2 font-mono text-lg">
                {messages.length === 0 && (
                  <div className="text-gray-500 italic text-center mt-10">
                    {t.noMessages}
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[80%] p-3 border-2",
                      m.role === 'user' ? "bg-retro-blue text-black border-white" : "bg-gray-800 text-white border-retro-green"
                    )}>
                      <div className="prose prose-invert text-sm">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && <div className="text-retro-green animate-pulse font-pixel text-[8px]">{t.buddyThinking}</div>}
              </div>
              <div className="mt-4 flex gap-2">
                <input 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && sendMessage()}
                  placeholder={t.typeToBuddy}
                  className="flex-1 bg-black border-2 border-white p-2 font-mono outline-none focus:border-retro-green"
                />
                <button onClick={sendMessage} className="pixel-button">SEND</button>
              </div>
            </motion.div>
          )}

          {activeTab === 'map' && (
            <motion.div key="map" className="space-y-4">
              <div className="pixel-card h-[50vh] relative bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  {/* Grid Lines */}
                  <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                </div>
                <h3 className="absolute top-2 left-2 font-pixel text-[8px] bg-black p-1">{t.campusMoodRadar}</h3>
                
                {/* Mock Mood Dots */}
                {[...Array(10)].map((_, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "absolute w-4 h-4 rounded-full border-2 border-white animate-pulse",
                      i % 3 === 0 ? "bg-retro-red" : i % 3 === 1 ? "bg-retro-green" : "bg-retro-yellow"
                    )}
                    style={{ 
                      left: `${Math.random() * 80 + 10}%`, 
                      top: `${Math.random() * 80 + 10}%` 
                    }}
                  />
                ))}
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full px-4">
                  <div className="pixel-card bg-black/80 text-[8px] font-pixel">
                    {t.highStressLibrary} <br/>
                    {t.aiMusicSuggestion}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <button className="pixel-button bg-retro-green text-black">{t.chill}</button>
                <button className="pixel-button bg-retro-yellow text-black">{t.meh}</button>
                <button className="pixel-button bg-retro-red text-black">{t.stressed}</button>
              </div>
            </motion.div>
          )}

          {activeTab === 'quests' && (
            <motion.div key="quests" className="space-y-4">
              <div className="pixel-card border-retro-red">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-pixel text-xs text-retro-red">{t.bossBattle}</h3>
                  <span className="bg-retro-red text-white px-2 py-1 text-[8px] font-pixel">{t.active}</span>
                </div>
                <p className="text-sm mb-4">{t.examWeekDesc}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px]">
                    <div className="w-4 h-4 border-2 border-white" />
                    <span>{t.deepWork}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <div className="w-4 h-4 border-2 border-white bg-retro-green" />
                    <span className="line-through opacity-50">{t.sleepEarly}</span>
                  </div>
                </div>
              </div>

              <div className="pixel-card border-retro-blue">
                <h3 className="font-pixel text-xs text-retro-blue mb-2">{t.quest1000m}</h3>
                <p className="text-sm">{t.quest1000mDesc}</p>
                <button className="mt-4 w-full pixel-button bg-retro-blue text-black">{t.startTraining}</button>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" className="space-y-6">
              <div className="pixel-card">
                <h3 className="font-pixel text-xs mb-4">{t.settings}</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-pixel text-[10px] mb-2">{t.language}</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setLanguage('zh')}
                        className={cn("flex-1 pixel-button", language === 'zh' ? "bg-retro-green text-black" : "bg-black text-white border-white")}
                      >
                        {t.chinese}
                      </button>
                      <button 
                        onClick={() => setLanguage('en')}
                        className={cn("flex-1 pixel-button", language === 'en' ? "bg-retro-green text-black" : "bg-black text-white border-white")}
                      >
                        {t.english}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-black border-t-4 border-white p-2 flex justify-around z-20">
        <button 
          onClick={() => setActiveTab('home')}
          className={cn("p-3 transition-all", activeTab === 'home' ? "bg-white text-black" : "text-white")}
        >
          <UserIcon size={24} />
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className={cn("p-3 transition-all", activeTab === 'chat' ? "bg-white text-black" : "text-white")}
        >
          <MessageSquare size={24} />
        </button>
        <button 
          onClick={() => setActiveTab('map')}
          className={cn("p-3 transition-all", activeTab === 'map' ? "bg-white text-black" : "text-white")}
        >
          <MapIcon size={24} />
        </button>
        <button 
          onClick={() => setActiveTab('quests')}
          className={cn("p-3 transition-all", activeTab === 'quests' ? "bg-white text-black" : "text-white")}
        >
          <Sword size={24} />
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={cn("p-3 transition-all", activeTab === 'settings' ? "bg-white text-black" : "text-white")}
        >
          <Settings size={24} />
        </button>
      </nav>

      {/* Vision Modal */}
      {showVisionModal && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-pixel text-sm uppercase">{showVisionModal === 'skin' ? t.skinScan : t.medCheck} {t.scanner}</h2>
            <button onClick={stopCamera} className="pixel-button bg-retro-red text-white">X</button>
          </div>
          
          <div className="flex-1 relative pixel-border bg-gray-900 overflow-hidden">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            {/* Scanning Line */}
            <motion.div 
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-retro-green shadow-[0_0_10px_#00ff41] z-10"
            />
          </div>

          <div className="p-4 space-y-4">
            <button onClick={captureVision} className="w-full pixel-button py-4 text-lg">{t.capture}</button>
            {visionResult && (
              <div className="pixel-card bg-gray-800 max-h-48 overflow-y-auto">
                <div className="prose prose-invert text-sm">
                  <ReactMarkdown>{visionResult === 'Analyzing pixels...' ? t.analyzing : visionResult}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
