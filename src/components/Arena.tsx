import { useState } from 'react';
import { Prompt } from '../types';
import { Play, Trophy, ArrowRightLeft, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface ArenaProps {
  prompts: Prompt[];
}

export default function Arena({ prompts }: ArenaProps) {
  const [leftPromptId, setLeftPromptId] = useState<string>(prompts[0]?.id || '');
  const [rightPromptId, setRightPromptId] = useState<string>(prompts[1]?.id || prompts[0]?.id || '');
  
  const [testInput, setTestInput] = useState('帮我写一段探店文案');
  const [isSimulating, setIsSimulating] = useState(false);
  const [leftResult, setLeftResult] = useState('');
  const [rightResult, setRightResult] = useState('');

  const leftPrompt = prompts.find(p => p.id === leftPromptId);
  const rightPrompt = prompts.find(p => p.id === rightPromptId);

  const handleStartPK = () => {
    setIsSimulating(true);
    setLeftResult('');
    setRightResult('');
    
    // Simulate streaming the result
    const leftText = "【结果对比 A】\n这是一份极具专业视角的文案：\n关于您的要求：" + testInput + "，我们为您提供如下建议...\n\n[由系统引擎自动生成]";
    const rightText = "【结果对比 B】\n🔥爆款预警！家人们谁懂啊，今天实测了：\n" + testInput + "，真的绝绝子！\n\n[由系统引擎自动生成]";
    
    let lIdx = 0;
    let rIdx = 0;
    
    const interval = setInterval(() => {
      let lDone = false;
      let rDone = false;
      
      if (lIdx < leftText.length) {
        setLeftResult(prev => prev + leftText[lIdx]);
        lIdx++;
      } else {
        lDone = true;
      }
      
      if (rIdx < rightText.length) {
        setRightResult(prev => prev + rightText[rIdx]);
        rIdx++;
      } else {
        rDone = true;
      }
      
      if (lDone && rDone) {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 20); // Fast simulation
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent text-[#FAFAFA]">
      <div className="px-12 py-10 border-b border-white/[0.05] bg-transparent flex items-center justify-between z-10 relative">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-white flex items-center gap-3 mb-2">
            <Sparkles className="text-[#D4AF37]" size={24} />
            A/B 对比竞技场
          </h1>
          <p className="text-white/50 text-[14px]">使用相同的参数和意图，直观对比不同引擎和提示词的生成质量。</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col p-12 overflow-hidden gap-8 bg-transparent">
        
        {/* Test variable input */}
        <div className="glass-card p-8 flex flex-col gap-5 shrink-0">
          <label className="text-[12px] font-bold text-white/40 tracking-widest uppercase">注入相同的测试意图 (Test Intent)</label>
          <div className="flex gap-4">
            <input 
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="flex-1 input-minimal border-b border-white/[0.1] pb-2 text-[15px]"
              placeholder="例如：帮我写一段小红书咖啡探店的文案..."
            />
            <button 
              onClick={handleStartPK}
              disabled={isSimulating}
              className="btn-primary px-8"
            >
              <Play size={18} fill="currentColor" />
              {isSimulating ? '生成中...' : '开始对比测试'}
            </button>
          </div>
        </div>

        {/* Side by side comparison */}
        <div className="flex-1 flex gap-8 min-h-0">
          {/* Left Panel */}
          <div className="flex-1 flex flex-col glass-card overflow-hidden">
            <div className="p-5 border-b border-white/[0.05] bg-white/[0.02] flex items-center justify-between z-10">
              <select 
                value={leftPromptId}
                onChange={(e) => setLeftPromptId(e.target.value)}
                className="bg-transparent text-[14px] font-medium text-white/90 outline-none cursor-pointer"
              >
                {prompts.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#121212]">{p.title}</option>
                ))}
              </select>
              <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest">模型方案 A</div>
            </div>
            <div className="flex-1 p-8 overflow-y-auto bg-transparent text-[14px] text-white/80 leading-[1.8] z-10 whitespace-pre-wrap font-sans">
              {leftResult ? leftResult : <div className="h-full flex items-center justify-center text-white/20 italic">等待测试运行...</div>}
            </div>
            {!isSimulating && leftResult && (
              <div className="p-5 border-t border-white/[0.05] bg-white/[0.01] flex justify-end z-10">
                <button className="btn-secondary text-[#D4AF37] border-[#D4AF37]/30 hover:bg-[#D4AF37]/10">
                  <Trophy size={16} />
                  晋级为主力版本
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center text-white/20 px-2 shrink-0">
            <ArrowRightLeft size={24} strokeWidth={1.5} />
          </div>

          {/* Right Panel */}
          <div className="flex-1 flex flex-col glass-card overflow-hidden">
            <div className="p-5 border-b border-white/[0.05] bg-white/[0.02] flex items-center justify-between z-10">
              <select 
                value={rightPromptId}
                onChange={(e) => setRightPromptId(e.target.value)}
                className="bg-transparent text-[14px] font-medium text-white/90 outline-none cursor-pointer"
              >
                {prompts.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#121212]">{p.title}</option>
                ))}
              </select>
              <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest">模型方案 B</div>
            </div>
            <div className="flex-1 p-8 overflow-y-auto bg-transparent text-[14px] text-white/80 leading-[1.8] z-10 whitespace-pre-wrap font-sans">
              {rightResult ? rightResult : <div className="h-full flex items-center justify-center text-white/20 italic">等待测试运行...</div>}
            </div>
            {!isSimulating && rightResult && (
              <div className="p-5 border-t border-white/[0.05] bg-white/[0.01] flex justify-end z-10">
                <button className="btn-secondary text-[#D4AF37] border-[#D4AF37]/30 hover:bg-[#D4AF37]/10">
                  <Trophy size={16} />
                  晋级为主力版本
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
