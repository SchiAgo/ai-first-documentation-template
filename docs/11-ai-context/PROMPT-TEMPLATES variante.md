# Prompt Templates

> **STORICO — NON CANONICO**
>
> Questa è una copia storica conservata solo come riferimento. Non usarla né aggiornarla
> come fonte operativa: la versione canonica è
> [PROMPT-TEMPLATES.md](./PROMPT-TEMPLATES.md). In caso di differenze, prevale sempre la
> versione canonica.

## Istruzioni Comuni

Usa queste regole per ogni prompt del catalogo:

- Leggi i documenti indicati e verifica la matrice di tracciabilità prima di formulare una soluzione.
- Tratta PRD, Application Flows, TRD, Data Architecture, Design System e ADR approvate come fonti autorevoli nei rispettivi ambiti.
- Non inventare requisiti, identificativi, endpoint, entità, regole di business o decisioni architetturali.
- Se il contesto è mancante, incompleto o contraddittorio, elenca le lacune e chiedi chiarimenti prima di procedere con attività che dipendono da esse.
- Distingui fatti documentati, ipotesi e raccomandazioni; motiva ogni raccomandazione.
- Riporta gli ID esistenti esattamente come documentati. Non assegnare nuovi ID senza autorizzazione.
- Limita l'analisi o le modifiche all'ambito richiesto e segnala gli impatti sulla tracciabilità e sui documenti correlati.
- Non dichiarare verifiche, test o modifiche come completati se non sono stati effettivamente eseguiti.

Per usare un prompt, sostituisci i segnaposto tra parentesi quadre e fornisci i documenti indicati. Se un documento non esiste o non è applicabile, dichiaralo esplicitamente.

---

## Analisi di un Requisito

**Contesto richiesto:** FR interessato, PRD, Application Flows, TRD, Data Architecture, ADR correlate e Traceability Matrix.

```text
Analizza il requisito [FR-ID] usando i documenti forniti.

Restituisci:
1. Sintesi del requisito e degli attori coinvolti.
2. Regole di business, precondizioni, postcondizioni e acceptance criteria documentati.
3. FLOW, ENT, API, UI, EPIC, TASK e ADR collegati, riportando gli ID esistenti.
4. Dipendenze, rischi, casi alternativi e casi di errore.
5. Lacune, ambiguità o contraddizioni che richiedono una decisione.
6. Impatto previsto su documentazione, implementazione e test.

Non proporre codice finché le lacune bloccanti non sono state chiarite.
```

---

## Generazione Backend

**Contesto richiesto:** API, FR e FLOW collegati, entità coinvolte, TRD, ADR e convenzioni del repository.

```text
Prepara l'implementazione backend di [API-ID] nel repository fornito.

Prima di modificare file:
1. Verifica la tracciabilità e leggi i documenti indicati.
2. Riassumi i comportamenti e i vincoli documentati.
3. Elenca eventuali lacune bloccanti. Fermati e chiedi chiarimenti se ne trovi.

Se il contesto è sufficiente, implementa solo quanto richiesto, seguendo i pattern esistenti.
Includi validazione degli input, autorizzazione, gestione degli errori e test pertinenti secondo
i requisiti e le convenzioni documentate. Non introdurre dipendenze o comportamenti non richiesti.

Al termine, riporta:
- file modificati e motivazione;
- requisiti e ID coperti;
- test eseguiti e risultati effettivi;
- documentazione o tracciabilità da aggiornare.
```

---

## Generazione Frontend

**Contesto richiesto:** UI e FR collegati, FLOW, Design System, API e convenzioni del repository.

```text
Prepara l'implementazione frontend di [UI-ID] nel repository fornito.

Verifica prima i documenti e la tracciabilità. Non inventare stati, regole di validazione,
permessi o comportamenti assenti dalle fonti. Chiedi chiarimenti per le lacune bloccanti.

Se il contesto è sufficiente, implementa il componente rispettando Design System e pattern
esistenti. Considera gli stati di caricamento, successo, errore e accesso negato quando
previsti dai documenti. Aggiungi test coerenti con i comportamenti specificati.

Al termine, riporta file modificati, ID coperti, test eseguiti e risultati, oltre a eventuali
aggiornamenti documentali necessari.
```

---

## Architecture Review

**Contesto richiesto:** PRD, TRD, Application Flows, Data Architecture, ADR, Implementation Plan e matrice di tracciabilità.

```text
Esegui una review architetturale del cambiamento [DESCRIZIONE O RIFERIMENTO].

Confronta il cambiamento con le fonti autorevoli e individua:
- violazioni o contraddizioni rispetto a requisiti, flussi, architettura o ADR approvate;
- impatti su componenti, API, dati, sicurezza, performance, scalabilità e integrazioni;
- dipendenze e rischi tecnici, distinguendo quelli documentati dalle nuove osservazioni;
- lacune di tracciabilità e documenti da aggiornare.

Per ogni rilievo indica severità, evidenza (documento/sezione o file/riga, se disponibile),
impatto e azione raccomandata. Se non trovi evidenza sufficiente, dichiaralo; non presentare
ipotesi come difetti certi. Non modificare codice o documenti.
```

---

## Database Design

**Contesto richiesto:** FR e FLOW interessati, Data Architecture, TRD, ADR e convenzioni di persistenza del repository.

