# Traceability Rules

## Catena Funzionale e Realizzativa

FR

↓

FLOW

↓

ENT

↓

API

↓

UI

↓

EPIC

↓

TASK

---

## Collegamento alle ADR

L'ADR non è un passaggio obbligatorio della catena di tracciabilità per ogni requisito,
flow o task. È un collegamento decisionale associato agli artefatti interessati, non
l'ultimo anello del percorso funzionale e realizzativo.

Collega un'ADR quando una decisione architetturale documentata influenza uno o più
requisiti, flow, entità, API, componenti UI, epic o task. Se non esiste una decisione
architetturale pertinente, non è necessario creare un'ADR né compilare la relativa cella
della matrice.

Quando una modifica introduce o cambia una decisione architetturale significativa,
la decisione deve essere registrata secondo il processo ADR e collegata agli artefatti
impattati. Non omettere un'ADR pertinente solo perché il collegamento è facoltativo per
gli altri percorsi.

Nella matrice, la cella ADR può quindi essere vuota quando non c'è una decisione
applicabile. `ADR-XXX` è un segnaposto ammesso nei template e non rappresenta un
riferimento a un'ADR reale.

## Regole

Ogni FR deve essere collegato ad almeno un FLOW.

Ogni FLOW deve essere collegato a:

- almeno una ENT
- almeno una API
- almeno una UI

Ogni EPIC deve derivare da un requisito.

Ogni TASK deve appartenere ad una EPIC.

Ogni riga della matrice rappresenta un percorso con un solo ID per cella. Usa righe
aggiuntive per rappresentare collegamenti ulteriori. Le occorrenze ripetute dello stesso
ID in righe diverse sono riferimenti e non definizioni duplicate.

---

## Elementi Orfani

Gli artefatti obbligatori della catena funzionale e realizzativa non devono essere privi
dei collegamenti richiesti dalle regole sopra. In particolare, sono da correggere:

- FR orfani
- FLOW orfani
- ENT orfane
- API orfane
- UI orfane
- EPIC orfane
- TASK non collegate a un'EPIC

Un'ADR non è orfana solo perché non è associata a ogni riga della matrice. Le ADR
applicabili devono però essere collegate agli artefatti che la decisione influenza.
