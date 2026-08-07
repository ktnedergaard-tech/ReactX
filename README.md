# ReactX

Fuldskærms farve-reaktionstræning til iPhone (webapp / PWA). Skærmen skifter
mellem **blå, gul, rød og grøn** (+ flere valgfrie farver) med tilfældige
mellemrum. Bygget til øvelser som:

> Spilleren står med ryggen til telefonen og spiller bolden op af en
> rebounder. Mens bolden er på vej tilbage, skal spilleren nå at scanne
> området, se farven/farverne på telefonen(erne) og råbe dem højt – inden
> bolden modtages. Farverne skifter for hver scanning.

Der er to tilstande:

- **Solo** – én telefon, kører 100 % offline, ingen opsætning.
- **Par sammen** – 2-3 telefoner synkroniseres via en lille relay-server, så
  ingen af de tilsluttede telefoner nogensinde viser samme farve samtidig.
  Spilleren skal derfor identificere op til 3 forskellige farver på én gang.

Prøv appen live på telefonen ved at åbne den i Safari og vælge **Del → Føj
til hjemmeskærm** – så åbner den som en rigtig app uden browser-linje.

---

## Kom i gang (udvikling)

```bash
npm install
npm run dev        # åbn på din computer
```

For at teste på selve iPhone'en mens du udvikler: sørg for at telefonen og
computeren er på samme wifi, kør `npm run dev` (den lytter på alle netværk),
og åbn `http://<din-computers-lokale-ip>:5173` i Safari på telefonen.

```bash
npm run build       # bygger til /dist – klar til hosting som statisk site
npm run preview      # server /dist lokalt, til slut-test før deploy
npm run gen-icons    # genererer app-ikonerne i public/icons (kør kun hvis du ændrer scripts/generate-icons.mjs)
```

## Deploy af selve appen (frontend)