```text
Progetta la modifica ai dati necessaria per [FR-ID / DESCRIZIONE].

Prima verifica che requisito, flusso e tracciabilità siano sufficientemente definiti. Presenta
una proposta che specifichi:
- entità, attributi, tipi, nullabilità, chiavi, vincoli e relazioni;
- indici motivati dai pattern di accesso noti;
- classificazione, ownership, retention, audit e protezione dei dati applicabili;
- compatibilità con il modello e le decisioni architetturali esistenti;
- migrazione e rollback, se richiesti.

Se mancano dettagli determinanti, separa le domande aperte dalla proposta e non inventare
regole di dominio. Non applicare migrazioni senza autorizzazione esplicita.
```

---

## Migration Analysis

**Contesto richiesto:** schema attuale, Data Architecture, TRD, ADR, migrazioni esistenti e requisito della modifica.

```text
Analizza la migrazione necessaria per [DESCRIZIONE / FR-ID].

Valuta:
1. Differenze tra stato attuale e stato previsto.
2. Compatibilità con dati e versioni applicative esistenti.
3. Rischi di perdita, corruzione, blocco o esposizione dei dati.
4. Ordine di rilascio e necessità di una strategia expand/contract o backfill.
5. Verifiche pre e post-migrazione, rollback e relativi limiti.
6. Impatto su API, entità, flussi, ADR e matrice di tracciabilità.

Distingui i fatti verificati dalle ipotesi e segnala le informazioni mancanti. Non eseguire
la migrazione e non dichiararla sicura senza evidenze adeguate.
```

---

## Security Review

**Contesto richiesto:** requisiti e flussi interessati, TRD, modello dati, ADR e codice o diff da revisionare.

```text
Revisiona [CODICE / DIFF / PROPOSTA] per individuare vulnerabilità concrete nel contesto
dei documenti forniti.

Per ogni problema riportato indica:
- severità e livello di confidenza;
- file e righe o altra evidenza verificabile;
- scenario di abuso e impatto;
- mitigazione minima coerente con architettura e requisiti.

Esamina, quando pertinenti, autenticazione, autorizzazione, validazione input, gestione
segreti, logging, protezione dati, API e dipendenze. Non dedurre una vulnerabilità dalla
sola assenza di informazioni; segnala separatamente le lacune da chiarire. Non modificare
il codice.
```

---

## ADR Generation

**Contesto richiesto:** problema e contesto, requisiti e documenti coinvolti, alternative considerate e decisione del responsabile.

```text
Prepara una bozza di ADR per la decisione [DESCRIZIONE].

Includi contesto, problema, requisiti coinvolti, documenti e ADR correlate, alternative
valutate con pro e contro, trade-off, decisione, motivazione, conseguenze e strategia di
rollback quando applicabile.

Non inventare una decisione, alternative già valutate, approvazioni o ID. Usa segnaposto per
le informazioni mancanti e indica le domande che il responsabile deve risolvere. La bozza
non è approvata finché non viene revisionata e accettata secondo il workflow del progetto.
```

---

## Refactoring

**Contesto richiesto:** codice interessato, requisiti e flussi collegati, TRD, ADR, test esistenti e matrice di tracciabilità.

```text
Valuta ed esegui il refactoring di [AMBITO] senza cambiare il comportamento esterno.

Prima:
1. Identifica il comportamento atteso dai documenti e dai test.
2. Verifica le ADR e le dipendenze.
3. Elenca rischi, lacune e file che prevedi di modificare.
4. Fermati se il refactoring richiede una modifica funzionale o una decisione architetturale
   non approvata.

Se l'ambito è chiaro, applica modifiche minime e coerenti con i pattern del repository.
Esegui i test pertinenti e riporta risultati effettivi, file modificati, tracciabilità
interessata e qualsiasi differenza di comportamento rilevata.
```

---

## Test Generation

**Contesto richiesto:** FR/API/UI e FLOW collegati, acceptance criteria, codice e test esistenti, TRD.

```text
Definisci e, se richiesto, implementa i test per [ID / CAMBIAMENTO].

Mappa ogni test a un acceptance criterion o comportamento documentato. Copri i casi nominali,
i limiti, gli input non validi, i casi di errore e i permessi pertinenti. Distingui unit,
integration ed end-to-end in base ai confini effettivamente presenti nel progetto.

Non inventare risultati attesi non documentati: elenca le lacune che richiedono chiarimenti.
Segui gli strumenti e le convenzioni di test esistenti. Riporta i test aggiunti o modificati,
i comandi eseguiti e i risultati effettivi; non dichiarare copertura misurata se non è stata
misurata.
```

---

## Code Review

**Contesto richiesto:** diff o codice da revisionare, requisiti e ID collegati, TRD, ADR e test pertinenti.

```text
Revisiona il diff fornito rispetto ai requisiti, ai flussi, al TRD, alle ADR e alle convenzioni
del repository.

Riporta solo problemi concreti e azionabili, ordinati per severità. Per ogni rilievo indica
file/riga, comportamento problematico, impatto e correzione suggerita. Controlla inoltre
copertura dei test, gestione errori, sicurezza, performance e tracciabilità quando pertinenti.

Non modificare il codice. Se non trovi problemi, dichiaralo e segnala eventuali aree non
verificabili per mancanza di contesto.
```
