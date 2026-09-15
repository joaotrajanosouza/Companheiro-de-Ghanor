import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Dices, Volume2, VolumeX, FastForward, Play } from 'lucide-react';
import { useGame } from '@/lib/store';
import { motion } from 'framer-motion';

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

interface DieProps {
  value: number;
  index: 0 | 1;
  rolling: boolean;
}

const pipPositions: Record<number, number[]> = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
};

const faceTransforms: Record<number, string> = {
  1: 'rotateY(0deg) translateZ(2rem)',
  2: 'rotateX(90deg) translateZ(2rem)',
  3: 'rotateY(90deg) translateZ(2rem)',
  4: 'rotateY(-90deg) translateZ(2rem)',
  5: 'rotateX(-90deg) translateZ(2rem)',
  6: 'rotateY(180deg) translateZ(2rem)',
};

const orientations: Record<number, { rotateX: number; rotateY: number }> = {
  1: { rotateX: 0, rotateY: 0 },
  2: { rotateX: -90, rotateY: 0 },
  3: { rotateX: 0, rotateY: -90 },
  4: { rotateX: 0, rotateY: 90 },
  5: { rotateX: 90, rotateY: 0 },
  6: { rotateX: 0, rotateY: 180 },
};

function DieFace({ value }: { value: number }) {
  return (
    <div
      className="absolute inset-0 grid grid-cols-3 grid-rows-3 rounded-[0.85rem] border border-border bg-background/95 p-2 shadow-[inset_0_0_0.8rem_hsl(var(--card)),inset_0_1px_0_hsla(0,0%,100%,0.45)] [backface-visibility:hidden]"
      style={{ transform: faceTransforms[value] }}
    >
      {pipPositions[value].map((position) => (
        <span
          key={position}
          className="m-auto h-2.5 w-2.5 rounded-full bg-foreground shadow-[inset_0_1px_2px_rgba(255,255,255,0.18),0_1px_1px_rgba(0,0,0,0.3)]"
          style={{ gridArea: `${Math.ceil(position / 3)} / ${((position - 1) % 3) + 1}` }}
        />
      ))}
    </div>
  );
}

function Die({ value, index, rolling }: DieProps) {
  const orientation = orientations[value];
  const direction = index === 0 ? 1 : -1;

  return (
    <motion.div
      className="relative h-16 w-16"
      aria-label={`Dado ${index + 1}: ${value}`}
      animate={{
        y: rolling ? [0, -30 - index * 8, 4, -9, 0] : 0,
        scale: rolling ? [1, 1.08, 0.97, 1.02, 1] : 1,
      }}
      transition={{ duration: rolling ? 0.8 : 0, ease: 'easeOut' }}
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        animate={
          rolling
            ? {
                rotateX: [
                  orientation.rotateX,
                  orientation.rotateX + 390 * direction,
                  orientation.rotateX + 750 * direction,
                  orientation.rotateX + 1080 * direction,
                ],
                rotateY: [
                  orientation.rotateY,
                  orientation.rotateY + 480 * direction,
                  orientation.rotateY + 840 * direction,
                  orientation.rotateY + 1080 * direction,
                ],
                rotateZ: [0, 35 * direction, -18 * direction, 0],
              }
            : { ...orientation, rotateZ: 0 }
        }
        transition={{ duration: rolling ? 0.8 : 0, ease: [0.22, 0.8, 0.3, 1] }}
      >
        {[1, 2, 3, 4, 5, 6].map((face) => (
          <DieFace key={face} value={face} />
        ))}
      </motion.div>
      <div
        aria-hidden="true"
        className="absolute -bottom-5 left-1/2 h-3 w-14 -translate-x-1/2 rounded-full bg-foreground/20 blur-md"
      />
    </motion.div>
  );
}

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
  const rollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (rollTimer.current) clearTimeout(rollTimer.current);
    };
  }, []);

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

    setD1(finalD1);
    setD2(finalD2);
    setRolling(true);
    rollTimer.current = setTimeout(() => {
      setRolling(false);
      onRoll(finalD1, finalD2);
      rollTimer.current = null;
    }, 800);
  };

  return (
    <div className="flex flex-col items-center gap-4 bg-card/60 p-6 rounded-xl border border-card-border backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-2 right-2 flex gap-1 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={toggleMute}
          title={muteAudio ? "Ativar som" : "Silenciar som"}
          aria-label={muteAudio ? "Ativar som dos dados" : "Silenciar som dos dados"}
          aria-pressed={muteAudio}
        >
          {muteAudio ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={toggleAnim}
          title={disableAnimations ? "Ativar animações" : "Desativar animações"}
          aria-label={disableAnimations ? "Ativar animação dos dados" : "Desativar animação dos dados"}
          aria-pressed={disableAnimations}
        >
          {disableAnimations ? <Play className="h-4 w-4" /> : <FastForward className="h-4 w-4" />}
        </Button>
      </div>

      <div
        className="mt-5 flex gap-10 pb-5 [perspective:900px]"
        role="group"
        aria-label={`Resultado dos dados: ${d1} e ${d2}`}
        aria-live="polite"
      >
        <Die value={d1} index={0} rolling={rolling} />
        <Die value={d2} index={1} rolling={rolling} />
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
