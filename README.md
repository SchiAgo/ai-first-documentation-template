# AI-First Software Documentation Framework

Framework documentale professionale per:

- SaaS
- ERP
- WMS
- Applicazioni Full-Stack
- AI-Assisted Development

## Obiettivi

- Single Source of Truth
- Tracciabilità Completa
- Governance Documentale
- Riduzione delle Allucinazioni AI
- Coerenza Architetturale

## Principi

No Code Before Documentation.

No AI Generation Before Traceability.

## Flusso di Progettazione

PRD
↓
Application Flows
↓
Design System
↓
TRD
↓
Data Architecture
↓
ADR
↓
Implementation Plan

## Tracciabilità

FR → FLOW → ENT → API → UI → EPIC → TASK → ADR

## AI Context Engineering

Il framework include un layer dedicato ai sistemi AI.

Documenti disponibili:

- PROJECT-BOOTSTRAP.md
- AI-SYSTEM-CONTEXT.md
- AI-DEVELOPMENT-WORKFLOW.md
- AI-CODE-GENERATION-RULES.md
- PROMPT-TEMPLATES.md
- AI-ROLE-PROMPTS.md
- AI-REVIEW-CHECKLIST.md
- PROJECT-SNAPSHOT.md

PROMPT-TEMPLATES contiene prompt orientati alle attività.

AI-ROLE-PROMPTS contiene prompt orientati ai ruoli professionali.

Questi documenti consentono ad un sistema AI di comprendere rapidamente il progetto mantenendo coerenza e tracciabilità.

## Quality Gates

Il framework include validazioni automatiche:

- struttura documentale
- identificativi
- ADR
- matrice di tracciabilità

Le validazioni vengono eseguite automaticamente tramite GitHub Actions.

## Governance

La governance del framework è definita in:

docs/00-governance

Include:

- ownership
- naming conventions
- lifecycle management
- traceability
- AI collaboration rules
