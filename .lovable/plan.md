

## Piano: Redesign Clienti come Lista con Dettaglio Espandibile e Ricerca

### Modifiche in `src/components/ClientManager.tsx`

Riscrivere il layout da griglia di card a **lista tabellare/inline** con le seguenti caratteristiche:

**1. Barra di ricerca**
- Aggiungere un `Input` con icona `Search` sotto l'header, per filtrare clienti per nome, azienda o email.

**2. Lista clienti inline**
- Ogni riga mostra: avatar/iniziali, nome, azienda, numero progetti, valore totale progetti.
- Layout compatto con `Collapsible` (da radix) per espandere i dettagli al click.

**3. Dettaglio espandibile (on click)**
- Al click sulla riga si espande mostrando:
  - Email, telefono
  - Lista progetti con colore e nome
  - Pulsanti Modifica / Elimina

**4. KPI inline**
- Nella riga principale: `N progetti` e `€X.XXX` valore totale come badge/chip compatti.

Nessuna modifica al database o ad altri file necessaria -- solo UI in `ClientManager.tsx`.

