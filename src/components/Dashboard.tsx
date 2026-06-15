import { useState } from 'react';
import { Category, Prompt } from '../types';
import { Search, Plus, History, Command, Save, Tag, Target, CheckCircle2, Loader2, Bot, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  prompts: Prompt[];
  categories: Category[];
  selectedPromptId: string | null;
  onSelectPrompt: (id: string) => void;
  onUpdatePrompt: (prompt: Prompt) => void;
  onCreatePrompt?: (prompt: Prompt) => void;
}

export default function Dashboard({ prompts, categories, selectedPromptId, onSelectPrompt, onUpdatePrompt, onCreatePrompt }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const selectedPrompt = prompts.find(p => p.id === selectedPromptId);

  const [isAddingPrompt, setIsAddingPrompt] = useState(false);
  const [addMode, setAddMode] = useState<'manual' | 'extract'>('extract');
  const [extractText, setExtractText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedPrompt, setExtractedPrompt] = useState<Partial<Prompt> | null>(null);

  const filteredPrompts = prompts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.command.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? p.categoryId === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleContentChange = (newContent: string) => {
    if (!selectedPrompt) return;
    onUpdatePrompt({
      ...selectedPrompt,
      template: newContent
    });
  };

  const handleSaveSnapshot = () => {
    if (!selectedPrompt) return;
    const newVersion = {
      id: "v-" + Date.now(),
      template: selectedPrompt.template,
      timestamp: Date.now()
    };
    onUpdatePrompt({
      ...selectedPrompt,
      history: [newVersion, ...selectedPrompt.history]
    });
  }

  const handleRestore = (content: string) => {
    if (!selectedPrompt) return;
    onUpdatePrompt({
      ...selectedPrompt,
      template: content
    });
  }

  const handleSimulateExtract = () => {
    setIsExtracting(true);
    setTimeout(() => {
      setExtractedPrompt({
        title: '小红书探店方法论',
        command: 'xhs_pro',
        template: '定位：我是一个小红书爆款探店写手。\n\n写作结构：\n1. 【吸睛标题】：包含情绪词汇，如"绝绝子"、"宝藏"\n2. 【核心卖点】：深入描写 {{亮点}}\n3. 【体验感受】：结合个人视角谈 {{感受细节}}\n\n要求：字数控制在 {{字数}} 字左右，多使用 Emoji。',
        variables: ['亮点', '感受细节', '字数'],
        style: '网感/种草/情绪化',
        bestFor: ['餐饮探店', '测评', '文旅打卡']
      });
      setIsExtracting(false);
    }, 2500);
  };

  const handleSaveExtracted = () => {
    if (extractedPrompt && onCreatePrompt) {
      onCreatePrompt({
        id: 'p-' + Date.now(),
        title: extractedPrompt.title!,
        command: extractedPrompt.command!,
        categoryId: categories[0].id,
        template: extractedPrompt.template!,
        variables: extractedPrompt.variables!,
        style: extractedPrompt.style!,
        bestFor: extractedPrompt.bestFor!,
        history: []
      });
      setIsAddingPrompt(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-transparent text-[#FAFAFA]">
      {/* Middle Column: Prompt List */}
      <div className="w-[320px] border-r border-white/[0.05] flex flex-col glass-panel shrink-0 rounded-tl-[16px]">
        <div className="p-6 border-b border-white/[0.05] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-title text-[18px]">资产管理</h2>
            <button 
              onClick={() => { setIsAddingPrompt(true); setExtractedPrompt(null); setExtractText(''); setIsExtracting(false); }}
              className="btn-icon"
              title="新增系统能力"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-white/50" size={18} />
            <input 
              type="text" 
              placeholder="搜索资产..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-minimal pl-8 border-b border-white/[0.1] pb-2 placeholder-white/30"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-[scrollbar-width:none]">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-[12px] text-sm font-medium transition-colors ${selectedCategory === null ? 'bg-white/[0.1] text-white' : 'bg-transparent text-white/50 hover:text-white/90'}`}
            >
              全部
            </button>
            {categories.map(c => (
              <button 
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-[12px] text-sm font-medium transition-colors ${selectedCategory === c.id ? 'bg-white/[0.1] text-white' : 'bg-transparent text-white/50 hover:text-white/90'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredPrompts.map(prompt => (
            <button
              key={prompt.id}
              onClick={() => onSelectPrompt(prompt.id)}
              className={`w-full text-left p-4 rounded-[12px] transition-all duration-300 ${selectedPromptId === prompt.id ? 'bg-white/[0.05] shadow-[0_4px_12px_rgba(0,0,0,0.05)]' : 'bg-transparent hover:bg-white/[0.02]'}`}
            >
               <div className="font-medium text-[15px] text-white line-clamp-1">{prompt.title}</div>
              <div className="text-[13px] text-white/50 mt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 font-mono">
                  <Command size={12} />
                  {prompt.command}
                </span>
                <span className="opacity-40">•</span>
                <span>{prompt.style}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Editor & Timeline */}
      {selectedPrompt ? (
        <div className="flex-1 flex min-w-0 bg-[#121212]/80 backdrop-blur-[20px]">
          <div className="flex-1 flex flex-col min-w-0 border-r border-white/[0.05] relative">
            <div className="px-12 py-10 border-b border-white/[0.05]">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-[28px] font-bold tracking-tight text-white mb-2">{selectedPrompt.title}</h1>
                  <div className="flex items-center gap-6 mt-4 text-[14px] text-white/50">
                    <span className="font-mono text-white/80">
                      /{selectedPrompt.command}
                    </span>
                    <span className="flex items-center gap-2">
                      <Tag size={16} className="text-white/40" />
                      自动参数: <span className="text-white">{selectedPrompt.variables.length}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Target size={16} className="text-white/40" />
                      执行风格: <span className="text-white">{selectedPrompt.style}</span>
                    </span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={handleSaveSnapshot}
                    className="btn-primary"
                  >
                    <Save size={18} />
                    保存快照
                  </button>
                </div>
              </div>
              
              <div className="mt-8 flex gap-3">
                {selectedPrompt.bestFor.map((tag, i) => (
                  <span key={i} className="text-[13px] px-3 py-1.5 rounded-[6px] bg-white/[0.03] text-white/70">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex-1 p-12 overflow-y-auto relative">
              <h3 className="text-[13px] font-bold text-white/40 uppercase tracking-widest mb-6">底层模板 (Template)</h3>
              <div className="relative w-full h-[600px] font-sans text-[15px] leading-[1.6] bg-white/[0.01] border border-white/[0.04] rounded-[16px] p-8 overflow-hidden subtle-shadow-2">
                <div 
                  className="absolute inset-0 p-8 pointer-events-none whitespace-pre-wrap break-words text-transparent font-sans"
                  aria-hidden="true"
                >
                  {selectedPrompt.template.split(/({{.*?}})/g).map((part, i) => {
                    if (part.startsWith('{{') && part.endsWith('}}')) {
                      return <span key={i} className="px-2 py-0.5 bg-[#D4AF37]/10 text-transparent border border-[#D4AF37]/20 rounded-[6px] text-[14px] mx-1 leading-none align-baseline inline-block font-mono">{part}</span>;
                    }
                    return <span key={i}>{part}</span>;
                  })}
                </div>
                
                <textarea
                  value={selectedPrompt.template}
                  onChange={e => handleContentChange(e.target.value)}
                  className="absolute inset-0 p-8 w-full h-full resize-none bg-transparent outline-none text-white/90 caret-[#D4AF37] font-sans"
                  spellCheck={false}
                  placeholder="输入提示词底层结构，使用 {{参数名}} 来定义需要引擎自动推断的变量..."
                />
              </div>
            </div>
          </div>

          <div className="w-[320px] bg-white/[0.01] flex flex-col shrink-0 flex-1 max-w-[320px]">
            <div className="p-8 border-b border-white/[0.05] flex items-center gap-3 text-[15px] font-bold text-white">
              <History size={18} className="text-[#D4AF37]" />
              版本追踪
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8 relative">
              <div className="absolute left-[39px] top-12 bottom-0 w-[1px] bg-white/[0.05]"></div>
              
              <div className="relative pl-12 line-clamp-1">
                <div className="absolute -left-[3px] top-[6px] w-[9px] h-[9px] rounded-full bg-[#D4AF37] ring-4 ring-[#121212] z-10"></div>
                <div className="text-[14px] font-medium text-white">当前未命名版本</div>
                <div className="text-[12px] text-white/40 mt-1">修改未保存...</div>
              </div>
              {selectedPrompt.history.map((ver, idx) => (
                <div key={ver.id} className="relative pl-12 opacity-60 hover:opacity-100 transition-opacity">
                  <div className="absolute -left-[2px] top-[6px] w-[7px] h-[7px] rounded-full bg-white/20 ring-4 ring-[#121212] z-10"></div>
                  <div className="text-[14px] font-medium text-white flex items-center justify-between">
                     历史版本 {selectedPrompt.history.length - idx}
                  </div>
                  <div className="text-[12px] font-mono text-white/40 mt-1">{new Date(ver.timestamp).toLocaleString()}</div>
                  <button 
                    onClick={() => handleRestore(ver.template)}
                    className="text-[12px] bg-transparent hover:bg-white/[0.05] border border-white/[0.1] text-white/70 px-4 py-2 rounded-[6px] mt-4 transition-colors active:scale-95"
                  >
                    回滚至此版本
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-transparent flex-col gap-6 opacity-30">
          <Command size={48} className="text-white" />
          <p className="text-[16px] text-white font-medium">选择一个资产进行管理</p>
        </div>
      )}

      {/* Add Prompt Modal */}
      <AnimatePresence>
        {isAddingPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121212]/80 backdrop-blur-[30px]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#1A1A1A] border border-white/[0.05] rounded-[16px] subtle-shadow-3 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-8 border-b border-white/[0.05]">
                <h2 className="text-[20px] font-bold text-white flex items-center gap-3">
                  <Sparkles className="text-[#D4AF37]" size={20} />
                  新增系统能力
                </h2>
                <button 
                  onClick={() => setIsAddingPrompt(false)}
                  className="btn-icon"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex border-b border-white/[0.05]">
                <button 
                  onClick={() => setAddMode('extract')}
                  className={`flex-1 py-4 text-[14px] font-medium transition-colors ${addMode === 'extract' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-white/40 hover:text-white/80'}`}
                >
                  对话提纯 
                </button>
                <button 
                  onClick={() => setAddMode('manual')}
                  className={`flex-1 py-4 text-[14px] font-medium transition-colors ${addMode === 'manual' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-white/40 hover:text-white/80'}`}
                >
                  手动创建 
                </button>
              </div>

              <div className="p-8 overflow-y-auto flex-1">
                {addMode === 'manual' ? (
                  <div className="flex flex-col items-center justify-center h-48 text-white/30 text-[14px]">
                    <p>传统表单输入模版在此处渲染</p>
                    <p className="mt-2 text-[12px] opacity-70">(演示重点：请切换至「对话提纯」体验核心特性)</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="text-[14px] text-white/60 leading-[1.6]">
                      <strong className="text-white block mb-2 font-medium">什么是对话提纯？</strong>
                      直接粘贴历史记录，AI 会自动为您提取并结构化到底层模板中。
                    </div>

                    {!extractedPrompt && (
                      <div className="space-y-4">
                        <textarea
                          value={extractText}
                          onChange={e => setExtractText(e.target.value)}
                          placeholder="粘贴对话历史..."
                          className="input-card w-full h-48 font-mono text-[13px] leading-[1.6] resize-none"
                        />
                        <button 
                          onClick={handleSimulateExtract}
                          disabled={isExtracting}
                          className="btn-primary w-full disabled:opacity-50"
                        >
                          {isExtracting ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              正在深度分析...
                            </>
                          ) : (
                            <>
                              一键提取
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {extractedPrompt && !isExtracting && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/[0.02] border border-white/[0.05] rounded-[12px] p-8"
                      >
                        <div className="flex items-start gap-6">
                          <div className="w-12 h-12 rounded-full bg-[#165D4C]/20 flex items-center justify-center text-[#165D4C] shrink-0">
                            <CheckCircle2 size={24} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-[18px] font-bold text-white mb-2">提纯成功</h3>
                            <p className="text-[14px] text-white/50 mb-8">系统已自动提取出 {extractedPrompt.variables?.length} 个自动参数。</p>
                            
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <label className="text-[12px] font-bold text-white/30 uppercase tracking-widest block mb-2">能力名称</label>
                                  <div className="text-[14px] text-white font-medium">{extractedPrompt.title}</div>
                                </div>
                                <div>
                                  <label className="text-[12px] font-bold text-white/30 uppercase tracking-widest block mb-2">唤起命令</label>
                                  <div className="text-[14px] text-white/80 font-mono">/{extractedPrompt.command}</div>
                                </div>
                              </div>
                              
                              <div>
                                <label className="text-[12px] font-bold text-white/30 uppercase tracking-widest block mb-2">自动变量</label>
                                <div className="flex gap-2 flex-wrap">
                                  {extractedPrompt.variables?.map((v, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-white/[0.03] rounded-[6px] text-[13px] text-white/70 font-mono border border-white/[0.05]">
                                      {v}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <label className="text-[12px] font-bold text-white/30 uppercase tracking-widest block mb-2">结构化底层模板</label>
                                <div className="text-[13px] text-white/60 font-mono bg-[#121212]/50 border border-white/[0.04] rounded-[8px] p-5 whitespace-pre-wrap leading-[1.6]">
                                  {extractedPrompt.template}
                                </div>
                              </div>
                            </div>

                            <button 
                              onClick={handleSaveExtracted}
                              className="btn-primary w-full mt-8"
                            >
                              保存至资产库
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