`/dist` er et rent statisk website og kan hostes hvor som helst – nemmest er
[Vercel](https://vercel.com), [Netlify](https://netlify.com) eller GitHub
Pages. Peg blot build-kommandoen på `npm run build` og output-mappen på
`dist`.

## Parrings-server (til "Par sammen"-tilstand)

Filen `/server/server.mjs` er en lille, selvstændig Node.js
WebSocket-server (kun afhængig af pakken `ws`), som holder styr på rum,
indstillinger og selve farve-timeren. Timeren kører **på serveren**, ikke på
telefonerne – det er det, der sikrer at alle 3 telefoner skifter farve på
præcis samme tidspunkt, uanset forskelle i telefonernes egen klokke/ydelse.

Netlify (eller GitHub Pages/Vercel) kan **kun** hoste selve appen – de kører
ikke en vedvarende baggrundsproces, som en WebSocket-server kræver. Serveren
skal derfor køre et andet sted. Det er et **engangs-setup for coachen**, ikke
noget spillerne skal tænke på.

### Lokalt på en bærbar (anbefalet – virker uden internet på banen)

Da mange baner har dårlig mobildækning, er det mest driftsikre at køre
serveren på en bærbar computer, som telefonerne er på samme wifi/hotspot
som. Selve internetforbindelsen er kun nødvendig for at hente appen første
gang (den er cachet bagefter) – parringen kører 100% lokalt på netværket.

1. Hent/klon dette repo til den bærbare, I tager med til træning/kamp.
2. Dobbeltklik `server/start-mac.command` (Mac) eller
   `server/start-windows.bat` (Windows). Kræver Node.js installeret –
   scriptet siger til og linker til [nodejs.org](https://nodejs.org) hvis
   det mangler. Første gang installeres serverens afhængigheder automatisk.
3. Terminal-vinduet, der åbner, viser præcis den adresse I skal bruge, fx:
   ```
   ws://192.168.1.23:8080
   ```
   Indtast den under "Server-adresse" (findes under "Avanceret" i Par
   sammen-menuen) på **alle 3 telefoner**.
4. Alle telefoner + den bærbare skal være på samme wifi (eller den
   bærbares hotspot, hvis banen ikke har wifi). Luk vinduet for at stoppe
   serveren igen efter træning.

Adressen kan skifte fra gang til gang (afhænger af netværket I er på), så
tjek terminal-vinduet hver gang – det er derfor denne løsning ikke er bagt
ind som fast standard-adresse i appen sådan som en cloud-server ville være.

### Alternativ: gratis cloud-hosting (kræver internet)

Hvis I hellere vil have en fast adresse der virker hvor som helst med
internet (og slipper for at have en bærbar med), indeholder repoet en
`render.yaml`, så [Render](https://render.com) kan oprette serveren
automatisk:

**[→ Deploy relay-serveren til Render](https://render.com/deploy?repo=https://github.com/ktnedergaard-tech/ReactX)**

1. Klik linket, log ind med GitHub (samme konto som repoet), klik "Apply"/"Deploy".
2. Vent ca. 1 minut mens Render bygger og starter serveren (gratis plan).
3. Kopiér adressen Render giver dig, fx `https://reactx-relay.onrender.com`.
4. Sæt den ind i `src/config.ts` (`DEFAULT_RELAY_URL`) og push – herefter er
   server-adressen bagt ind i appen, og "Par sammen" virker med det samme
   for alle, uden at nogen skal indtaste noget.

Bemærk: Renders gratis plan går i dvale efter inaktivitet og bruger nogle
sekunder på at vågne ved første forbindelse. Fly.io og Railway virker også
efter samme opskrift (peg på `/server`, build `npm install`, start `npm start`).

Serveren er bevidst holdt simpel (rum gemmes i hukommelsen, ingen database) –
fuldt tilstrækkeligt til en træningssession, men rum forsvinder hvis
serveren genstartes.

---

## Sådan bruges appen til øvelsen

1. **Solo**: Vælg *Solo*, indstil tempo/farver, tryk *Start*. Placér
   telefonen et sted spilleren kan scanne uden at kigge direkte på den hele
   tiden.
2. **Par sammen**: Én telefon opretter et rum og bliver "vært" (får en
   4-tegns kode). De to andre telefoner vælger *Deltag i rum* og indtaster
   koden. Værten sætter tempo/farver og trykker *Start* – så starter alle 3
   telefoner samtidig og viser hele tiden **forskellige** farver.
3. Placér telefonerne rundt om spilleren (fx bag, til venstre, til højre)
   på stativer eller lænet op ad noget i den højde, spilleren naturligt vil
   dreje hovedet mod.
4. Skru skærmens lysstyrke helt op, og skru "Sluk skærm automatisk" af i
   iPhone-indstillinger, hvis appen ikke selv kan holde skærmen tændt
   (kræver iOS 16.4+ for automatisk "wake lock").
5. Tryk i øverste højre hjørne af farveskærmen for at åbne pause/afslut-menuen
   uden at røre resten af skærmen (så en fejlramt bold ikke rammer en knap).

---

## Idéer & forbedringer

*(Findes også inde i appen under "Idéer til øvelser og forbedringer".)*

**Sværhedsgrad**
- Progressivt tempo: intervallet bliver kortere hen gennem serien.
- Flere farver (orange/lilla/hvid/sort) når basisfarverne er for nemme.
- "Distraktor": en telefon går sort ind imellem – spilleren skal sige
  "ingen"/"sort".
- ✅ Tal oven i farven (slås til under "Vis tal oveni farven") for ekstra
  kognitiv belastning – i Pair-tilstand er både farve og tal garanteret
  forskellige på tværs af telefonerne.
- Bogstaver i stedet for/oven i tal, til endnu en variant.

**Træningsvarianter**
- Peripert syn: farven vises kun kort (fx 300 ms) og går sort igen.
- "Kald og bekræft": coach godkender manuelt før næste skift.
- Kombinér med beslutningstræning: farven bestemmer hvilken finte/aflevering
  spilleren skal lave efter modtagelsen.

**Multi-telefon**
- QR-kode i stedet for 4-cifret kode for hurtigere parring.
- 4. rolle som "coach-skærm" der viser alle 3 telefoners farver/historik.

**Data & feedback**
- Log reps, gennemsnitligt interval og session-varighed, eksportér til CSV.
- Coach markerer manuelt rigtig/forkert pr. rep for at tracke præcision.
- Mikrofon-baseret automatisk reaktionstid (kræver taledetektion – fase 2).

**Fremtid**
- Pak som rigtig iOS-app via Capacitor for haptik, App Store-distribution
  og bedre baggrundsopførsel.
- Apple Watch-fjernbetjening til coachen (start/pause/stop).

---

## Teknisk opbygning

```
index.html, src/            Vite + TypeScript, ingen UI-framework (holder
                             appen let og hurtig – vigtigt når farveskift
                             skal ramme skærmen med det samme).
src/drill.ts                 Solo-tilstandens lokale timer-loop.
src/net/, src/pairSession.ts WebSocket-klient + delt tilstand for parring.
src/colorScreen.ts            Den fælles fuldskærms-farvevisning.
public/                       PWA-manifest, ikoner, offline service worker.
server/server.mjs             Relay-server til "Par sammen" (rum, timing,
                               garanti for forskellige farver pr. telefon).
```
