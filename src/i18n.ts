/**
 * Minimalt oversættelses-lag: appens sprog følger automatisk telefonens
 * sprogindstilling (dansk telefon → dansk app, alt andet → engelsk).
 * Ingen ekstern i18n-afhængighed – bare et opslag i et par ordbøger.
 */
export type Lang = 'da' | 'en';

function detectLang(): Lang {
  if (typeof navigator === 'undefined') return 'en';
  const candidates = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
  for (const c of candidates) {
    if (c && c.toLowerCase().startsWith('da')) return 'da';
  }
  return 'en';
}

export const lang: Lang = detectLang();

if (typeof document !== 'undefined') {
  document.documentElement.lang = lang;
}

type Dict = Record<string, string>;

const da: Dict = {
  'meta.title': 'ReactX – Reaktionstræning',
  'meta.description': 'ReactX: fuldskærms farvereaktion til reaktionstræning i fodbold og andre sportsgrene. Par op til 3 telefoner sammen.',

  // --- Forside ---
  'home.tagline.1': 'TRÆN',
  'home.tagline.2': 'REAGÉR',
  'home.tagline.3': 'FORBEDR',
  'home.desc': 'Forbedr din reaktionsevne, beslutningstagning og evne til at scanne omgivelserne.',
  'home.cta.solo': 'Solo – én telefon',
  'home.cta.pair': 'Par sammen – 2-3 telefoner',
  'home.steps.heading': 'Sådan virker det',
  'home.steps.1.title': '1. Opsætning',
  'home.steps.1.body': 'Placér telefonen på et stativ eller op ad noget, bag dig.',
  'home.steps.2.title': '2. Scan',
  'home.steps.2.body': 'Mens bolden spilles til dig, skifter skærmen farve.',
  'home.steps.3.title': '3. Reagér',
  'home.steps.3.body': 'Råb farven højt, vend dig, og modtag bolden.',
  'home.multi.heading': 'Par flere telefoner',
  'home.multi.body': 'Par op til 2 ekstra telefoner, og placér dem på mål, rebounders eller kegler. Hver telefon viser sin egen farve, aldrig den samme som de andre.',
  'home.multi.imgAlt': 'Spiller foran tre rebounders med hver sin farve – blå, rød og rød – og pile der viser bevægelsen mellem dem',
  'home.multi.caption': '3 telefoner i spil – samtidig',
  'home.benefits.heading': 'Hvorfor reaktionstræning',
  'home.benefits.1.title': 'Bedre scanning',
  'home.benefits.1.body': 'Opfat information omkring dig hurtigere.',
  'home.benefits.2.title': 'Hurtigere reaktion',
  'home.benefits.2.body': 'Reager hurtigere på visuelle stimuli.',
  'home.benefits.3.title': 'Bedre beslutninger',
  'home.benefits.3.body': 'Tag hurtigere og skarpere valg på banen.',
  'home.benefits.4.title': 'Bedre præstation',
  'home.benefits.4.body': 'Skærp hovedet, løft dit niveau.',
  'home.ideasLink': 'Idéer til øvelser og forbedringer →',
  'home.heroImgAlt': 'Telefon på stativ viser farven lilla, mens en spiller scanner området og bolden er på vej',

  // --- Fælles ---
  'common.back': '← Tilbage',
  'common.startDrill': 'Start øvelse',
  'common.sec': 'sek',

  // --- Indstillinger (delt af Solo og Pair) ---
  'settings.tempo': 'Tempo',
  'settings.fastest': 'Hurtigst skift',
  'settings.slowest': 'Langsomst skift',
  'settings.colors': 'Farver',
  'settings.colorsInPlay': 'Farver i spil',
  'settings.colorsHint': '{core} standardfarver + {extra} ekstra til sværere øvelser eller flere telefoner.',
  'settings.extra': 'Ekstra',
  'settings.avoidRepeat': 'Undgå samme farve to gange i træk',
  'settings.showCounter': 'Vis tæller (antal skift)',
  'settings.colorBlind': 'Farveblind-hjælp (viser farvenavn som tekst)',
  'settings.showNumbers': 'Vis tal oveni farven (sig farve + tal)',
  'settings.soundCue': 'Lydsignal ved skift',
  'settings.vibrationCue': 'Vibration ved skift',
  'settings.start': 'Opstart',
  'settings.countdown': 'Nedtælling før start',

  // --- Solo ---
  'solo.heading': 'Solo-indstillinger',
  'solo.noWakeLock': 'Din iPhone understøtter ikke automatisk "hold skærmen tændt" i denne browser. Husk selv at skrue ned for auto-lås i Indstillinger, mens I træner.',

  // --- Par (home) ---
  'pairHome.heading': 'Par telefoner sammen',
  'pairHome.urlPlaceholder': 'Indtast serverens adresse her',
  'pairHome.autoFound': '✓ Server fundet automatisk – I skal ikke gøre noget.',
  'pairHome.advanced': 'Avanceret: brug en anden server-adresse',
  'pairHome.serverAddress': 'Server-adresse',
  'pairHome.overrideHint': 'Overskriv kun hvis I ved I skal bruge en anden server end den fundne.',
  'pairHome.localTitle': 'Bruger I en lokal server?',
  'pairHome.localBody': 'Luk denne side og åbn i stedet adressen (eller scan QR-koden), som vises i terminal-vinduet, da I startede den lokale server. Så udfyldes alt automatisk.',
  'pairHome.exampleAddress': 'Kun til jeres egen cloud-server, fx: wss://reactx-relay.onrender.com',
  'pairHome.sameServerHint': 'Alle 3 telefoner skal bruge samme server-adresse. Se README for detaljer.',
  'pairHome.create': '➕ Opret rum (bliv vært)',
  'pairHome.or': 'eller',
  'pairHome.roomCode': 'Rumkode',
  'pairHome.roomCodePlaceholder': 'fx A7K2',
  'pairHome.join': '🔗 Deltag i rum',
  'pairHome.err.emptyAuto': 'Server-adresse-feltet er tomt. Åbn "Avanceret" og indtast adressen fra terminal-vinduet.',
  'pairHome.err.emptyManual': 'Server-adresse-feltet er tomt. Bruger I en lokal server, skal I åbne dens adresse direkte i Safari i stedet (se boksen ovenfor) – feltet her er kun til jeres egen cloud-server.',
  'pairHome.err.badFormat': 'Adressen skal starte med ws:// eller wss:// – tjek at du ikke er kommet til at skrive noget andet.',
  'pairHome.err.shortCode': 'Indtast den 4-tegns rumkode fra værtens telefon.',

  // --- Par (lobby) ---
  'pairLobby.leave': '← Forlad rum',
  'pairLobby.conn.idle': 'Ikke forbundet',
  'pairLobby.conn.connecting': 'Forbinder…',
  'pairLobby.conn.open': 'Forbundet',
  'pairLobby.conn.reconnecting': 'Genopretter forbindelse…',
  'pairLobby.conn.closed': 'Afbrudt',
  'pairLobby.codeLabel': 'RUMKODE – del den med de to andre telefoner',
  'pairLobby.waiting': 'Venter på at værten starter øvelsen…',
  'pairLobby.startAll': 'Start øvelse på alle telefoner',
  'pairLobby.slot.host': 'Vært',
  'pairLobby.slot.player2': 'Spiller 2',
  'pairLobby.slot.player3': 'Spiller 3',

  // --- Par (run) ---
  'pairRun.host': 'VÆRT',
  'pairRun.reconnecting': 'GENOPRETTER FORBINDELSE…',

  // --- Farveskærm ---
  'colorScreen.pauseHint': 'Tryk her for pause/stop',
  'colorScreen.pauseAria': 'Pause og stop',
  'colorScreen.ready': 'KLAR!',
  'colorScreen.pause': 'Pause',
  'colorScreen.resume': 'Fortsæt',
  'colorScreen.hostControls': 'Værten styrer denne øvelse',
  'colorScreen.stop': '⏹ Stop træning',
  'colorScreen.closeMenu': 'Luk menu',

  // --- Farvenavne ---
  'color.blue': 'BLÅ',
  'color.yellow': 'GUL',
  'color.red': 'RØD',
  'color.green': 'GRØN',
  'color.orange': 'ORANGE',
  'color.purple': 'LILLA',
  'color.white': 'HVID',
  'color.black': 'SORT',

  // --- Idéer ---
  'ideas.heading': 'Idéer & forbedringer',
  'ideas.difficulty': 'Sværhedsgrad',
  'ideas.difficulty.1': 'Progressivt tempo: intervallet bliver automatisk kortere hen gennem øvelsen/serien.',
  'ideas.difficulty.2': 'Flere farver (orange, lilla, hvid, sort) når basis-farverne bliver for nemme.',
  'ideas.difficulty.3': '"Distraktor": en telefon går sort ind imellem – spilleren skal sige "ingen"/"sort" i stedet.',
  'ideas.difficulty.4': '✅ Tal oveni farven (slå "Vis tal oveni farven" til i indstillingerne) – spilleren skal både se farve og læse/sige tal.',
  'ideas.difficulty.5': 'Bogstaver i stedet for tal, til endnu en variant.',
  'ideas.variants': 'Træningsvarianter',
  'ideas.variants.1': 'Peripert syn: farven vises kun kort (fx 300 ms) og går så sort igen – tvinger hurtigere blik.',
  'ideas.variants.2': '"Kald og bekræft": næste skift kommer først når coachen trykker godkend (kræver mikrofon/håndholdt dommer-knap).',
  'ideas.variants.3': 'Retningsbestemt opstilling: telefoner i forskellige højder/vinkler for at træne nakke- og øjenbevægelse, ikke kun sideblik.',
  'ideas.variants.4': 'Kombinér med decision-making: farven bestemmer hvilken finte/aflevering spilleren skal udføre efter modtagelse.',
  'ideas.multi': 'Multi-telefon',
  'ideas.multi.1': 'Garanti for at de 3 telefoner aldrig viser samme farve samtidig (allerede indbygget i Pair-tilstand).',
  'ideas.multi.2': '4. rolle som "coach-skærm" der viser alle 3 telefoners aktuelle farve og historik til feedback bagefter.',
  'ideas.multi.3': 'QR-kode i stedet for 4-cifret kode til hurtigere parring.',
  'ideas.data': 'Data & feedback',
  'ideas.data.1': 'Log antal reps, gennemsnitligt interval og session-varighed – eksportér til CSV for progression over tid.',
  'ideas.data.2': 'Coach markerer manuelt "rigtig/forkert" pr. rep via en enkel knap, så I kan tracke præcision, ikke kun tempo.',
  'ideas.data.3': 'Mikrofon-baseret reaktionstid (avanceret, kræver taledetektion) – realistisk først som fase 2.',
  'ideas.setup': 'Praktisk opsætning',
  'ideas.setup.1': 'Skru skærmens lysstyrke helt op og sluk "Sluk skærm automatisk" i iPhone-indstillinger, hvis Wake Lock ikke virker.',
  'ideas.setup.2': 'Brug billige telefonstativer/vægholdere til at placere telefonerne stabilt rundt om spilleren.',
  'ideas.setup.3': 'Kør parrings-serveren lokalt på en bærbar/hotspot til baner uden god mobildækning (se README).',
  'ideas.future': 'Fremtid',
  'ideas.future.1': 'Pak appen som en rigtig iOS-app via Capacitor for haptik, App Store-distribution og bedre baggrundsopførsel.',
  'ideas.future.2': 'Apple Watch-companion til coachen som fjernbetjening (start/pause/stop) uden at skulle røre en telefon.',
};

