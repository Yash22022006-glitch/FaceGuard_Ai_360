import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Cpu, RefreshCw, AlertTriangle, CheckSquare } from 'lucide-react';
import { DeviceBinding } from '../types';

interface DeviceStatusTermProps {
  devices: DeviceBinding[];
  onBindDevice: (model: string, os: 'Android' | 'iOS', isTampered: boolean) => void;
  selectedDeviceId: string;
  onSelectDevice: (id: string) => void;
}

export default function DeviceStatusTerm({
  devices,
  onBindDevice,
  selectedDeviceId,
  onSelectDevice,
}: DeviceStatusTermProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [cpuUsage, setCpuUsage] = useState(24);
  const [ramFree, setRamFree] = useState(3.4); // GB
  const [modelStatus, setModelStatus] = useState<'LOADING' | 'READY'>('READY');
  const [newModel, setNewModel] = useState('');
  const [newOS, setNewOS] = useState<'Android' | 'iOS'>('Android');
  const [newTamper, setNewTamper] = useState(false);

  useEffect(() => {
    // Generate dynamic terminal logic
    const initialLogs = [
      `[SYS OK] Initializing FaceGuard Edge AI micro-kernel...`,
      `[SYS OK] Checking secure Android Keystore / iOS Keychain access`,
      `[MODEL] Loading model BlazeFace.tflite [14.8MB / 2.1ms quantization]`,
      `[MODEL] Loading model MobileFaceNet.tflite [11.2MB / 8.4ms quantization]`,
      `[MODEL] Loading model FaceMesh.tflite [4.8MB / 3.2ms landmarks]`,
      `[SYS OK] Edge AI Footprint: 20.8 MB models loaded in 280ms cached RAM.`,
      `[BND OK] Local Device Binding active -> Device ID: DEV-M31S verified.`
    ];
    setLogs(initialLogs);

    const interval = setInterval(() => {
      // Dynamic stats variation
      setCpuUsage(prev => Math.max(12, Math.min(88, prev + Math.floor(Math.random() * 15) - 7)));
      setRamFree(prev => Math.max(2.8, Math.min(3.8, prev + (Math.random() * 0.2 - 0.1))));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const addLogStr = (str: string) => {
    setLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] ${str}`]);
  };

  const selectedDevice = devices.find(d => d.id === selectedDeviceId);

  const handleDeviceBindSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel) return;
    onBindDevice(newModel, newOS, newTamper);
    addLogStr(`NEW BIND: Registered standard device binding for '${newModel}' (${newOS})`);
    if (newTamper) {
      addLogStr(`SECURITY FAILURE: Device binding '${newModel}' flagged for rooting/compromise! Integrity audit alert triggered.`);
    } else {
      addLogStr(`SECURITY OK: Hardware ID bound perfectly with full trust authorization.`);
    }
    setNewModel('');
  };

  return (
    <div className="bg-[#121824] rounded-2xl border border-slate-800 p-6 flex flex-col h-full text-slate-100" id="device-term">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${selectedDevice?.isTampered ? 'bg-red-950/40 text-red-400 border border-red-800' : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800'}`}>
            <Shield className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-slate-200">EDGE HARDWARE CONSOLE</h3>
            <p className="text-xs text-slate-400">Security Sandbox & AI Core</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>RAM: {ramFree.toFixed(2)} GB Free</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Device Selection */}
        <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
          <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-medium mb-1.5">ACTIVE BIOMETRIC HARDWARE</label>
          <select 
            className="w-full bg-[#182235] border border-slate-700/80 text-xs py-1.5 px-2.5 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            value={selectedDeviceId}
            onChange={(e) => {
              onSelectDevice(e.target.value);
              const dev = devices.find(d => d.id === e.target.value);
              addLogStr(`HARDWARE SWITCH: Swapped viewport camera input to linked device: ${dev?.model}`);
            }}
          >
            {devices.map(d => (
              <option key={d.id} value={d.id}>
                {d.model} {d.isTampered ? '⚠️ (Tampered)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Vital stats */}
        <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 font-mono text-xs flex flex-col justify-center">
          <div className="flex justify-between items-center mb-1 text-slate-400">
            <span>Model Sandbox Limit:</span>
            <span className="text-cyan-400 font-semibold mb-0.5">25.0 MB</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Edge Model Weight:</span>
            <span className="text-emerald-400 font-semibold">14.8 MB</span>
          </div>
        </div>
      </div>

      {/* Terminal logs */}
      <div className="flex-1 bg-black/70 rounded-xl border border-slate-800/80 p-4 font-mono text-[11px] leading-relaxed overflow-y-auto mb-4 h-48 max-h-52 min-h-[140px]">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 border-b border-slate-950 pb-1.5 mb-2">
          <span>LOGSTREAM // ROOT_INTEGRITY_DAEMON v1.0.4</span>
        </div>
        {logs.map((log, i) => (
          <div 
            key={i} 
            className={`${log.includes('NEW BIND') ? 'text-amber-300' : log.includes('SECURITY FAILURE') || log.includes('Tampered') ? 'text-red-400 font-bold' : log.includes('MODEL') ? 'text-cyan-300' : log.includes('SYS OK') ? 'text-emerald-400' : 'text-slate-300'}`}
          >
            {log}
          </div>
        ))}
      </div>

      {/* Register new hardware binding */}
      <form onSubmit={handleDeviceBindSubmit} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/60">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" /> Register Device Binding
        </h4>
        <div className="flex flex-col gap-2.5">
          <input 
            type="text" 
            placeholder="e.g., iPhone 15 Pro, Pixel 8" 
            required
            className="w-full bg-[#141b2a] border border-slate-700/80 text-xs py-1.5 px-3 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            value={newModel}
            onChange={(e) => setNewModel(e.target.value)}
          />

          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400">Platform OS:</span>
            <div className="flex bg-[#141b2a] rounded-lg p-0.5 border border-slate-800">
              <button 
                type="button"
                onClick={() => setNewOS('Android')}
                className={`text-[10px] px-2.5 py-1 rounded-md transition-all ${newOS === 'Android' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400'}`}
              >
                Android
              </button>
              <button 
                type="button"
                onClick={() => setNewOS('iOS')}
                className={`text-[10px] px-2.5 py-1 rounded-md transition-all ${newOS === 'iOS' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400'}`}
              >
                iOS
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center p-2 rounded-lg bg-red-950/20 border border-red-900/30">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-200 font-medium">Root/Jailbreak Simulator</span>
              <span className="text-[9px] text-red-400/80">Check this to trigger tamper alarms and low-trust ratings</span>
            </div>
            <input 
              type="checkbox" 
              className="accent-red-500 w-3.5 h-3.5 cursor-pointer rounded"
              checked={newTamper}
              onChange={(e) => setNewTamper(e.target.checked)}
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-medium text-xs py-2 rounded-lg transition-all shadow-md shadow-emerald-950/40"
          >
            Bind Biometric Hardware
          </button>
        </div>
      </form>
    </div>
  );
}
