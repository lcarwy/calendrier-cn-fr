// 法语界面文案。法语排版：« : ; ! ? » 前用不换行空格 \u00a0（由测试检查），撇号用 ’。
// {name} 为插值占位符。
export const fr = {
  'app.title': 'Calendrier franco-chinois',

  'nav.previous': 'Mois précédent',
  'nav.next': 'Mois suivant',
  'nav.today': 'Aujourd’hui',
  'nav.month': 'Mois',
  'nav.year': 'Année',
  'nav.calendar': 'Calendrier de {month}',

  'notice.cnUnpublished':
    'Chine\u00a0: le calendrier officiel des congés {year} n’est pas encore publié (habituellement en novembre). Seules les fêtes légales sont signalées, sans ponts ni jours de rattrapage.',
  'notice.cnUnavailable':
    'Chine\u00a0: les congés officiels ne sont disponibles qu’à partir de {year}.',

  'legend.title': 'Légende',
  'legend.cnOff': 'Jour chômé en Chine',
  'legend.cnWork': 'Jour travaillé en Chine (rattrapage)',
  'legend.cnStatutory': 'Fête légale chinoise (calendrier pas encore publié)',
  'legend.frHoliday': 'Jour férié en France ({zone})',
  'legend.festival': 'Fête traditionnelle chinoise',
  'legend.term': 'Terme solaire',
  'legend.lunar': 'Date du calendrier lunaire',

  'detail.week': 'Semaine {week}',
  'detail.lunarTitle': 'Calendrier lunaire',
  'detail.lunarDate': '{day} jour du {month} mois lunaire',
  'detail.lunarDateLeap': '{day} jour du {month} mois lunaire intercalaire',
  'detail.lunarYear': 'Année {ganzhi} ({zodiac})',
  'detail.chinaTitle': 'Chine',
  'detail.cnOff': 'Jour chômé',
  'detail.cnWork': 'Jour travaillé (rattrapage)',
  'detail.cnWorkHint': 'Ce jour de week-end est travaillé en Chine pour compenser un pont.',
  'detail.cnStatutory': 'Fête légale',
  'detail.cnStatutoryHint':
    'Le calendrier officiel des congés {year} n’est pas encore publié\u00a0: les ponts et jours de rattrapage ne sont pas encore connus.',
  'detail.cnSource': 'Avis officiel (gov.cn)',
  'detail.cnUnavailable': 'Congés chinois disponibles à partir de {year}.',
  'detail.franceTitle': 'France',
  'detail.frHoliday': 'Jour férié',
  'detail.frMandatory': 'Seul jour férié obligatoirement chômé et payé pour tous les salariés.',
  'detail.frSolidarity':
    'Souvent la journée de solidarité\u00a0: peut être travaillé selon l’employeur.',
  'detail.termTitle': 'Terme solaire',
  'detail.termOrder': '{order} des 24 termes solaires',
  'detail.termTime': 'Heure exacte\u00a0: {beijing} à Pékin, {paris} à Paris',
  'detail.festivalTitle': 'Fête traditionnelle',
  'detail.nothing': 'Ni jour férié ni fête ce jour-là.',

  'zone.metropole': 'métropole',
  'zone.alsace-moselle': 'Alsace-Moselle',

  'aria.cnOff': 'jour chômé en Chine',
  'aria.cnWork': 'jour travaillé en Chine',
  'aria.cnStatutory': 'fête légale chinoise',
  'aria.frHoliday': 'jour férié en France',

  'footer.privacy': 'Vos données restent dans votre navigateur.',
  'footer.sources': 'Sources des données',
  'footer.code': 'Code source',

  'common.close': 'Fermer',

  'grid.week': 'Sem.',
  'grid.weekNumber': 'Semaine {week}',

  'settings.open': 'Réglages',
  'settings.title': 'Réglages',
  'settings.zone': 'Jours fériés français',
  'settings.zone.metropole': 'France métropolitaine',
  'settings.zone.alsace-moselle': 'Alsace-Moselle (avec Vendredi saint et Saint-Étienne)',
  'settings.display': 'Affichage',
  'settings.layer.cnHolidays': 'Congés chinois (休 / 班)',
  'settings.layer.frHolidays': 'Jours fériés français',
  'settings.layer.lunar': 'Dates du calendrier lunaire',
  'settings.layer.solarTerms': 'Termes solaires',
  'settings.layer.festivals': 'Fêtes traditionnelles chinoises',
  'settings.weekNumbers': 'Numéros de semaine',
  'settings.theme': 'Thème',
  'settings.theme.auto': 'Automatique',
  'settings.theme.light': 'Clair',
  'settings.theme.dark': 'Sombre',
  'settings.storageNote':
    'Les réglages sont enregistrés dans ce navigateur uniquement, sur cet appareil.',
} as const;

export type MessageKey = keyof typeof fr;
