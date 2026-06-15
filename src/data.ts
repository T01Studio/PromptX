import { Category, Prompt } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: '自媒体爆款', iconName: 'MessageCircle' },
  { id: 'cat-2', name: '代码重构', iconName: 'Code' },
  { id: 'cat-3', name: '公文写作', iconName: 'FileText' },
  { id: 'cat-4', name: '艺术绘画', iconName: 'Image' },
];

export const INITIAL_PROMPTS: Prompt[] = [
  {
    id: 'p-1',
    title: '小红书种草文案',
    command: 'xhs',
    categoryId: 'cat-1',
    template: `你是一个小红书爆款文案专家。请为主题：{{topic}} 撰写一篇种草文案。
风格要求：{{tone}}
大概字数：{{length}}字
要求：包含情绪钩子，使用丰富的Emoji，结构清晰，文末带上相关话题。`,
    variables: ['topic', 'tone', 'length'],
    style: '真实体验/种草',
    bestFor: ['探店', '美妆', '生活方式'],
    history: [
      {
        id: 'v-2',
        template: `为主题：{{topic}} 撰写一篇小红书种草文案。大概 {{length}} 字。`,
        timestamp: Date.now() - 1000 * 60 * 60 * 2,
      }
    ],
  },
  {
    id: 'p-2',
    title: '代码重构专家',
    command: 'refactor',
    categoryId: 'cat-2',
    template: `你是一个资深的架构师。请重构以下 {{language}} 代码，目标是提升可读性、性能，并遵循最佳实践。

代码如下：
{{code}}`,
    variables: ['language', 'code'],
    style: '专业严谨',
    bestFor: ['React前端', '后端API'],
    history: [],
  },
  {
    id: 'p-3',
    title: '工作周报生成器',
    command: 'report',
    categoryId: 'cat-3',
    template: `请根据以下任务要点，生成一份专业的周报：
{{tasks}}

本周核心亮点是：{{highlight}}
语气：{{tone}}`,
    variables: ['tasks', 'highlight', 'tone'],
    style: '职场公文',
    bestFor: ['互联网', '研发团队'],
    history: [],
  }
];
