repo: transformatiive/trml-home-dashboard
branch: main

## Last sync

date: 2026-09-13T18:34:51Z

### Updated in this project

- Novo ecrã de notícias a partir de `src/plugins/publico.js` e `src/lib/rss.js`: manchete principal, cinco secundárias e mistura de fontes.
- Arco solar refeito como ilustração de 24 h com noite, crepúsculo e golden hour.

- Redesenhados seis ecrãs 1024×768 (light + dark) no vocabulário real de `public/screen.css`: Helvetica para rótulos, Georgia para números, paleta terrosa do repo.
- Ecrãs alinhados com os plugins existentes `weather`, `sun`, `daysleft`, `calendar`.
- Dois ecrãs novos sem plugin correspondente: Contas a receber (Zoho Books) e Gasto OpenRouter.
- Ronda 1 (`Dashboards iPad.dc.html`) mantida como referência; usa webfonts que o iPad 1 não carrega.

## Screen map

| Ecrã do projeto | Ficheiros do repo |
| --- | --- |
| 2a Tempo — Oeiras | `src/plugins/weather.js`, `src/lib/openmeteo.js`, `src/lib/ui.js`, `public/screen.css` |
| 2b Ciclo solar | `src/plugins/sun.js`, `src/time.js`, `public/screen.css` |
| 2c Dias do ano | `src/plugins/daysleft.js`, `src/lib/holidays.js`, `public/screen.css` |
| 2d Hoje | `src/plugins/calendar.js`, `src/plugins/agora.js`, `src/lib/calendar.js`, `src/lib/ics.js` |
| 2e Contas a receber | sem plugin — novo, a criar em `src/plugins/` |
| 2f Gasto OpenRouter | sem plugin — novo, a criar em `src/plugins/` |
| 2g Notícias | `src/plugins/publico.js`, `src/lib/rss.js`, `public/screen.css` |
| Shell comum (zonas de toque, tema, refresh) | `src/render.js`, `public/client.js`, `src/playlist.js`, `src/server.js` |
