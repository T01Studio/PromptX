import { useState } from 'react';
import { AppView, Category, Prompt } from './types';
import { INITIAL_CATEGORIES, INITIAL_PROMPTS } from './data';
import { LayoutDashboard, TerminalSquare, Swords, Settings2, BookOpen, Puzzle, PanelLeftClose, PanelLeft } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Playground from './components/Playground';
import Arena from './components/Arena';
import Settings from './components/Settings';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('playground');
  const [prompts, setPrompts] = useState<Prompt[]>(INITIAL_PROMPTS);
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(INITIAL_PROMPTS[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const updatePrompt = (updatedPrompt: Prompt) => {
    setPrompts(prev => prev.map(p => p.id === updatedPrompt.id ? updatedPrompt : p));
  };

  const addPrompt = (newPrompt: Prompt) => {
    setPrompts(prev => [newPrompt, ...prev]);
    setSelectedPromptId(newPrompt.id);
  };

  const navItems = [
    { id: 'playground' as AppView, label: '自动驾驶舱', icon: <TerminalSquare size={20} /> },
    { id: 'dashboard' as AppView, label: '资产管理', icon: <LayoutDashboard size={20} /> },
    { id: 'arena' as AppView, label: 'A/B 竞技场', icon: <Swords size={20} /> },
    { id: 'settings' as AppView, label: 'API 配置', icon: <Settings2 size={20} /> },
  ];

  const bottomLinks = [
    { id: 'docs', label: '使用文档', icon: <BookOpen size={20} />, href: 'https://github.com/T01Studio/PromptX/blob/master/docs/user-guide.md' },
    { id: 'extension', label: '浏览器扩展', icon: <Puzzle size={20} />, href: 'https://github.com/T01Studio/PromptX/tree/master/extension' },
  ];

  return (
    <div className="flex h-screen w-full relative overflow-hidden">
      {/* Sidebar Toggle Button (always visible) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-4 left-4 z-30 p-2 rounded-[8px] text-white/50 hover:text-white hover:bg-white/[0.05] transition-all duration-300"
        title={sidebarOpen ? '收起菜单' : '展开菜单'}
      >
        {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
      </button>

      {/* Immersive Sidebar Navigation */}
      <nav
        className={`glass-panel flex flex-col items-center py-8 px-4 shrink-0 transition-all duration-300 z-20 overflow-hidden ${sidebarOpen ? 'w-64' : 'w-0 p-0 border-none opacity-0 pointer-events-none'}`}
      >
        <div className="w-full flex items-center gap-4 mb-12 px-2">
          <div className="w-8 h-8 bg-white text-[#121212] rounded-[8px] flex items-center justify-center font-bold text-lg">
            P
          </div>
          <span className="font-bold text-lg tracking-tight text-white">PromptX</span>
        </div>

        <div className="w-full space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-[8px] transition-all duration-300 text-sm
                ${currentView === item.id ? 'bg-white/[0.08] text-white font-medium' : 'text-white/50 hover:bg-white/[0.04] hover:text-white/90 font-normal'}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-auto w-full px-2 space-y-3">
          {bottomLinks.map(link => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-[8px] transition-all duration-300 text-sm text-white/50 hover:bg-white/[0.04] hover:text-white/90 font-normal"
            >
              {link.icon}
              {link.label}
            </a>
          ))}
          <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-[12px] text-sm text-white/50 space-y-2 subtle-shadow-1">
            <p className="font-medium text-white/90">意图引擎就绪</p>
            <p className="text-[12px] leading-[1.6]">直接输入自然语言："帮我写一个小红书咖啡探店文案"</p>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-transparent z-10 relative">
        {currentView === 'dashboard' && (
          <Dashboard 
            prompts={prompts} 
            categories={categories} 
            selectedPromptId={selectedPromptId}
            onSelectPrompt={setSelectedPromptId}
            onUpdatePrompt={updatePrompt}
            onCreatePrompt={addPrompt}
          />
        )}
        {currentView === 'playground' && (
          <Playground prompts={prompts} />
        )}
        {currentView === 'arena' && (
          <Arena prompts={prompts} />
        )}
        {currentView === 'settings' && (
          <Settings />
        )}
      </main>
    </div>
  );
}
