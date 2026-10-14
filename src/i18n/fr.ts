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

  'common.cancel': 'Annuler',

  'events.add': 'Événement',
  'events.addLong': 'Ajouter un événement',
  'events.mine': 'Mes événements',
  'events.new': 'Nouvel événement',
  'events.edit': 'Modifier l’événement',
  'events.title': 'Titre',
  'events.titlePlaceholder': 'Anniversaire, réunion, vol pour Shanghai…',
  'events.date': 'Date',
  'events.from': 'Du',
  'events.to': 'Au',
  'events.multiDay': 'Sur plusieurs jours',
  'events.time': 'Heure (facultatif)',
  'events.color': 'Couleur',
  'events.yearly': 'Répéter chaque année',
  'events.notes': 'Notes',
  'events.save': 'Enregistrer',
  'events.delete': 'Supprimer',
  'events.confirmDelete': 'Supprimer «\u00a0{title}\u00a0»\u00a0?',
  'events.everyYear': 'Chaque année',
  'events.range': 'du {from} au {to}',
  'events.more': '+{count}',
  'events.error.title': 'Indiquez un titre.',
  'events.error.date': 'Date invalide.',
  'events.error.end': 'La date de fin doit être postérieure à la date de début.',
  'events.error.tooLong': 'Un événement ne peut pas durer plus d’un an.',
  'events.error.time': 'Heure invalide.',
  'events.storageError':
    'Impossible d’enregistrer dans ce navigateur (navigation privée ou stockage plein). Vos modifications seront perdues à la fermeture de la page.',

  'color.teal': 'Bleu-vert',
  'color.orange': 'Orange',
  'color.purple': 'Violet',
  'color.pink': 'Rose',
  'color.gold': 'Jaune',
  'color.gray': 'Gris',

  'backup.title': 'Sauvegarde',
  'backup.explain':
    'Vos événements et réglages ne sont enregistrés que dans ce navigateur, sur cet appareil. Exportez-les régulièrement, ou pour les transférer sur un autre appareil.',
  'backup.export': 'Exporter mes données',
  'backup.import': 'Importer une sauvegarde',
  'backup.lastExport': 'Dernière sauvegarde\u00a0: {date}.',
  'backup.never': 'Aucune sauvegarde pour l’instant.',
  'backup.reminder': 'Pensez à exporter vos données de temps en temps.',
  'backup.found': 'Sauvegarde du {date}\u00a0: {events}.',
  'backup.foundUndated': 'Sauvegarde valide\u00a0: {events}.',
  'backup.events.one': '{count} événement',
  'backup.events.other': '{count} événements',
  'backup.skipped.one': '{count} événement illisible sera ignoré.',
  'backup.skipped.other': '{count} événements illisibles seront ignorés.',
  'backup.merge': 'Fusionner avec mes données',
  'backup.mergeHint':
    'Fusionner garde vos événements actuels et ajoute ceux du fichier (en cas de doublon, la version la plus récente l’emporte). Remplacer efface vos événements et réglages actuels.',
  'backup.replace': 'Remplacer mes données',
  'backup.replaceConfirm':
    'Remplacer tous vos événements et réglages par ceux du fichier\u00a0? Cette action est irréversible.',
  'backup.done': 'Import terminé\u00a0: {events} dans votre calendrier.',
  'backup.error.json': 'Ce fichier n’est pas une sauvegarde valide (contenu illisible).',
  'backup.error.format': 'Ce fichier n’est pas une sauvegarde du Calendrier franco-chinois.',
  'backup.error.version':
    'Cette sauvegarde vient d’une version plus récente de l’application. Rechargez la page, puis réessayez.',
  'backup.error.read': 'Impossible de lire ce fichier.',

  'install.ios':
    'Sur iPhone et iPad, touchez Partager puis «\u00a0Sur l’écran d’accueil\u00a0»\u00a0: le calendrier s’ouvrira comme une application et vos données seront mieux conservées.',
  'install.dismiss': 'Masquer',
} as const;

export type MessageKey = keyof typeof fr;