const en: Dict = {
  'meta.title': 'ReactX – Reaction Training',
  'meta.description': 'ReactX: full-screen color reactions for reaction training in football and other sports. Pair up to 3 phones together.',

  // --- Home ---
  'home.tagline.1': 'TRAIN',
  'home.tagline.2': 'REACT',
  'home.tagline.3': 'IMPROVE',
  'home.desc': 'Improve your reaction speed, decision-making and ability to scan your surroundings.',
  'home.cta.solo': 'Solo – one phone',
  'home.cta.pair': 'Pair up – 2-3 phones',
  'home.steps.heading': 'How it works',
  'home.steps.1.title': '1. Set up',
  'home.steps.1.body': 'Place the phone on a tripod or lean it against something, behind you.',
  'home.steps.2.title': '2. Scan',
  'home.steps.2.body': 'While the ball is played to you, the screen changes color.',
  'home.steps.3.title': '3. React',
  'home.steps.3.body': 'Call the color out loud, turn around, and receive the ball.',
  'home.multi.heading': 'Pair more phones',
  'home.multi.body': 'Pair up to 2 extra phones, and place them on goals, rebounders or cones. Each phone shows its own color, never the same as the others.',
  'home.multi.imgAlt': 'Player in front of three rebounders each with its own color – blue, red and red – with arrows showing the movement between them',
  'home.multi.caption': '3 phones in play – at the same time',
  'home.benefits.heading': 'Why reaction training',
  'home.benefits.1.title': 'Better scanning',
  'home.benefits.1.body': 'Pick up information around you faster.',
  'home.benefits.2.title': 'Faster reaction',
  'home.benefits.2.body': 'React quicker to visual stimuli.',
  'home.benefits.3.title': 'Better decisions',
  'home.benefits.3.body': 'Make faster, sharper choices on the pitch.',
  'home.benefits.4.title': 'Better performance',
  'home.benefits.4.body': 'Sharpen your mind, raise your level.',
  'home.ideasLink': 'Ideas for drills and improvements →',
  'home.heroImgAlt': 'Phone on a tripod showing the color purple, while a player scans the area and the ball is on its way',

  // --- Shared ---
  'common.back': '← Back',
  'common.startDrill': 'Start drill',
  'common.sec': 'sec',

  // --- Settings (shared by Solo and Pair) ---
  'settings.tempo': 'Tempo',
  'settings.fastest': 'Fastest change',
  'settings.slowest': 'Slowest change',
  'settings.colors': 'Colors',
  'settings.colorsInPlay': 'Colors in play',
  'settings.colorsHint': '{core} standard colors + {extra} extra for harder drills or more phones.',
  'settings.extra': 'Extra',
  'settings.avoidRepeat': 'Avoid the same color twice in a row',
  'settings.showCounter': 'Show counter (number of changes)',
  'settings.colorBlind': 'Color-blind help (shows color name as text)',
  'settings.showNumbers': 'Show a number on top of the color (say color + number)',
  'settings.soundCue': 'Sound cue on change',
  'settings.vibrationCue': 'Vibration on change',
  'settings.start': 'Start',
  'settings.countdown': 'Countdown before start',

  // --- Solo ---
  'solo.heading': 'Solo settings',
  'solo.noWakeLock': 'Your iPhone doesn’t support automatically keeping the screen on in this browser. Remember to turn down auto-lock in Settings while you train.',

  // --- Pair (home) ---
  'pairHome.heading': 'Pair phones together',
  'pairHome.urlPlaceholder': 'Enter the server address here',
  'pairHome.autoFound': '✓ Server found automatically – you don’t need to do anything.',
  'pairHome.advanced': 'Advanced: use a different server address',
  'pairHome.serverAddress': 'Server address',
  'pairHome.overrideHint': 'Only override this if you know you need a different server than the one found.',
  'pairHome.localTitle': 'Using a local server?',
  'pairHome.localBody': 'Close this page and instead open the address (or scan the QR code) shown in the terminal window when you started the local server. Everything will then fill in automatically.',
  'pairHome.exampleAddress': 'Only for your own cloud server, e.g.: wss://reactx-relay.onrender.com',
  'pairHome.sameServerHint': 'All 3 phones must use the same server address. See the README for details.',
  'pairHome.create': '➕ Create room (become host)',
  'pairHome.or': 'or',
  'pairHome.roomCode': 'Room code',
  'pairHome.roomCodePlaceholder': 'e.g. A7K2',
  'pairHome.join': '🔗 Join room',
  'pairHome.err.emptyAuto': 'The server address field is empty. Open "Advanced" and enter the address from the terminal window.',
  'pairHome.err.emptyManual': 'The server address field is empty. If you’re using a local server, open its address directly in Safari instead (see the box above) – this field is only for your own cloud server.',
  'pairHome.err.badFormat': 'The address must start with ws:// or wss:// – check that you haven’t typed something else by mistake.',
  'pairHome.err.shortCode': 'Enter the 4-character room code from the host’s phone.',

  // --- Pair (lobby) ---
  'pairLobby.leave': '← Leave room',
  'pairLobby.conn.idle': 'Not connected',
  'pairLobby.conn.connecting': 'Connecting…',
  'pairLobby.conn.open': 'Connected',
  'pairLobby.conn.reconnecting': 'Reconnecting…',
  'pairLobby.conn.closed': 'Disconnected',
  'pairLobby.codeLabel': 'ROOM CODE – share it with the two other phones',
  'pairLobby.waiting': 'Waiting for the host to start the drill…',
  'pairLobby.startAll': 'Start drill on all phones',
  'pairLobby.slot.host': 'Host',
  'pairLobby.slot.player2': 'Player 2',
  'pairLobby.slot.player3': 'Player 3',

  // --- Pair (run) ---
  'pairRun.host': 'HOST',
  'pairRun.reconnecting': 'RECONNECTING…',

  // --- Color screen ---
  'colorScreen.pauseHint': 'Tap here to pause/stop',
  'colorScreen.pauseAria': 'Pause and stop',
  'colorScreen.ready': 'READY!',
  'colorScreen.pause': 'Pause',
  'colorScreen.resume': 'Resume',
  'colorScreen.hostControls': 'The host controls this drill',
  'colorScreen.stop': '⏹ Stop drill',
  'colorScreen.closeMenu': 'Close menu',

  // --- Color names ---
  'color.blue': 'BLUE',
  'color.yellow': 'YELLOW',
  'color.red': 'RED',
  'color.green': 'GREEN',
  'color.orange': 'ORANGE',
  'color.purple': 'PURPLE',
  'color.white': 'WHITE',
  'color.black': 'BLACK',

  // --- Ideas ---
  'ideas.heading': 'Ideas & improvements',
  'ideas.difficulty': 'Difficulty',
  'ideas.difficulty.1': 'Progressive tempo: the interval automatically gets shorter through the drill/series.',
  'ideas.difficulty.2': 'More colors (orange, purple, white, black) once the base colors get too easy.',
  'ideas.difficulty.3': '"Distractor": a phone occasionally goes black – the player should say "none"/"black" instead.',
  'ideas.difficulty.4': '✅ Numbers on top of the color (turn on "Show a number on top of the color" in settings) – the player has to both see the color and read/say the number.',
  'ideas.difficulty.5': 'Letters instead of numbers, for yet another variant.',
  'ideas.variants': 'Training variants',
  'ideas.variants.1': 'Peripheral vision: the color only shows briefly (e.g. 300 ms) and then goes black again – forces a quicker glance.',
  'ideas.variants.2': '"Call and confirm": the next change only comes once the coach presses approve (requires a microphone/handheld referee button).',
  'ideas.variants.3': 'Directional setup: phones at different heights/angles to train neck and eye movement, not just sideways glances.',
  'ideas.variants.4': 'Combine with decision-making: the color determines which feint/pass the player should perform after receiving.',
  'ideas.multi': 'Multi-phone',
  'ideas.multi.1': 'Guarantee that the 3 phones never show the same color at the same time (already built into Pair mode).',
  'ideas.multi.2': 'A 4th role as a "coach screen" that shows all 3 phones’ current color and history for feedback afterwards.',
  'ideas.multi.3': 'QR code instead of a 4-digit code for faster pairing.',
  'ideas.data': 'Data & feedback',
  'ideas.data.1': 'Log number of reps, average interval and session length – export to CSV to track progression over time.',
  'ideas.data.2': 'Coach manually marks "correct/incorrect" per rep via a simple button, so you can track accuracy, not just tempo.',
  'ideas.data.3': 'Microphone-based reaction time (advanced, requires speech detection) – realistic only as a phase 2.',
  'ideas.setup': 'Practical setup',
  'ideas.setup.1': 'Turn the screen brightness all the way up and turn off "Auto-Lock" in iPhone Settings if Wake Lock doesn’t work.',
  'ideas.setup.2': 'Use cheap phone tripods/wall mounts to place the phones stably around the player.',
  'ideas.setup.3': 'Run the pairing server locally on a laptop/hotspot for pitches without good mobile coverage (see README).',
  'ideas.future': 'Future',
  'ideas.future.1': 'Package the app as a real iOS app via Capacitor for haptics, App Store distribution and better background behavior.',
  'ideas.future.2': 'Apple Watch companion for the coach as a remote control (start/pause/stop) without touching a phone.',
};

const dicts: Record<Lang, Dict> = { da, en };

/**
 * Slår en tekst op i den aktive sprogordbog. Falder tilbage til engelsk,
 * og til sidst til selve nøglen, hvis noget skulle mangle en oversættelse.
 */
export function t(key: string, vars?: Record<string, string | number>): string {
  const raw = dicts[lang][key] ?? dicts.en[key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
