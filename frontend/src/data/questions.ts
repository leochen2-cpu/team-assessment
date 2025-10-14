// 完整的27题问卷数据

export interface Question {
  id: string;
  text: string;
  category: string;
  isReversed?: boolean;
  scale: Array<{
    value: number;
    label: string;
  }>;
}

export const QUESTIONS: Question[] = [
  // 团队联结 (Team Connection) - Q1-Q3
  {
    id: 'Q1',
    text: 'I know what\'s important to my teammates in their work',
    category: 'Team Connection',
    scale: [
      { value: 1, label: 'Strongly Disagree' },
      { value: 2, label: 'Disagree' },
      { value: 3, label: 'Neutral' },
      { value: 4, label: 'Agree' },
      { value: 5, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'Q2',
    text: 'I understand my teammates\' working styles and preferences',
    category: 'Team Connection',
    scale: [
      { value: 1, label: 'Strongly Disagree' },
      { value: 2, label: 'Disagree' },
      { value: 3, label: 'Neutral' },
      { value: 4, label: 'Agree' },
      { value: 5, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'Q3',
    text: 'My teammates know what matters most to me professionally',
    category: 'Team Connection',
    scale: [
      { value: 1, label: 'Strongly Disagree' },
      { value: 2, label: 'Disagree' },
      { value: 3, label: 'Neutral' },
      { value: 4, label: 'Agree' },
      { value: 5, label: 'Strongly Agree' },
    ],
  },

  // 认可与欣赏 (Appreciation) - Q4-Q6
  {
    id: 'Q4',
    text: 'I regularly express appreciation for my teammates\' contributions',
    category: 'Appreciation',
    scale: [
      { value: 1, label: 'Never' },
      { value: 2, label: 'Rarely' },
      { value: 3, label: 'Sometimes' },
      { value: 4, label: 'Often' },
      { value: 5, label: 'Very Often' },
    ],
  },
  {
    id: 'Q5',
    text: 'I feel valued and appreciated by my team',
    category: 'Appreciation',
    scale: [
      { value: 1, label: 'Strongly Disagree' },
      { value: 2, label: 'Disagree' },
      { value: 3, label: 'Neutral' },
      { value: 4, label: 'Agree' },
      { value: 5, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'Q6',
    text: 'When I do good work, my teammates notice and acknowledge it',
    category: 'Appreciation',
    scale: [
      { value: 1, label: 'Never' },
      { value: 2, label: 'Rarely' },
      { value: 3, label: 'Sometimes' },
      { value: 4, label: 'Often' },
      { value: 5, label: 'Always' },
    ],
  },

  // 积极回应 (Responsiveness) - Q7-Q9
  {
    id: 'Q7',
    text: 'When I share ideas or concerns, my teammates listen actively',
    category: 'Responsiveness',
    scale: [
      { value: 1, label: 'Never' },
      { value: 2, label: 'Rarely' },
      { value: 3, label: 'Sometimes' },
      { value: 4, label: 'Often' },
      { value: 5, label: 'Always' },
    ],
  },
  {
    id: 'Q8',
    text: 'My teammates respond constructively to my requests for help',
    category: 'Responsiveness',
    scale: [
      { value: 1, label: 'Never' },
      { value: 2, label: 'Rarely' },
      { value: 3, label: 'Sometimes' },
      { value: 4, label: 'Often' },
      { value: 5, label: 'Always' },
    ],
  },
  {
    id: 'Q9',
    text: 'I make time to engage with my teammates\' ideas and concerns',
    category: 'Responsiveness',
    scale: [
      { value: 1, label: 'Never' },
      { value: 2, label: 'Rarely' },
      { value: 3, label: 'Sometimes' },
      { value: 4, label: 'Often' },
      { value: 5, label: 'Always' },
    ],
  },

  // 信任与正向 (Trust & Positivity) - Q10-Q13
  {
    id: 'Q10',
    text: 'I trust my teammates to follow through on their commitments',
    category: 'Trust & Positivity',
    scale: [
      { value: 1, label: 'Strongly Disagree' },
      { value: 2, label: 'Disagree' },
      { value: 3, label: 'Neutral' },
      { value: 4, label: 'Agree' },
      { value: 5, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'Q11',
    text: 'I believe my team can overcome challenges together',
    category: 'Trust & Positivity',
    scale: [
      { value: 1, label: 'Strongly Disagree' },
      { value: 2, label: 'Disagree' },
      { value: 3, label: 'Neutral' },
      { value: 4, label: 'Agree' },
      { value: 5, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'Q12',
    text: 'Our team maintains a generally positive atmosphere',
    category: 'Trust & Positivity',
    scale: [
      { value: 1, label: 'Never' },
      { value: 2, label: 'Rarely' },
      { value: 3, label: 'Sometimes' },
      { value: 4, label: 'Often' },
      { value: 5, label: 'Always' },
    ],
  },
  {
    id: 'Q13',
    text: 'I feel safe being vulnerable and admitting mistakes to my team',
    category: 'Trust & Positivity',
    scale: [
      { value: 1, label: 'Strongly Disagree' },
      { value: 2, label: 'Disagree' },
      { value: 3, label: 'Neutral' },
      { value: 4, label: 'Agree' },
      { value: 5, label: 'Strongly Agree' },
    ],
  },

  // 冲突管理 (Conflict Management) - Q14-Q16
  {
    id: 'Q14',
    text: 'I feel safe expressing disagreement with my team',
    category: 'Conflict Management',
    scale: [
      { value: 1, label: 'Strongly Disagree' },
      { value: 2, label: 'Disagree' },
      { value: 3, label: 'Neutral' },
      { value: 4, label: 'Agree' },
      { value: 5, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'Q15',
    text: 'My team handles conflicts constructively',
    category: 'Conflict Management',
    scale: [
      { value: 1, label: 'Never' },
      { value: 2, label: 'Rarely' },
      { value: 3, label: 'Sometimes' },
      { value: 4, label: 'Often' },
      { value: 5, label: 'Always' },
    ],
  },
  {
    id: 'Q16',
    text: 'When disagreements arise, we work toward solutions together',
    category: 'Conflict Management',
    scale: [
      { value: 1, label: 'Never' },
      { value: 2, label: 'Rarely' },
      { value: 3, label: 'Sometimes' },
      { value: 4, label: 'Often' },
      { value: 5, label: 'Always' },
    ],
  },

  // 目标支持 (Goal Support) - Q17-Q20
  {
    id: 'Q17',
    text: 'I understand my teammates\' professional goals',
    category: 'Goal Support',
    scale: [
      { value: 1, label: 'Strongly Disagree' },
      { value: 2, label: 'Disagree' },
      { value: 3, label: 'Neutral' },
      { value: 4, label: 'Agree' },
      { value: 5, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'Q18',
    text: 'My teammates actively support my professional development',
    category: 'Goal Support',
    scale: [
      { value: 1, label: 'Never' },
      { value: 2, label: 'Rarely' },
      { value: 3, label: 'Sometimes' },
      { value: 4, label: 'Often' },
      { value: 5, label: 'Always' },
    ],
  },
  {
    id: 'Q19',
    text: 'I help my teammates achieve their goals',
    category: 'Goal Support',
    scale: [
      { value: 1, label: 'Never' },
      { value: 2, label: 'Rarely' },
      { value: 3, label: 'Sometimes' },
      { value: 4, label: 'Often' },
      { value: 5, label: 'Always' },
    ],
  },
  {
    id: 'Q20',
    text: 'Our team goals align with individual career aspirations',
    category: 'Goal Support',
    scale: [
      { value: 1, label: 'Strongly Disagree' },
      { value: 2, label: 'Disagree' },
      { value: 3, label: 'Neutral' },
      { value: 4, label: 'Agree' },
      { value: 5, label: 'Strongly Agree' },
    ],
  },

  // 危险信号/健康沟通 (Warning Signs) - Q21-Q27
  {
    id: 'Q21',
    text: 'Feedback in my team focuses on specific behaviors rather than personal attacks',
    category: 'Warning Signs',
    scale: [
      { value: 1, label: 'Never' },
      { value: 2, label: 'Rarely' },
      { value: 3, label: 'Sometimes' },
      { value: 4, label: 'Often' },
      { value: 5, label: 'Always' },
    ],
  },
  {
    id: 'Q22',
    text: 'I observe disrespectful communication (sarcasm, eye-rolling, mockery) in my team',
    category: 'Warning Signs',
    isReversed: true,
    scale: [
      { value: 1, label: 'Very Often' },
      { value: 2, label: 'Often' },
      { value: 3, label: 'Sometimes' },
      { value: 4, label: 'Rarely' },
      { value: 5, label: 'Never' },
    ],
  },
  {
    id: 'Q23',
    text: 'Team members avoid stonewalling or giving the silent treatment',
    category: 'Warning Signs',
    scale: [
      { value: 1, label: 'Never' },
      { value: 2, label: 'Rarely' },
      { value: 3, label: 'Sometimes' },
      { value: 4, label: 'Often' },
      { value: 5, label: 'Always' },
    ],
  },
  {
    id: 'Q24',
    text: 'When stressed, we avoid blaming each other',
    category: 'Warning Signs',
    scale: [
      { value: 1, label: 'Never' },
      { value: 2, label: 'Rarely' },
      { value: 3, label: 'Sometimes' },
      { value: 4, label: 'Often' },
      { value: 5, label: 'Always' },
    ],
  },
  {
    id: 'Q25',
    text: 'Criticism in our team is delivered constructively',
    category: 'Warning Signs',
    scale: [
      { value: 1, label: 'Never' },
      { value: 2, label: 'Rarely' },
      { value: 3, label: 'Sometimes' },
      { value: 4, label: 'Often' },
      { value: 5, label: 'Always' },
    ],
  },
  {
    id: 'Q26',
    text: 'When tensions arise, my team can de-escalate and move forward',
    category: 'Warning Signs',
    scale: [
      { value: 1, label: 'Never' },
      { value: 2, label: 'Rarely' },
      { value: 3, label: 'Sometimes' },
      { value: 4, label: 'Often' },
      { value: 5, label: 'Always' },
    ],
  },
  {
    id: 'Q27',
    text: 'We repair relationships after conflicts or misunderstandings',
    category: 'Warning Signs',
    scale: [
      { value: 1, label: 'Never' },
      { value: 2, label: 'Rarely' },
      { value: 3, label: 'Sometimes' },
      { value: 4, label: 'Often' },
      { value: 5, label: 'Always' },
    ],
  },
];

// 导出问题总数
export const TOTAL_QUESTIONS = QUESTIONS.length;

// 按类别分组的问题
export const QUESTIONS_BY_CATEGORY = {
  'Team Connection': QUESTIONS.filter(q => q.category === 'Team Connection'),
  'Appreciation': QUESTIONS.filter(q => q.category === 'Appreciation'),
  'Responsiveness': QUESTIONS.filter(q => q.category === 'Responsiveness'),
  'Trust & Positivity': QUESTIONS.filter(q => q.category === 'Trust & Positivity'),
  'Conflict Management': QUESTIONS.filter(q => q.category === 'Conflict Management'),
  'Goal Support': QUESTIONS.filter(q => q.category === 'Goal Support'),
  'Warning Signs': QUESTIONS.filter(q => q.category === 'Warning Signs'),
};