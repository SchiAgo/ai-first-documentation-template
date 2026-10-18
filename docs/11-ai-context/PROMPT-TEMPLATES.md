# Prompt Templates

## Regola Fondamentale

Prima di eseguire un'attività:

1. Identificare i documenti pertinenti al compito richiesto.
2. Consultare tutte le fonti disponibili rilevanti.
3. Verificare la tracciabilità quando applicabile.
4. Segnalare documentazione mancante, incompleta o contraddittoria.
5. Bloccare solo le attività che dipendono da informazioni, decisioni o approvazioni non verificabili.

La mancanza di documentazione non impedisce attività di analisi, discovery, reverse engineering o ricostruzione documentale, ma deve essere sempre dichiarata esplicitamente.

Le attività che producono modifiche normative, architetturali o implementative devono invece essere sospese quando il contesto disponibile non è sufficiente a garantire correttezza e tracciabilità.

---

## Istruzioni Comuni

Usa queste regole per ogni prompt del catalogo:

- Leggi i documenti indicati e verifica la matrice di tracciabilità prima di formulare una soluzione.
- Tratta PRD, Application Flows, TRD, Data Architecture, Design System e ADR approvate come fonti autorevoli nei rispettivi ambiti.
- Non inventare requisiti, identificativi, endpoint, entità, regole di business o decisioni architetturali.
- Se il contesto è mancante, incompleto o contraddittorio, elenca le lacune e chiedi chiarimenti prima di procedere con attività che dipendono da esse.
- Distingui fatti documentati, ipotesi e raccomandazioni.
- Motiva ogni raccomandazione.
- Riporta gli ID esistenti esattamente come documentati.
- Non assegnare nuovi ID senza autorizzazione.
- Limita l'analisi all'ambito richiesto.
- Segnala sempre gli impatti sui documenti correlati.
- Non dichiarare verifiche, test o modifiche come completati se non sono stati realmente eseguiti.

---

## Analysis Prompts

### Analisi di un Requisito

Contesto richiesto:

- FR interessato
- PRD
- Application Flows
- TRD
- Data Architecture
- ADR correlate
- Traceability Matrix

Analizza il requisito [FR-ID].

Restituisci:

1. Sintesi del requisito.
2. Attori coinvolti.
3. Regole di business.
4. Precondizioni.
5. Postcondizioni.
6. Acceptance Criteria.
7. FLOW collegati.
8. ENT collegate.
9. API collegate.
10. UI collegate.
11. EPIC collegate.
12. ADR coinvolte.
13. Rischi.
14. Dipendenze.
15. Ambiguità o contraddizioni.

Non generare codice.

---

### Impact Analysis

Contesto richiesto:

- FR
- FLOW
- ENT
- API
- UI
- EPIC
- ADR
- Traceability Matrix

Analizza l'impatto della modifica di [ID].

Identifica:

- documenti coinvolti
- dati coinvolti
- API coinvolte
- UI coinvolte
- ADR coinvolte
- test da aggiornare

Classifica il rischio:

- LOW
- MEDIUM
- HIGH

---

### Architecture Consistency Check

Contesto richiesto:

- PRD
- TRD
- Application Flows
- Data Architecture
- ADR
- Traceability Matrix

Verifica la coerenza globale del sistema.

Individua:

- contraddizioni
- requisiti non coperti
- flow incompleti
- dati non referenziati
- API non tracciate
- ADR non rispettate
- elementi orfani

Classifica ogni rilievo:

- LOW
- MEDIUM
- HIGH

---

### Reverse Engineering

Contesto richiesto:

- codice sorgente
- configurazioni
- documentazione disponibile

Ricostruisci:

- requisiti candidati (inferiti)
- flow candidati
- API candidate
- entità candidate
- componenti UI candidati
- decisioni architetturali candidate

Per ogni elemento inferito riportare:

- evidenza osservata
- livello di confidenza
- documenti di supporto
- necessità di conferma umana

I requisiti inferiti non devono essere considerati approvati e non devono ricevere ID ufficiali finché non vengono validati tramite il processo di governance del progetto.

---

