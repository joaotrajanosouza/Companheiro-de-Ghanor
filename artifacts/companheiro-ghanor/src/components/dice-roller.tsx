import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Dices, Volume2, VolumeX, FastForward, Play } from 'lucide-react';
import { useGame } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

export function playDiceSound(volume: number = 0.5) {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Wood/table impact
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(150, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
    gain1.gain.setValueAtTime(volume, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.1);

    // Rolling rattle
    const bufferSize = ctx.sampleRate * 0.25;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1000;
    const noiseGain = ctx.createGain();
    
    // Rattle envelope
    noiseGain.gain.setValueAtTime(0, ctx.currentTime);
    noiseGain.gain.linearRampToValueAtTime(volume * 0.8, ctx.currentTime + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    noise.start();
    
  } catch (e) {
    console.error('Audio failed', e);
  }
}

interface DiceFaceProps {
  value: number;
}

const DiceFace: React.FC<DiceFaceProps> = ({ value }) => {
  const pips = Array.from({ length: value }).map((_, i) => i);
  
  return (
    <div className="w-12 h-12 bg-[#F8F4EB] rounded-xl shadow-[inset_0_-2px_4px_rgba(43,29,20,0.1),0_2px_4px_rgba(43,29,20,0.2)] border border-[#D4C7B3] flex relative overflow-hidden">
      {/* Pip positions based on value */}
      <div className="w-full h-full relative">
        {pips.map((i) => {
          let posClass = "";
          if (value === 1) posClass = "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
          else if (value === 2) {
            if (i === 0) posClass = "top-2 left-2";
            if (i === 1) posClass = "bottom-2 right-2";
          }
          else if (value === 3) {
            if (i === 0) posClass = "top-2 left-2";
            if (i === 1) posClass = "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
            if (i === 2) posClass = "bottom-2 right-2";
          }
          else if (value === 4) {
            if (i === 0) posClass = "top-2 left-2";
            if (i === 1) posClass = "top-2 right-2";
            if (i === 2) posClass = "bottom-2 left-2";
            if (i === 3) posClass = "bottom-2 right-2";
          }
          else if (value === 5) {
            if (i === 0) posClass = "top-2 left-2";
            if (i === 1) posClass = "top-2 right-2";
            if (i === 2) posClass = "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
            if (i === 3) posClass = "bottom-2 left-2";
            if (i === 4) posClass = "bottom-2 right-2";
          }
          else if (value === 6) {
            if (i === 0) posClass = "top-2 left-2";
            if (i === 1) posClass = "top-1/2 left-2 -translate-y-1/2";
            if (i === 2) posClass = "bottom-2 left-2";
            if (i === 3) posClass = "top-2 right-2";
            if (i === 4) posClass = "top-1/2 right-2 -translate-y-1/2";
            if (i === 5) posClass = "bottom-2 right-2";
          }
          
          return (
            <div 
              key={i} 
              className={`absolute w-2.5 h-2.5 rounded-full bg-[#2B1D14] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] ${posClass}`} 
            />
          );
        })}
      </div>
    </div>
  );
};

interface DiceRollerProps {
  onRoll: (d1: number, d2: number) => void;
  rolling: boolean;
  setRolling: (rolling: boolean) => void;
}

export function DiceRoller({ onRoll, rolling, setRolling }: DiceRollerProps) {
  const { state, dispatch } = useGame();
  const { muteAudio, disableAnimations } = state.preferences || { muteAudio: false, disableAnimations: false };
  
  const [d1, setD1] = useState(1);
  const [d2, setD2] = useState(1);

  const toggleMute = () => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: { muteAudio: !muteAudio } });
  };

  const toggleAnim = () => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: { disableAnimations: !disableAnimations } });
  };

  const handleRollClick = () => {
    if (rolling) return;
    
    if (!muteAudio) playDiceSound();
    
    const finalD1 = Math.floor(Math.random() * 6) + 1;
    const finalD2 = Math.floor(Math.random() * 6) + 1;
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const skipAnim = disableAnimations || prefersReducedMotion;

    if (skipAnim) {
      setD1(finalD1);
      setD2(finalD2);
      onRoll(finalD1, finalD2);
      return;
    }

    setRolling(true);
    let rolls = 0;
    const maxRolls = 10;
    const interval = setInterval(() => {
      setD1(Math.floor(Math.random() * 6) + 1);
      setD2(Math.floor(Math.random() * 6) + 1);
      rolls++;
      
      if (rolls >= maxRolls) {
        clearInterval(interval);
        setD1(finalD1);
        setD2(finalD2);
        setRolling(false);
        onRoll(finalD1, finalD2);
      }
    }, 50);
  };

  return (
    <div className="flex flex-col items-center gap-4 bg-card/60 p-6 rounded-xl border border-card-border backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-2 right-2 flex gap-1 z-10">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={toggleMute} title={muteAudio ? "Unmute" : "Mute"}>
          {muteAudio ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={toggleAnim} title={disableAnimations ? "Enable Animations" : "Disable Animations"}>
          {disableAnimations ? <Play className="h-4 w-4" /> : <FastForward className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex gap-6 mt-4 perspective-[1000px]">
        <motion.div
          animate={rolling ? {
            rotateX: [0, 360, 720, 1080],
            rotateY: [0, 180, 360, 720],
            y: [0, -20, 0, -10, 0]
          } : {
            rotateX: 0,
            rotateY: 0,
            y: 0
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <DiceFace value={d1} />
        </motion.div>
        
        <motion.div
          animate={rolling ? {
            rotateX: [0, -360, -720, -1080],
            rotateY: [0, -180, -360, -720],
            y: [0, -25, 0, -15, 0]
          } : {
            rotateX: 0,
            rotateY: 0,
            y: 0
          }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <DiceFace value={d2} />
        </motion.div>
      </div>

      <Button 
        onClick={handleRollClick} 
        disabled={rolling}
        size="lg"
        className="mt-2 font-serif text-lg tracking-wide shadow-lg"
      >
        <Dices className="mr-2 h-5 w-5" />
        Rolar Dados
      </Button>
    </div>
  );
}
