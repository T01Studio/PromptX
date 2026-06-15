import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Prompt } from '../types';
import { Sparkles, Bot, ArrowRight, Settings2, Loader2, CheckCircle2, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PlaygroundProps {
  prompts: Prompt[];
}

type Mode = 'input' | 'intent-confirm' | 'tuning' | 'generating' | 'result';

export default function Playground({ prompts }: PlaygroundProps) {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<Mode>('input');
  
  // Slash command state
  const [showGhost, setShowGhost] = useState(false);
  const [searchWord, setSearchWord] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Selected prompt state
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  
  const [matchedParams, setMatchedParams] = useState<Record<string, string>>({});
  const [resultMessages, setResultMessages] = useState<{role: 'user' | 'agent', content: string}[]>([
    { role: 'agent', content: '您好！我是您的提示词自动驾驶系统。\n\n输入 "/" 即可唤起指令菜单。选择指令后，只需输入您的简单意图，系统将自动识别并帮您推断填写所有的提示词参数。' }
  ]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const matchingPrompts = prompts.filter(p => 
    p.command.toLowerCase().includes(searchWord.toLowerCase()) || 
    p.title.toLowerCase().includes(searchWord.toLowerCase())
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showGhost) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % matchingPrompts.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + matchingPrompts.length) % matchingPrompts.length);
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        if (matchingPrompts[selectedIndex]) {
          handleSelectPrompt(matchingPrompts[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowGhost(false);
      } else if (e.key === ' ') {
        setShowGhost(false);
      }
      return; 
    }

    // Unselect prompt if backspace on empty text
    if (e.key === 'Backspace' && text === '' && selectedPrompt) {
      setSelectedPrompt(null);
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    
    // Naive Ghost UI trigger check
    const words = val.split(/\s+/);
    const lastWord = words[words.length - 1];
    
    // Only trigger ghost UI if we haven't selected a prompt yet
    if (!selectedPrompt && lastWord.startsWith('/')) {
      setShowGhost(true);
      setSearchWord(lastWord.slice(1));
      setSelectedIndex(0);
    } else {
      setShowGhost(false);
    }
  };

  const handleSelectPrompt = (prompt: Prompt) => {
    setShowGhost(false);
    setSelectedPrompt(prompt);
    
    // Remove the /command from text
    const words = text.split(/\s+/);
    words.pop();
    setText(words.join(' ') + (words.length > 0 ? ' ' : ''));
    
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const handleSend = () => {
    if (!text.trim() && !selectedPrompt) return;
    
    // Require a selected prompt for now, to ensure human confirmation step
    if (!selectedPrompt) {
      setResultMessages(prev => [
        ...prev,
        { role: 'user', content: text },
        { role: 'agent', content: '请先输入 "/" 选择一个提示词模板，然后再告诉我您的意图哦！' }
      ]);
      setText('');
      return;
    }
    
    // Simulate extracting parameters from text
    // In a real system, you'd send `text` and `selectedPrompt.variables` to an LLM
    const topicVal = text.includes('咖啡') ? '咖啡探店' : (text.includes('探店') ? '周末探店' : (text || '日常分享'));
    
    const extracted: Record<string, string> = {
      topic: topicVal,
      tone: '真实体验/情绪饱满',
      length: '300',
      language: 'TypeScript',
      code: text || '...',
      tasks: text || '本周完成例行支持',
      highlight: '稳定性提升',
    };
    
    const finalParams: Record<string, string> = {};
    selectedPrompt.variables.forEach(v => {
      finalParams[v] = extracted[v] || '默认提取内容';
    });
    
    setMatchedParams(finalParams);
    setMode('intent-confirm');
  };

  const handleGenerate = () => {
    setMode('generating');
    
    setTimeout(() => {
      if (!selectedPrompt) return;

      let assembledPrompt = selectedPrompt.template;
      selectedPrompt.variables.forEach(v => {
        const regex = new RegExp(`{{(?:\\s*)${v}(?:\\s*)}}`, 'g');
        assembledPrompt = assembledPrompt.replace(regex, matchedParams[v] || '');
      });

      const msg = `✅ 已为您生成最终提示词，可直接复制使用：\n\n${assembledPrompt}`;
      
      setResultMessages(prev => [
        ...prev, 
        { role: 'user', content: `[${selectedPrompt.title}] ${text}` },
        { role: 'agent', content: msg }
      ]);
      
      setText('');
      setSelectedPrompt(null);
      setMode('input');
      setTimeout(() => textareaRef.current?.focus(), 50);
    }, 1500);
  };

  const getPlaceholder = () => {
    if (selectedPrompt) {
      return `请用一句话描述意图，AI将自动补全 ${selectedPrompt.variables.length} 个参数...`;
    }
    return '例如输入 "/xhs" 并选择模板，或输入 "/" 浏览提示词...';
  };

  return (
    <div className="flex h-full w-full p-12 flex-col items-center justify-center relative bg-transparent text-[#FAFAFA]">
      <div className="w-full max-w-4xl h-[80vh] bg-white/[0.02] backdrop-blur-[20px] rounded-[24px] border border-white/[0.05] overflow-hidden flex flex-col relative z-10 subtle-shadow-3">
        <div className="px-8 py-5 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-3 text-white font-medium">
            <Bot size={20} className="text-[#D4AF37]" />
            <span className="text-[16px] tracking-tight">自动驾驶舱</span>
          </div>
          <div className="flex gap-2">
            <span className="text-[11px] uppercase font-bold text-white/50 bg-white/[0.05] px-3 py-1 rounded-[6px] tracking-widest border border-white/[0.05]">Active</span>
          </div>
        </div>

        <div className="flex-1 p-8 relative flex flex-col overflow-y-auto min-h-0 bg-transparent">
          <div className="flex-1 flex flex-col justify-end space-y-8 min-h-max">
            {resultMessages.map((msg, idx) => (
              <div key={idx} className={`max-w-[85%] text-[15px] leading-[1.6] rounded-[16px] p-6 shadow-sm whitespace-pre-wrap font-sans ${
                msg.role === 'agent' 
                  ? 'bg-white/[0.03] border border-white/[0.05] text-white/90 self-start rounded-tl-sm relative group' 
                  : 'bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-white self-end rounded-tr-sm'
              }`}>
                {msg.content}
                {msg.role === 'agent' && msg.content.includes('✅ 已为您生成最终提示词') && (
                  <button 
                    onClick={() => navigator.clipboard.writeText(msg.content.replace('✅ 已为您生成最终提示词，可直接复制使用：\n\n', ''))}
                    className="absolute top-4 right-4 p-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.05] rounded-[8px] text-white/50 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    title="复制提示词"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white/[0.02] border-t border-white/[0.05] shrink-0 relative">
          
          <AnimatePresence>
            {showGhost && matchingPrompts.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-full mb-6 left-6 w-[400px] bg-[#1A1A1A] border border-white/[0.05] rounded-[16px] subtle-shadow-3 overflow-hidden z-50"
              >
                <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.01]">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></div>
                     <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">选择模板命令</span>
                  </div>
                </div>
                <div className="p-3 space-y-1 max-h-[300px] overflow-y-auto">
                  {matchingPrompts.map((prompt, idx) => (
                    <button
                      key={prompt.id}
                      onClick={() => handleSelectPrompt(prompt)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left p-3 rounded-[10px] flex items-center justify-between transition-colors duration-200 ${selectedIndex === idx ? 'bg-white/[0.08] text-white' : 'hover:bg-white/[0.03] text-white/70'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`font-mono text-[12px] px-2 py-0.5 rounded-[4px] ${selectedIndex === idx ? 'bg-white/[0.1]' : 'bg-transparent text-white/40 border border-white/[0.05]'}`}>
                          /{prompt.command}
                        </span>
                        <span className="text-[14px] font-medium">{prompt.title}</span>
                      </div>
                      {selectedIndex === idx && (
                        <span className="text-[12px] opacity-50 flex items-center gap-1 font-mono uppercase tracking-widest text-white/50">
                          Enter
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {(mode === 'intent-confirm' || mode === 'tuning') && selectedPrompt && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-full mb-6 left-6 right-6 bg-[#1A1A1A]/95 backdrop-blur-[40px] border border-white/[0.05] rounded-[20px] subtle-shadow-3 p-8 z-20 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[10px] bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <div className="text-[16px] font-bold text-white flex items-center gap-2 mb-1">
                        已选择方案: {selectedPrompt.title}
                      </div>
                      <div className="text-[13px] text-white/50">系统已自动推断您的意图并提取了参数，您可以修改：</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.05] rounded-[16px] block p-6 mb-8">
                  <div className="grid grid-cols-2 gap-6">
                    {selectedPrompt.variables.map(v => (
                      <div key={v}>
                        <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest block mb-2">{v}</label>
                        {mode === 'tuning' ? (
                          <input 
                            type="text" 
                            value={matchedParams[v]} 
                            onChange={e => setMatchedParams({...matchedParams, [v]: e.target.value})}
                            className="w-full bg-white/[0.03] border border-white/[0.1] rounded-[8px] px-4 py-2.5 text-[14px] text-white outline-none focus:border-[#D4AF37] transition-all"
                          />
                        ) : (
                          <div className="text-[15px] text-white/90 font-medium">{matchedParams[v]}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => mode === 'tuning' ? setMode('intent-confirm') : setMode('tuning')}
                    className="btn-secondary"
                  >
                    <Settings2 size={18} />
                    {mode === 'tuning' ? '完成微调' : '微调参数'}
                  </button>
                  <button 
                    onClick={handleGenerate}
                    className="btn-primary flex-1"
                  >
                    直接生成 <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {mode === 'generating' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 bg-[#D4AF37]/90 text-[#121212] px-8 py-3 rounded-full text-[14px] font-medium flex items-center gap-3 subtle-shadow-2 backdrop-blur-md"
              >
                <Loader2 size={16} className="animate-spin" />
                正在为您生成...
              </motion.div>
            )}
          </AnimatePresence>

          <div className={`relative flex items-center gap-3 bg-[#1A1A1A] rounded-[16px] border border-white/[0.05] p-2 transition-all ${mode === 'input' ? 'focus-within:border-white/[0.15]' : 'opacity-50 pointer-events-none'}`}>
            {selectedPrompt && (
              <div className="flex items-center gap-2 ml-2 pl-3 pr-4 py-2 bg-white/[0.03] border border-white/[0.05] rounded-[8px] text-white/80 text-[13px] whitespace-nowrap shrink-0">
                <Command size={14} className="opacity-50" />
                <span className="font-medium">{selectedPrompt.title}</span>
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder()}
              className="flex-1 max-h-[160px] min-h-[56px] resize-none bg-transparent outline-none p-4 text-[15px] leading-[1.6] text-white placeholder-white/30 font-sans"
              rows={1}
              disabled={mode !== 'input'}
            />
            <button 
              onClick={handleSend}
              disabled={mode !== 'input'}
              className="w-[48px] h-[48px] flex items-center justify-center bg-[#D4AF37] text-[#121212] rounded-[12px] hover:scale-[1.02] transition-all disabled:opacity-50 mr-1"
            >
              <Sparkles size={20} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
