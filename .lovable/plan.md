

## Piano: Progetti come Lista con Pagina Dettaglio

### Struttura

**1. Lista Progetti (`ProjectManager.tsx` - riscrittura)**
- Barra di ricerca per filtrare per nome progetto o cliente
- Lista compatta: colore progetto, nome, cliente, progress bar ore lavorate inline, tariffa oraria
- Click sulla riga naviga alla pagina dettaglio
- Bottone "Nuovo Progetto" resta nell'header

**2. Pagina Dettaglio Progetto (`src/components/ProjectDetail.tsx` - nuovo file)**
- Header con nome progetto, colore, bottone "Indietro"
- Tutte le info attuali della card: ore lavorate, compenso fisso, fatturazione
- Bottoni Modifica / Elimina
- Sezione fatture con checkbox per segnare come pagate

**3. Navigazione**
- Gestita internamente in `ProjectManager` con uno stato `selectedProjectId`
- Se un progetto è selezionato, mostra `ProjectDetail`; altrimenti mostra la lista
- Nessuna modifica al routing di `App.tsx`

### File coinvolti

| File | Azione |
|------|--------|
| `src/components/ProjectManager.tsx` | Riscrittura come lista + logica navigazione interna |
| `src/components/ProjectDetail.tsx` | Nuovo: pagina dettaglio completa del progetto |

Nessuna modifica al database, tipi o altri componenti.

