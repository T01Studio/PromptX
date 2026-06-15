// popup.js - PromptX 扩展弹窗
// 从 background/prompts 获取指令列表并渲染

const cmdList = document.getElementById('cmdList');

// prompts 由 content script 注入的 prompts.js 提供（共享作用域）
// 但 popup 是独立作用域，这里直接内联一份精简列表
const COMMANDS = [
  { command: 'xhs', title: '小红书种草文案', category: '自媒体爆款' },
  { command: 'refactor', title: '代码重构专家', category: '代码重构' },
  { command: 'report', title: '工作周报生成器', category: '公文写作' },
  { command: 'trans', title: '中英翻译专家', category: '通用工具' },
  { command: 'sql', title: 'SQL 生成器', category: '代码重构' },
  { command: 'ppt', title: 'PPT 大纲生成', category: '公文写作' },
  { command: 'improve', title: 'Prompt 优化器', category: 'Prompt 工程' },
  { command: 'meeting', title: '会议纪要整理', category: '公文写作' },
  { command: 'prd', title: '产品需求文档', category: '公文写作' },
  { command: 'img', title: 'AI 绘画提示词', category: '艺术绘画' },
];

if (cmdList) {
  COMMANDS.forEach(cmd => {
    const li = document.createElement('li');
    li.className = 'cmd-item';
    li.innerHTML = `
      <span class="cmd-command">\\${cmd.command}</span>
      <span class="cmd-title">${cmd.title}</span>
      <span class="cmd-cat">${cmd.category}</span>
    `;
    cmdList.appendChild(li);
  });
}
