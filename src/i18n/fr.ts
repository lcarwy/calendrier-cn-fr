// 法语界面文案。法语排版：« : ; ! ? » 前用不换行空格  （由测试检查）。
export const fr = {
  'app.title': 'Calendrier franco-chinois',
  'app.underConstruction':
    'En construction : jours fériés français et chinois, jours de rattrapage, calendrier lunaire et 24 termes solaires.',
} as const;

export type MessageKey = keyof typeof fr;
