# Home dashboard (iPad 1)

Painel tipo TRMNL para a casa em Lisboa: uma playlist de ecrãs inteiros, gerados no servidor, pensados para **iPad 1 / iOS 5.1.1** e **Adicionar ao ecrã inicial**.

Repositório: `transformatiive/trml-home-dashboard`. Não reutiliza a app Railway antiga nem o site Website-Daniela-Santos-Coach.

## Playlist v1

Agora → Calendário → Meteorologia → Avisos → Email Meter → Público → Days Left.

Toque invisível: **12% esquerda** = anterior, **12% direita** = seguinte (ciclo). Centro não navega.

## Tema

- **Noite (escuro):** 20:30–08:00 `Europe/Lisbon`
- **Dia (claro):** fora dessa janela
- Sem variáveis CSS (iOS 5)

## Arranque local

```
cp .env.example .env
# preencher CALENDAR_ICS_URL só no .env — nunca no git
npm install
npm start
```

Abrir `http://127.0.0.1:3000/` (no iPad 1 usar HTTP na LAN; o Safari antigo não confia em Let's Encrypt).

## Railway

Projecto: `efda071b-0975-4bdd-8ba5-aa7d86ea7d1a`. Serviço novo (`home-dashboard`), código greenfield.

Variável obrigatória para o calendário:

- `CALENDAR_ICS_URL` — URL ICS **privado** do Google Calendar (Definições do calendário → endereço secreto). Colar só nas variáveis do serviço Railway. **Não** commitar, **não** colar em issues, README ou logs.

Opcionais para Email Meter (contagens, sem corpos):

- `IMAP_USER`
- `IMAP_PASSWORD` (app password Gmail)
- `IMAP_HOST` (default `imap.gmail.com`)

Meteorologia: Open-Meteo (sem chave). Avisos: IPMA distrito Lisboa (`LSB`). Público: RSS. Dias restantes: cálculo local + feriados PT.

## iPad 1

- Viewport 1024×768, metas `apple-mobile-web-app-*` da época
- Layout tabela 12% / 76% / 12%, sem `position:fixed`
- JS do cliente ES3 (`nav.js`)
- Ícones 57×57 e 72×72
- HTTPS público é para telemóvel/admin; o web clip do iPad deve ser HTTP na LAN

## Verificação neste ambiente

Chrome/headless cobre navegação da playlist e o tema. **Não substitui** o teste no iPad 1 físico (web clip, standby, TLS).
