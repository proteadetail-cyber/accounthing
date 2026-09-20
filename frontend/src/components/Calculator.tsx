import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Calculator as CalcIcon, X, Delete } from 'lucide-react';

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ isOpen, onClose }) => {
  const { paperType, glassClass, accentColor } = useTheme();
  const { language } = useLanguage();

  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [memory, setMemory] = useState<number | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // Keyboard Event Listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys if student is typing inside an answer field or textarea
      const targetTag = (e.target as HTMLElement)?.tagName?.toUpperCase();
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        inputDigit(e.key);
      } else if (e.key === '.' || e.key === ',') {
        inputDecimal();
      } else if (e.key === '+') {
        performOperation('+');
      } else if (e.key === '-') {
        performOperation('-');
      } else if (e.key === '*' || e.key === 'x' || e.key === 'X') {
        performOperation('×');
      } else if (e.key === '/') {
        e.preventDefault();
        performOperation('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        performOperation('=');
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'c' || e.key === 'C') {
        clearAll();
      } else if (e.key === '%') {
        calculatePercentage();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, display, equation, waitingForOperand]);

  const clearAll = () => {
    setDisplay('0');
    setEquation('');
    setWaitingForOperand(false);
  };

  const handleBackspace = () => {
    if (waitingForOperand) return;
    if (display.length === 1 || (display.length === 2 && display.startsWith('-'))) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const toggleSign = () => {
    const val = parseFloat(display);
    if (isNaN(val)) return;
    setDisplay(String(-val));
  };

  const calculatePercentage = () => {
    const val = parseFloat(display);
    if (isNaN(val)) return;
    const res = val / 100;
    setDisplay(String(res));
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (equation === '') {
      if (nextOperator !== '=') {
        setEquation(`${display} ${nextOperator}`);
        setWaitingForOperand(true);
      }
      return;
    }

    const parts = equation.split(' ');
    const prevValue = parseFloat(parts[0]);
    const operator = parts[1];

    if (isNaN(prevValue) || !operator) {
      if (nextOperator !== '=') {
        setEquation(`${display} ${nextOperator}`);
        setWaitingForOperand(true);
      }
      return;
    }

    let result = 0;
    switch (operator) {
      case '+': result = prevValue + inputValue; break;
      case '-': result = prevValue - inputValue; break;
      case '×': result = prevValue * inputValue; break;
      case '÷': result = inputValue !== 0 ? prevValue / inputValue : 0; break;
      default: result = inputValue;
    }

    // Round to 4 decimal places max for accounting precision
    result = Math.round(result * 10000) / 10000;

    const record = `${equation} ${display} = ${result}`;
    setHistory(prev => [record, ...prev.slice(0, 9)]);

    setDisplay(String(result));

    if (nextOperator === '=') {
      setEquation('');
      setWaitingForOperand(true);
    } else {
      setEquation(`${result} ${nextOperator}`);
      setWaitingForOperand(true);
    }
  };

  // Memory functions
  const memoryClear = () => setMemory(null);
  const memoryRecall = () => {
    if (memory !== null) {
      setDisplay(String(memory));
      setWaitingForOperand(true);
    }
  };
  const memoryAdd = () => {
    const val = parseFloat(display);
    if (!isNaN(val)) setMemory((memory || 0) + val);
  };
  const memorySub = () => {
    const val = parseFloat(display);
    if (!isNaN(val)) setMemory((memory || 0) - val);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="fixed right-6 top-24 sm:top-28 z-50 w-80 shadow-2xl rounded-3xl overflow-hidden border-2 border-slate-900 bg-[#FAF8F5] text-slate-950"
      >
        {/* EXECUTIVE SLATE HEADER BAR */}
        <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b-2 border-slate-700 shadow-md font-bold cursor-grab active:cursor-grabbing select-none">
          <div className="flex items-center gap-2">
            <CalcIcon className="w-5 h-5 text-amber-400" />
            <span className="font-mono text-xs sm:text-sm tracking-wider text-white font-extrabold uppercase">
              {language === 'af' ? 'REKENINGKUNDE REKENAAR' : 'ACCOUNTING CALCULATOR'}
            </span>
            {memory !== null && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-extrabold">
                M
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
            title="Close Calculator"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Vintage LCD Display Screen */}
        <div className="p-4 bg-[#E2DDD3] border-b-2 border-slate-900 text-right space-y-1 shadow-inner">
          <div className="text-xs font-mono text-slate-700 font-bold h-5 overflow-hidden">
            {equation}
          </div>
          <div className="text-3xl font-mono font-black text-slate-950 tracking-wider overflow-hidden text-ellipsis">
            {display}
          </div>
        </div>

        {/* Executive Memory Bar */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-[#D8D2C5] border-b border-slate-400 text-[11px] font-mono font-extrabold text-slate-900">
          <button onClick={memoryClear} className="py-1 rounded bg-[#E8E3D8] hover:bg-[#CFC8B9] border border-slate-400">MC</button>
          <button onClick={memoryRecall} className="py-1 rounded bg-[#E8E3D8] hover:bg-[#CFC8B9] border border-slate-400">MR</button>
          <button onClick={memoryAdd} className="py-1 rounded bg-[#E8E3D8] hover:bg-[#CFC8B9] border border-slate-400">M+</button>
          <button onClick={memorySub} className="py-1 rounded bg-[#E8E3D8] hover:bg-[#CFC8B9] border border-slate-400">M-</button>
        </div>

        {/* Executive Keypad */}
        <div className="p-3 grid grid-cols-4 gap-2 font-mono font-bold text-sm bg-[#FAF8F5]">
          {/* Row 1 */}
          <button onClick={clearAll} className="p-3 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-black shadow-sm border border-rose-900">C</button>
          <button onClick={handleBackspace} className="p-3 rounded-xl bg-[#E8E3D8] hover:bg-[#D8D2C5] text-slate-950 font-black shadow-sm border border-slate-400 flex items-center justify-center"><Delete className="w-4 h-4" /></button>
          <button onClick={calculatePercentage} className="p-3 rounded-xl bg-[#E8E3D8] hover:bg-[#D8D2C5] text-slate-950 font-black shadow-sm border border-slate-400">%</button>
          <button onClick={() => performOperation('÷')} className="p-3 rounded-xl bg-[#E8E3D8] hover:bg-[#D8D2C5] text-slate-950 font-black shadow-sm border border-slate-400">÷</button>

          {/* Row 2 */}
          <button onClick={() => inputDigit('7')} className="p-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black shadow-sm border border-slate-300">7</button>
          <button onClick={() => inputDigit('8')} className="p-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black shadow-sm border border-slate-300">8</button>
          <button onClick={() => inputDigit('9')} className="p-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black shadow-sm border border-slate-300">9</button>
          <button onClick={() => performOperation('×')} className="p-3 rounded-xl bg-[#E8E3D8] hover:bg-[#D8D2C5] text-slate-950 font-black shadow-sm border border-slate-400">×</button>

          {/* Row 3 */}
          <button onClick={() => inputDigit('4')} className="p-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black shadow-sm border border-slate-300">4</button>
          <button onClick={() => inputDigit('5')} className="p-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black shadow-sm border border-slate-300">5</button>
          <button onClick={() => inputDigit('6')} className="p-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black shadow-sm border border-slate-300">6</button>
          <button onClick={() => performOperation('-')} className="p-3 rounded-xl bg-[#E8E3D8] hover:bg-[#D8D2C5] text-slate-950 font-black shadow-sm border border-slate-400">-</button>

          {/* Row 4 */}
          <button onClick={() => inputDigit('1')} className="p-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black shadow-sm border border-slate-300">1</button>
          <button onClick={() => inputDigit('2')} className="p-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black shadow-sm border border-slate-300">2</button>
          <button onClick={() => inputDigit('3')} className="p-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black shadow-sm border border-slate-300">3</button>
          <button onClick={() => performOperation('+')} className="p-3 rounded-xl bg-[#E8E3D8] hover:bg-[#D8D2C5] text-slate-950 font-black shadow-sm border border-slate-400">+</button>

          {/* Row 5 */}
          <button onClick={toggleSign} className="p-3 rounded-xl bg-[#E8E3D8] hover:bg-[#D8D2C5] text-slate-950 font-black shadow-sm border border-slate-400">±</button>
          <button onClick={() => inputDigit('0')} className="p-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black shadow-sm border border-slate-300">0</button>
          <button onClick={inputDecimal} className="p-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black shadow-sm border border-slate-300">.</button>
          <button 
            onClick={() => performOperation('=')} 
            className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-black text-base shadow-md transition-all active:scale-95"
          >
            =
          </button>
        </div>

        {/* Recent History */}
        {history.length > 0 && (
          <div className="p-3 bg-[#E8E3D8] border-t-2 border-slate-900 max-h-24 overflow-y-auto font-mono text-[11px] text-slate-900 space-y-1">
            <div className="text-[10px] uppercase font-extrabold text-slate-700 mb-1">Recent Calculations</div>
            {history.map((h, i) => (
              <div key={i} className="truncate font-bold">{h}</div>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
