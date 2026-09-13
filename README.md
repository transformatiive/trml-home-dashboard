# Home Dashboard (iPad 1)

Playlist tipo TRMNL para o iPad 1 original (1024×768, iOS 5.1.1), em português, fuso `Europe/Lisbon`. Greenfield: não reutiliza o serviço Railway antigo.

## Playlist v1

Agora → Calendário → Tempo → Avisos IPMA → Email Meter → Público → Dias do ano.

Toque na coluna esquerda (12%) = anterior; direita = seguinte. O centro não navega. Auto-avanço ~75 s, pausado 2 min após um toque. Tema night 20:30–08:00.

O iPad 1 deve usar **HTTP na LAN** (Let's Encrypt não é confiável neste iOS). O HTTPS público no Railway é o gerador / admin.

## Arranque local

```bash
cp .env.example .env
# preencher CALENDAR_ICS_URL
node src/server.js
```

Abrir `http://127.0.0.1:8080/p/agora`. Admin: `/admin`. Health: `/health`.

## Variáveis de ambiente

| Nome | Obrigatório | Notas |
|------|-------------|--------|
| `CALENDAR_ICS_URL` | sim | URL ICS secreto do Google Calendar. Nunca no git. |
| `CALENDAR_ICS_URLS` | não | Extra, separado por vírgulas (Online, feriados). |
| `EMAIL_IMAP_USER` / `EMAIL_IMAP_PASS` | não | Contagens de inbox; sem isto o ecrã Email mostra estado vazio. |
| `EMAIL_IMAP_HOST` | não | Default `imap.gmail.com` |
| `LATITUDE` / `LONGITUDE` | não | Default Lisboa |
| `PUBLICO_RSS_URL` | não | Default `https://www.publico.pt/rss` |
| `PORT` | Railway | injectado |

## Railway

Projecto existente, serviço novo `home-dashboard`, ligado a este repositório. Não copiar rotas/templates do serviço antigo.
