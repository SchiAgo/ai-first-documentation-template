# ID Lifecycle Rules

## Scopo

Definire il ciclo di vita degli identificativi.

---

## Regola Fondamentale

Un ID assegnato non deve mai essere riutilizzato.

---

## Formato e Ambito degli ID

Gli identificativi ufficiali usano il formato `PREFIX-NNN`, con un prefisso maiuscolo
e un numero da `001` a `999`.

I prefissi standard sono:

- `FR`
- `NFR`
- `FLOW`
- `ENT`
- `API`
- `UI`
- `EPIC`
- `TASK`
- `ADR`

I segnaposto `XXX`, `YYY` e `ID` sono ammessi solo come riferimenti o valori di template;
non rappresentano identificativi assegnati.

Ogni identificativo viene definito nel documento proprietario stabilito dal framework.
Le occorrenze negli altri documenti sono riferimenti e possono ripetersi. La validazione
automatica controlla il formato e i duplicati nelle definizioni, senza imporre una
numerazione consecutiva.

---

## Creazione

Nuovi elementi ricevono il successivo ID disponibile.

Esempio:

FR-001

FR-002

FR-003

---

## Eliminazione

L'ID non viene cancellato.

Lo stato cambia in:

DEPRECATED

---

## Sostituzione

Consentita tramite riferimento.

Esempio:

FR-012

Sostituito da

FR-024

---

## Divieti

Non rinumerare.

Non riutilizzare.

Non modificare retroattivamente.

---

## Tracciabilità

Ogni cambio stato deve essere registrato nel changelog.
