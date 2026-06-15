import { useState, useEffect } from 'react';
import { AISettings, AIProvider, PROVIDER_PRESETS } from '../types';
import { loadSettings, saveSettings, clearSettings, maskApiKey } from '../store/settings';
import { Shield, Key, Globe, Cpu, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

const PROVIDERS = Object.entries(PROVIDER_PRESETS) as [AIProvider, typeof PROVIDER_PRESETS[AIProvider]][];

export default function Settings() {
  const [settings, setSettings] = useState<AISettings>(loadSettings);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const handleProviderChange = (provider: AIProvider) => {
    const preset = PROVIDER_PRESETS[provider];
    setSettings(prev => ({
      ...prev,
      provider,
      baseURL: preset.baseURL,
      model: preset.models[0] || prev.model,
    }));
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    if (confirm('确定要清除所有 API 配置吗？此操作不可撤销。')) {
      clearSettings();
      setSettings({ provider: 'gemini', apiKey: '', baseURL: PROVIDER_PRESETS.gemini.baseURL, model: 'gemini-2.5-flash' });
    }
  };

  const selectedPreset = PROVIDER_PRESETS[settings.provider];
  const isCustom = settings.provider === 'custom';

  return (
    <div className="flex h-full w-full bg-transparent text-[#FAFAFA]">
      <div className="flex-1 max-w-2xl mx-auto px-12 py-10 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-[28px] font-bold tracking-tight text-white flex items-center gap-3 mb-2">
            <Shield className="text-[#D4AF37]" size={24} />
            API 配置
          </h1>
          <p className="text-white/50 text-[14px]">
            配置大模型 API 密钥，所有信息仅保存在浏览器本地，不会上传到任何服务器。
          </p>
        </div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 mb-8 flex items-start gap-3 border-[#D4AF37]/20"
        >
          <AlertTriangle size={20} className="text-[#D4AF37] shrink-0 mt-0.5" />
          <div className="text-[13px] text-white/70 leading-relaxed">
            <p className="font-medium text-white/90 mb-1">安全提示</p>
            <p>你的 API Key 仅存储在浏览器 localStorage 中，不会上传到任何远程服务器。每次调用都直接从你的浏览器发起请求到对应 AI 服务商。</p>
          </div>
        </motion.div>

        {/* Provider Selection */}
        <div className="glass-card p-6 mb-6 space-y-5">
          <div className="flex items-center gap-2 text-[13px] font-bold text-white/40 uppercase tracking-widest">
            <Cpu size={14} />
            选择提供商
          </div>
          <div className="grid grid-cols-2 gap-3">
            {PROVIDERS.map(([key, preset]) => (
              <button
                key={key}
                onClick={() => handleProviderChange(key)}
                className={`p-4 rounded-[12px] border text-left transition-all duration-200 ${
                  settings.provider === key
                    ? 'border-[#D4AF37]/50 bg-[#D4AF37]/5'
                    : 'border-white/[0.06] bg-white/[0.01] hover:border-white/[0.12]'
                }`}
              >
                <div className="font-medium text-[15px] text-white">{preset.label}</div>
                <div className="text-[12px] text-white/40 mt-1 truncate">
                  {key === 'custom' ? 'OpenAI 兼容接口' : preset.baseURL}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* API Key */}
        <div className="glass-card p-6 mb-6 space-y-5">
          <div className="flex items-center gap-2 text-[13px] font-bold text-white/40 uppercase tracking-widest">
            <Key size={14} />
            API Key
          </div>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={settings.apiKey}
              onChange={e => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder={settings.apiKey ? maskApiKey(settings.apiKey) : '输入你的 API Key...'}
              className="w-full input-card pr-16 font-mono text-[14px]"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-white/40 hover:text-white/80 transition-colors"
            >
              {showKey ? '隐藏' : '显示'}
            </button>
          </div>
          {!settings.apiKey && (
            <p className="text-[12px] text-white/30">尚未配置 API Key，部分功能将不可用。</p>
          )}
        </div>

        {/* Base URL (only for custom or custom-edited) */}
        <div className="glass-card p-6 mb-6 space-y-5">
          <div className="flex items-center gap-2 text-[13px] font-bold text-white/40 uppercase tracking-widest">
            <Globe size={14} />
            接口地址
          </div>
          <input
            type="text"
            value={settings.baseURL}
            onChange={e => setSettings(prev => ({ ...prev, baseURL: e.target.value }))}
            placeholder={isCustom ? 'https://your-api.example.com/v1' : selectedPreset.baseURL}
            className="w-full input-card font-mono text-[14px]"
          />
          <p className="text-[12px] text-white/30">
            {isCustom
              ? '输入兼容 OpenAI 协议的 API 地址。'
              : '默认地址已自动填充，如需代理地址可手动修改。'}
          </p>
        </div>

        {/* Model */}
        <div className="glass-card p-6 mb-8 space-y-5">
          <div className="flex items-center gap-2 text-[13px] font-bold text-white/40 uppercase tracking-widest">
            <Cpu size={14} />
            模型
          </div>
          {isCustom ? (
            <input
              type="text"
              value={settings.model}
              onChange={e => setSettings(prev => ({ ...prev, model: e.target.value }))}
              placeholder="输入模型名称，如 gpt-4o"
              className="w-full input-card font-mono text-[14px]"
            />
          ) : selectedPreset.models.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {selectedPreset.models.map(m => (
                <button
                  key={m}
                  onClick={() => setSettings(prev => ({ ...prev, model: m }))}
                  className={`p-3 rounded-[8px] border text-left font-mono text-[13px] transition-all duration-200 ${
                    settings.model === m
                      ? 'border-[#D4AF37]/50 bg-[#D4AF37]/5 text-white'
                      : 'border-white/[0.06] bg-white/[0.01] text-white/60 hover:border-white/[0.12]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={settings.model}
              onChange={e => setSettings(prev => ({ ...prev, model: e.target.value }))}
              placeholder="输入模型名称"
              className="w-full input-card font-mono text-[14px]"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button onClick={handleSave} className="btn-primary px-8">
            <CheckCircle2 size={18} />
            {saved ? '已保存' : '保存配置'}
          </button>
          <button onClick={handleClear} className="btn-secondary px-8 text-white/40 hover:text-red-400">
            <Trash2 size={18} />
            清除配置
          </button>
        </div>

        <div className="mt-12 pb-8 text-[12px] text-white/20 leading-relaxed">
          <p>PromptX 不会在任何服务器上存储你的 API Key。</p>
          <p>所有请求直接从你的浏览器发送到对应的 AI 服务商。</p>
        </div>
      </div>
    </div>
  );
}