## Design Prompts

### Database Design

Contesto richiesto:

- FR
- FLOW
- Data Architecture
- TRD
- ADR

Progetta la modifica dati necessaria.

Specifica:

- entità
- attributi
- tipi
- vincoli
- relazioni
- indici
- strategia di migrazione
- rollback

---

### Migration Analysis

Contesto richiesto:

- schema dati corrente
- Data Architecture
- TRD
- ADR
- requisiti della modifica

Valuta:

1. differenze tra stato attuale e stato target
2. compatibilità con dati esistenti
3. compatibilità applicativa
4. rischi di perdita dati
5. rischi di corruzione dati
6. strategia di rollback
7. strategia di rilascio

Restituisci:

- piano di migrazione
- prerequisiti
- operazioni di validazione
- rischi
- rollback

Distinguere chiaramente fatti verificati, ipotesi e informazioni mancanti.

---

### Architecture Review

Contesto richiesto:

- PRD
- TRD
- Application Flows
- Data Architecture
- ADR
- Implementation Plan

Valuta:

- aderenza ai requisiti
- rischi tecnici
- performance
- sicurezza
- scalabilità
- manutenibilità

Non modificare il codice.

---

### ADR Generation

Contesto richiesto:

- problema
- contesto
- documenti coinvolti
- alternative valutate

Genera una bozza ADR completa:

- contesto
- problema
- alternative
- trade-off
- decisione
- motivazione
- conseguenze
- rollback

Non inventare approvazioni o decisioni non confermate.

---

## Development Prompts

### Generazione Backend

Contesto richiesto:

- API
- FR
- FLOW
- ENT
- TRD
- ADR

Genera:

- Controller
- Service
- Repository
- DTO
- Validation
- Unit Test

Rispetta architettura e ADR.

Output Atteso

1. Analisi preliminare
2. Lacune bloccanti
3. Piano di implementazione
4. Modifiche proposte
5. Codice generato
6. Test previsti
7. Aggiornamenti documentali richiesti
8. Elementi di tracciabilità coinvolti

---

### Generazione Frontend

Contesto richiesto:

- UI
- FR
- FLOW
- Design System
- API

Genera:

- componente
- gestione stato
- validazione
- gestione errori
- loading state
- test

Output Atteso

1. Analisi preliminare
2. Lacune bloccanti
3. Piano di implementazione
4. Componenti coinvolti
5. Codice generato
6. Test previsti
7. Aggiornamenti documentali richiesti
8. Elementi di tracciabilità coinvolti

---

### Refactoring

Contesto richiesto:

- codice
- requisiti
- FLOW
- TRD
- ADR
- test esistenti

Valuta ed esegui un refactoring senza cambiare il comportamento esterno.

Segnala:

- debito tecnico
- duplicazioni
- violazioni architetturali

---

## Validation Prompts

### Security Review

Contesto richiesto:

- codice
- TRD
- Data Architecture
- ADR

Verifica:

- autenticazione
- autorizzazione
- validazione input
- gestione segreti
- logging
- audit
- protezione dati

Classifica i rischi:

- LOW
- MEDIUM
- HIGH

Per ogni rilievo riportare:

- Severità
- Livello di Confidenza
- Evidenza
- File
- Riga (se disponibile)
- Scenario di abuso
- Impatto
- Mitigazione consigliata

Le lacune informative devono essere riportate separatamente dalle vulnerabilità confermate.

---

### Test Generation

Contesto richiesto:

- FR
- FLOW
- API
- UI
- Acceptance Criteria

Genera:

- Unit Test
- Integration Test
- E2E Test

Mappa ogni test ad un Acceptance Criterion.

---

### Code Review

Contesto richiesto:

- codice
- requisiti
- FLOW
- TRD
- ADR

Analizza:

- correttezza
- sicurezza
- performance
- testabilità
- manutenibilità

Segnala solo problemi verificabili.

---

### Documentation Review

Contesto richiesto:

- documentazione completa
- Traceability Matrix

Verifica:

- completezza
- coerenza
- tracciabilità
- duplicazioni
- contraddizioni
