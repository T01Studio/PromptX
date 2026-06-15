// PromptX 内置提示词库
// 与主应用 src/data.ts 保持同步
// 更新提示词后需重新加载扩展

const PROMPTX_PROMPTS = [
  {
    id: 'p-1',
    title: '小红书种草文案',
    command: 'xhs',
    category: '自媒体爆款',
    template: `你是一个小红书爆款文案专家。请为主题：{{topic}} 撰写一篇种草文案。
风格要求：{{tone}}
大概字数：{{length}}字
要求：包含情绪钩子，使用丰富的Emoji，结构清晰，文末带上相关话题。`,
    variables: ['topic', 'tone', 'length'],
  },
  {
    id: 'p-2',
    title: '代码重构专家',
    command: 'refactor',
    category: '代码重构',
    template: `你是一个资深的架构师。请重构以下 {{language}} 代码，目标是提升可读性、性能，并遵循最佳实践。

代码如下：
{{code}}`,
    variables: ['language', 'code'],
  },
  {
    id: 'p-3',
    title: '工作周报生成器',
    command: 'report',
    category: '公文写作',
    template: `请根据以下任务要点，生成一份专业的周报：
{{tasks}}

本周核心亮点是：{{highlight}}
语气：{{tone}}`,
    variables: ['tasks', 'highlight', 'tone'],
  },
  {
    id: 'p-4',
    title: '中英翻译专家',
    command: 'trans',
    category: '通用工具',
    template: `你是一个专业翻译专家。请将以下内容翻译为 {{target_lang}}：
{{content}}

要求：保持原文语气和风格，专业术语准确。`,
    variables: ['target_lang', 'content'],
  },
  {
    id: 'p-5',
    title: 'SQL 生成器',
    command: 'sql',
    category: '代码重构',
    template: `你是一个数据库专家。请根据以下需求生成 {{db_type}} SQL 语句：
{{requirement}}

表结构如下：
{{schema}}

要求：考虑性能优化，添加必要索引。`,
    variables: ['db_type', 'requirement', 'schema'],
  },
  {
    id: 'p-6',
    title: 'PPT 大纲生成',
    command: 'ppt',
    category: '公文写作',
    template: `请为主题"{{topic}}"生成一份 PPT 大纲。
页数：{{slides}}页
受众：{{audience}}
风格：{{tone}}

每页包含：标题 + 要点（3-5条）。`,
    variables: ['topic', 'slides', 'audience', 'tone'],
  },
  {
    id: 'p-7',
    title: 'Prompt 优化器',
    command: 'improve',
    category: 'Prompt 工程',
    template: `你是一个 Prompt 工程专家。请优化以下 Prompt，使其更清晰、更具指导性：

原始 Prompt：
{{original_prompt}}

优化目标：{{goal}}

请给出优化后的版本和优化说明。`,
    variables: ['original_prompt', 'goal'],
  },
  {
    id: 'p-8',
    title: '会议纪要整理',
    command: 'meeting',
    category: '公文写作',
    template: `请将以下会议记录整理为规范的会议纪要：
{{notes}}

格式要求：
1. 会议主题
2. 参会人员
3. 核心议题与讨论
4. 决议事项
5. 待办事项（含负责人和截止日期）`,
    variables: ['notes'],
  },
  {
    id: 'p-9',
    title: '产品需求文档',
    command: 'prd',
    category: '公文写作',
    template: `你是一个高级产品经理。请为以下产品功能撰写 PRD：
功能名称：{{feature_name}}
目标用户：{{target_user}}
核心场景：{{scenario}}

PRD 结构：
1. 背景与目标
2. 用户故事
3. 功能详述
4. 交互流程
5. 验收标准
6. 数据埋点建议`,
    variables: ['feature_name', 'target_user', 'scenario'],
  },
  {
    id: 'p-10',
    title: 'AI 绘画提示词',
    command: 'img',
    category: '艺术绘画',
    template: `为 AI 绘画生成一段高质量的英文 prompt：

主题：{{subject}}
风格：{{style}}
构图：{{composition}}
光线：{{lighting}}
细节：{{details}}

格式：英文，逗号分隔，按重要性排序。`,
    variables: ['subject', 'style', 'composition', 'lighting', 'details'],
  },
];

// 平台检测
const PLATFORM_CONFIG = {
  'chatgpt.com': { name: 'ChatGPT', inputSelector: '#prompt-textarea, div[contenteditable="true"][data-id]' },
  'chat.openai.com': { name: 'ChatGPT', inputSelector: '#prompt-textarea, div[contenteditable="true"][data-id]' },
  'doubao.com': { name: '豆包', inputSelector: 'textarea, div[contenteditable="true"]' },
  'claude.ai': { name: 'Claude', inputSelector: 'div[contenteditable="true"]' },
  'kimi.moonshot.cn': { name: 'Kimi', inputSelector: 'div[contenteditable="true"]' },
  'tongyi.aliyun.com': { name: '通义千问', inputSelector: 'textarea, div[contenteditable="true"]' },
  'yiyan.baidu.com': { name: '文心一言', inputSelector: 'textarea, div[contenteditable="true"]' },
  'poe.com': { name: 'Poe', inputSelector: 'textarea, div[contenteditable="true"]' },
  'gemini.google.com': { name: 'Gemini', inputSelector: 'div[contenteditable="true"]' },
  'deepseek.com': { name: 'DeepSeek', inputSelector: 'textarea, div[contenteditable="true"]' },
};

function detectPlatform() {
  const host = window.location.hostname;
  for (const [domain, config] of Object.entries(PLATFORM_CONFIG)) {
    if (host.includes(domain)) return config;
  }
  return { name: '未知平台', inputSelector: 'textarea, div[contenteditable="true"]' };
}
