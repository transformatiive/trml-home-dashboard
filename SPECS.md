# SPECS — Dashboards iPad 1 (v2)

Spec de implementação para `transformatiive/trml-home-dashboard` (branch `main`).
Alvo: **iPad 1, iOS 5.1.1, Safari 5.1, 1024×768 landscape**, português, `Europe/Lisbon`.

Referência visual: `specs/*.png` (1024×768, 1:1). Tema light é o principal; o dark é o mesmo layout com os tokens trocados. `specs/2b-sol-night.png` mostra o par light/dark do mesmo ecrã.

Sete ecrãs. Cada ecrã é um tópico, full bleed, sem barra de título e sem linha de rodapé.

---

## 1. O que muda no shell

O shell atual (`src/render.js`) gasta 24 % da largura em duas células de toque e 36 px numa linha de `hint`. Os novos ecrãs são full bleed: **as zonas de toque passam a links absolutos sobrepostos** e o `hint` desaparece.

Substituir a tabela `shell` por:

```html
<div id="stage" style="position:relative;width:1024px;height:768px;overflow:hidden">
  <!-- conteúdo do plugin, 1024×768, padding 44px 48px 36px -->
  <a class="zone zone-prev" id="zonePrev" href="...">&nbsp;</a>
  <a class="zone zone-next" id="zoneNext" href="...">&nbsp;</a>
</div>
```

```css
.zone {
  position: absolute;
  top: 0;
  height: 768px;
  width: 123px;            /* 12% */
  display: block;
  text-decoration: none;
  color: transparent;
  -webkit-tap-highlight-color: transparent;
}
.zone-prev { left: 0; }
.zone-next { right: 0; }
.zone.flash { background: #E6E1D6; }
body.theme-night .zone.flash { background: #2A2622; }
```

Regras:

- `position:absolute` com `top/left/right` fixos — Safari 5.1 suporta. Não usar flexbox, grid, `calc()`, `border-radius` em elementos grandes, `rgba()` em áreas extensas, `box-shadow`, `text-shadow`, transições ou `@font-face`.
- Manter `<meta http-equiv="refresh" content="120" />` e o `viewport width=1024`.
- Manter `public/client.js` como está (ES3, auto-avanço 75 s, pausa 2 min após toque). Só mudam os IDs dos elementos se forem renomeados — não renomear.
- Toque no centro não navega. Continua válido.

## 2. Layout interno

Todos os ecrãs usam a mesma moldura de conteúdo:

| Propriedade | Valor |
| --- | --- |
| Canvas | 1024 × 768, `overflow:hidden` |
| Padding | `44px 48px 36px` |
| Largura útil | 928 px |
| Altura útil | 688 px |
| Cabeçalho | linha única: eyebrow à esquerda, meta à direita |
| Estrutura | cabeçalho → herói → corpo → rodapé com `border-top` |

Nada de scroll. Se os dados excederem o espaço, corta-se a lista (ver "truncagem" em cada ecrã).

Como fazer as linhas sem flexbox: `<table width="100%" cellpadding="0" cellspacing="0">` com larguras em `%` ou px nas `<td>`, `valign` explícito. Barras horizontais = `<td>` com `width:NN%` e cor de fundo. Barras verticais = `<div>` com `height:NNpx` dentro de `<td valign="bottom">`, exatamente como `ui.hourBars()` já faz.

## 3. Tokens

Estender `public/screen.css`. Os valores base já existem; as adições estão marcadas.

### Neutros

| Papel | Day | Night |
| --- | --- | --- |
| fundo | `#F4F1EA` | `#161412` |
| tinta | `#1C1914` | `#F3EFE6` |
| tinta secundária | `#7A7468` | `#9A9388` |
| filete | `#DDD6C8` | `#3A342E` |
| preenchimento neutro | `#EAE5DA` | `#221F1B` *(novo)* |
| preenchimento inerte | `#B8B1A6` | `#4A443C` *(novo)* |

### Acentos

| Papel | Day | Night |
| --- | --- | --- |
| âmbar / quente / atenção | `#B45309` | `#E0A050` |
| alerta / vencido | `#B42318` | `#F0A8A0` |
| sálvia / ok / foco | `#3F6B4A` | `#9FBFA4` |
| slate / trabalho / frio | `#5B6B7A` | `#8FA3B5` |
| feriado / 31–60 d | `#8A4A3A` | `#B5745E` |
| sol | `#C4A35A` e `#D4A017` | iguais |

O acento não é decoração: codifica dados. Banda de temperatura, antiguidade de dívida, tipo de bloco na agenda, secção da notícia. Máximo dois acentos por ecrã fora dos gráficos.

### Tipografia

Sem webfonts. `Helvetica, Arial, sans-serif` para rótulos e texto corrido; `Georgia, Times, serif` para todos os números e horas.

| Classe | Família | Tamanho | Uso |
| --- | --- | --- | --- |
| eyebrow | Helvetica bold | 13 px, `letter-spacing:3px`, uppercase | nome do ecrã |
| meta | Helvetica | 15 px, tinta secundária | linha de contexto à direita |
| label | Helvetica | 15 px, tinta secundária | rótulos de campo |
| hero-xl | Georgia | 196 px, `letter-spacing:-8px` | número único dominante (2c) |
| hero-l | Georgia | 132–168 px | valor principal (2a, 2e, 2f) |
| hero-m | Georgia | 46–62 px | horas, subtotais |
| value | Georgia | 22–28 px | células de tabela |
| body | Helvetica | 20–25 px | títulos de item |
| body-sm | Helvetica | 14–15 px | legendas de eixo |

Mínimo absoluto 13 px. Não descer.

## 4. Helpers a acrescentar a `src/lib/ui.js`

```
header(eyebrow, meta)          → linha de cabeçalho
statCol(label, value, accent)  → rótulo em cima, número Georgia em baixo
statRow(label, value, unit)    → rótulo à esquerda, número, unidade, filete em baixo
vBars(rows, opts)              → barras verticais com valor em cima e legenda em baixo
hBar(label, segments, value)   → rótulo | barra segmentada | valor alinhado à direita
listItem(swatchTone, primary, secondary, right) → item com filete de 8 px
monthStrip(monthsElapsed, pctCurrent)           → 12 blocos (2c)
dayColumn(blocks)              → coluna vertical de 24 h (2d)
```

`hourBars()` mantém-se para retrocompatibilidade. Os novos helpers devolvem strings de HTML como os atuais.

## 5. Ecrãs

Ordem da playlist em `src/playlist.js`:
`agora` → `calendar` (2d) → `weather` (2a) → `sun` (2b) → `publico` (2g) → `ar` (2e) → `openrouter` (2f) → `daysleft` (2c).
Os plugins existentes `power`, `warnings` e `email` ficam na playlist mas fora deste spec — não foram redesenhados.

---

### 2a · Tempo — Oeiras

`specs/2a-tempo.png` · rota `/p/weather` · plugin `src/plugins/weather.js` · fonte `src/lib/openmeteo.js`

- **Cabeçalho:** eyebrow `OEIRAS`; meta `domingo, 13 de setembro · 08:42`.
- **Herói (esquerda, 46 %):** ícone 64 px, temperatura Georgia 168 px com `°` incluído, descrição 22 px, linha `sensação X° · máx Y° mín Z°` 15 px.
- **Herói (direita, 54 %):** quatro `statRow` — vento (km/h + rumo), humidade (%), UV (valor + qualitativo, âmbar se ≥ 6), chuva 24 h (mm, slate se > 0).
- **Próximas horas:** 8 colunas `vBars`, campo `temp`. Valor Georgia 24 px em cima, barra de 22 px de largura, hora em baixo. Altura da barra `16 + ((t - min) / span) * 88`, como `ui.hourBars()`. Cor por banda: `< 18°` slate, `18–22°` sálvia, `> 22°` âmbar. A hora atual leva `text-decoration:underline` no valor e na legenda.
- **Rodapé:** 3 cartões de dia com `border-left` a separar — ícone 34 px, data `seg 14/09`, `máx° / mín°` Georgia 26 px, descrição 14 px.
- **Truncagem:** 8 horas, 3 dias. Se `w.hours` vier com menos de 8, distribuir as existentes; não preencher com vazios.
- **Estado de falha:** manter o último valor em cache e escrever na meta `dados de HH:MM`.

### 2b · Ciclo solar

`specs/2b-sol.png`, `specs/2b-sol-night.png` · rota `/p/sun` · plugin `src/plugins/sun.js`

- **Cabeçalho:** eyebrow `SOL EM OEIRAS`; meta `dia · pôr-do-sol daqui a 5 h 51 min` (ou `ainda noite · nasce às HH:MM` / `já noite · pôs-se às HH:MM`).
- **Herói:** quatro colunas — nascer, agora (âmbar), pôr, e à direita duração do dia Georgia 42 px com o delta vs ontem (`−2 min 51 s que ontem`, alerta se negativo, sálvia se positivo).
- **Arco:** **imagem PNG gerada no servidor**, 928 × 268, não HTML. Ver secção 6.
- **Rodapé:** quatro colunas com `border-left` — golden hour manhã, golden hour tarde (âmbar), crepúsculo civil, lua (percentagem + hora de nascer, slate).
- **Cálculos:** golden hour = nascer/pôr ±45 min. Crepúsculo civil = pôr → pôr +27 min (latitude de Lisboa, setembro; usar a fórmula real, não a constante). Zénite = ponto médio entre nascer e pôr.

### 2c · Dias do ano

`specs/2c-dias.png` · rota `/p/daysleft` · plugin `src/plugins/daysleft.js` · fonte `src/lib/holidays.js`

- **Cabeçalho:** eyebrow com o ano; meta `70 % já passou · dia 256 de 365`.
- **Herói:** número de dias Georgia 196 px + `dias até ao fim do ano` 22 px alinhado pela base.
- **Progresso:** barra de 4 px, `progress-fill` / `progress-rest` (já existe em `ui.progress()`).
- **Faixa de meses:** 12 blocos de 46 px de altura, `gap` 4 px. Meses passados em tinta cheia, futuros em filete, mês corrente 62 px de altura com a fração decorrida preenchida a âmbar e a inicial em bold âmbar.
- **Corpo esquerdo:** feriados PT que faltam, máx. 3, com filete de 8 px em cor de feriado. Nome 23 px, `DD/MM · dia da semana` 15 px.
- **Corpo direito (300 px, `border-left`):** semana ISO `38 de 53`, trimestre `Q3 89 %`, dias úteis restantes (sálvia).
- **Vazio:** se não houver feriados até ao fim do ano, uma linha `sem feriados restantes` em sálvia.

### 2d · Hoje

`specs/2d-hoje.png` · rota `/p/calendar` · plugin `src/plugins/calendar.js` · fonte `src/lib/calendar.js` + `src/lib/ics.js`

- **Cabeçalho:** eyebrow `HOJE`; meta `domingo, 13 de setembro · 10:35 · 6 eventos`.
- **Coluna de 24 h (56 px, esquerda):** barra de 12 px de largura cobrindo 07:00–22:00 em 561 px, ou seja **37,4 px por hora**. Um `<div>` por segmento, altura = `duração_min / 60 * 37.4`, arredondada. Vazios em preenchimento neutro. Cores: trabalho slate, foco sálvia, pessoal inerte, viagem âmbar. À direita da barra, as horas 07/11/15/19/22 distribuídas.
- **Lista (centro):** um item por evento, filete de 8 px com a cor do tipo, título 24 px, contexto 15 px, hora Georgia 22 px alinhada à direita. Máximo 6 eventos; se houver mais, mostrar os 6 primeiros a partir da hora atual e acrescentar `+N mais` ao meta do cabeçalho.
- **Coluna direita (286 px, `border-left`):** "a seguir" com minutos até ao evento, título 28 px na cor do tipo, intervalo Georgia 30 px. Depois "carga do dia" com foco / reuniões / deslocação em Georgia 24 px e uma barra segmentada de 6 px. Depois "amanhã" com 3 linhas `HH:MM` + título.
- **Classificação de tipo:** reutilizar `ui.kindTone()`. Acrescentar o tipo `foco` (eventos cujo `summary` começa por `Foco` ou que venham de um calendário de blocos) e `viagem` (eventos NetJets / com aeroporto no local).
- **Vazio:** "Agenda livre" em sálvia, coluna de 24 h toda em preenchimento neutro, carga a zero.

### 2e · Contas a receber

`specs/2e-ar.png` · rota `/p/ar` · **plugin novo** `src/plugins/ar.js` · fonte nova `src/lib/zohobooks.js`

- **Cabeçalho:** eyebrow `CONTAS A RECEBER`; meta `Zoho Books · 11 faturas abertas`.
- **Herói:** total Georgia 132 px + `€` 52 px. À direita, `em atraso` Georgia 52 px em alerta, com `41 % do total · 6 faturas` em baixo.
- **Antiguidade:** 4 barras verticais — `a vencer` sálvia, `1–30 d` âmbar, `31–60 d` cor de feriado, `+60 d` alerta. Valor Georgia 24 px em cima, contagem de faturas na legenda. Altura proporcional ao maior balde, máx. 82 px.
- **Por cliente:** 5 linhas `hBar` — nome 20 px (210 px de largura), barra de 18 px segmentada entre corrente e vencido, valor Georgia 22 px alinhado à direita (104 px). Top 4 clientes por valor; o resto agregado em `outros · N clientes`.
- **Rodapé:** `ainda a faturar em setembro` com até 3 linhas resumidas numa só frase, e o total em sálvia Georgia 46 px à direita.
- **Dados:** `GET /invoices?status=unpaid` e `GET /invoices?status=overdue` da API de Zoho Books; organização e token pelo vault `TRNSF-INTERNAL`. Cache de 30 min. Arredondar a euros, sem cêntimos, separador de milhares com espaço fino.
- **Vazio:** `sem faturas abertas` em sálvia, herói a `0 €`.

### 2f · Gasto OpenRouter

`specs/2f-openrouter.png` · rota `/p/openrouter` · **plugin novo** `src/plugins/openrouter.js` · fonte nova `src/lib/openrouter.js`

- **Cabeçalho:** eyebrow `OPENROUTER · SETEMBRO`; meta `13 dias decorridos · saldo 187,60 €`.
- **Herói:** gasto do mês Georgia 132 px com cêntimos + `€`. À direita, delta vs mês anterior Georgia 52 px (sálvia se desceu, âmbar se subiu) e `projeção do mês` em baixo.
- **Por workspace:** 6 linhas `hBar` — nome 20 px (228 px), barra de 20 px em slate (sálvia para trabalho interno de I&D, inerte para `outros`), valor Georgia 22 px (96 px). Escala relativa ao maior. Top 5 + `outros`.
- **Rodapé:** seis colunas de 26 px com o gasto dos últimos 6 meses (mês corrente em âmbar, os outros em filete), modelo mais usado com a percentagem, e tokens do mês Georgia 34 px.
- **Dados:** endpoint de `credits` / `activity` da API OpenRouter, agregado por workspace. Converter USD → EUR à taxa do dia e guardar a taxa em cache. Cache de 60 min.

### 2g · Notícias

`specs/2g-noticias.png` · rota `/p/publico` · plugin `src/plugins/publico.js` · fonte `src/lib/rss.js`

- **Cabeçalho:** eyebrow `NOTÍCIAS`; meta `Público · Expresso · último refresh 08:42`.
- **Manchete:** filete de 8 px na cor da secção; secção em bold 13 px uppercase; `há 18 min · Público` 15 px; título Georgia 50 px com `text-wrap:pretty` (ignorado no iOS 5, inofensivo); lead 19 px em tinta secundária. Título até 3 linhas, lead até 2 — cortar por caracteres, não por altura.
- **Secundárias:** 5 linhas com filete de 8 px × 46 px, título 25 px (máx. 2 linhas), `Secção · Fonte` 15 px, idade relativa alinhada à direita.
- **Rodapé:** legenda de secções com contagem e `6 de 18 manchetes · Público 4 · Expresso 2`.
- **Cor por secção:** Política slate, Local âmbar, Economia e Ambiente sálvia, Sociedade cor de feriado, resto inerte.
- **`rss.js` precisa de dois campos novos:** `pubDate` (para a idade relativa — `há N min`, `há N h`, depois `DD/MM`) e `source` (nome do feed). Acrescentar ao objeto devolvido por `parseRss()` e passar o nome da fonte como segundo argumento.
- **Segundo feed:** juntar o Expresso ao Público. Nova variável `EXPRESSO_RSS_URL`. Intercalar por `pubDate` descendente, deduplicar por título normalizado, e nunca deixar a manchete e a segunda notícia serem da mesma secção se houver alternativa.
- **Vazio / falha:** manter cache; se não houver nada, `Notícias indisponíveis` + `tente no próximo refresh`.

## 6. O arco solar é um PNG

Uma ilustração com curva, bandas de crepúsculo e disco solar não se faz em tabelas, e SVG inline em Safari 5.1 dentro de XHTML é frágil. Gerar do lado do servidor, com a mesma técnica de `scripts/make-icons.js` (zlib + PNG cru, sem dependências).

- Rota: `GET /img/sunarc.png?d=YYYY-MM-DD&t=HHMM&theme=day|night`
- Tamanho: 928 × 268. Cache por dia + minuto arredondado a 5 min.
- Geometria (coordenadas do PNG, janela de 04:00 a 23:00 mapeada em 0–928, ou seja `x = (h - 4) / 19 * 928`):
  - horizonte: linha de 1 px em `y = 196`
  - bandas verticais até `y = 196`: noite de 0 a `x(alvorada civil)`, crepúsculo até `x(nascer)`, dia até `x(pôr)`, crepúsculo até `x(fim do crepúsculo)`, noite até 928
  - golden hour: duas bandas de 36 px a partir de `x(nascer)` e antes de `x(pôr)`, num tom mais quente
  - curva solar: quadrática de `(x(nascer), 196)` a `(x(pôr), 196)` com controlo em `(x(zénite), -100)` — o ápice cai em `y = 48`
  - continuação noturna: duas quadráticas tracejadas abaixo do horizonte, até `y ≈ 250` nas bordas
  - disco solar: raio 14 na posição da hora atual sobre a curva, mais 8 raios de 10 × 5 px
  - lua: disco de raio 13 com um disco da cor da noite deslocado 7 px, no lado noturno; 3 a 5 pontos de 2 px como estrelas
  - marcador da hora: linha tracejada vertical da curva ao horizonte, na cor de acento
  - texto: hora atual acima do disco (Georgia 21), `nascer` e `pôr` abaixo do horizonte (Georgia 17), `noite` / `gold` / `zénite` (Helvetica 13–14), e a legenda `54 % do dia decorrido · faltam 5 h 51 min de luz` (Helvetica 15) no fundo
- Cores day: noite `#D8D2C4`, crepúsculo `#E3D9C6`, dia `#EFEADF`, golden `#E8D9B8`, curva `#C4A35A`, disco `#D4A017`, lua `#8A8478`.
- Cores night: noite `#100E0C`, crepúsculo `#231F1A`, dia `#1E1B18`, golden `#2E2820`, curva `#C4A35A`, disco `#D4A017`, lua `#8FA3B5`.
- Fallback: se a geração falhar, cair no arco de 12 pontos em tabela que já existe em `sun.js`. Não deixar o ecrã sem nada.

## 7. Ícones

`scripts/make-icons.js` já gera 25 PNGs. Faltam três, no mesmo estilo geométrico e nos mesmos tamanhos (32 e 48):

- `icon-euro` — para 2e
- `icon-chart` — para 2f
- `icon-ai` — para 2f

Os ícones de tempo (`wx-sun`, `wx-partly`, `wx-cloud`, `wx-rain`, `wx-storm`, `wx-fog`, `wx-moon`) mantêm-se e continuam a ser escolhidos por `ui.wxIconName(code, night)`.

## 8. Tema

`src/time.js` já decide o tema: night entre 20:30 e 08:00 `Europe/Lisbon`. Manter. Com os tokens novos, garantir que **cada** cor usada tem par no `body.theme-night`. O dark não é uma inversão — é o mapa da secção 3, e os acentos sobem de luminosidade.

## 9. Variáveis de ambiente

Preservar: `DASH_TOKEN`, `PUSH_TOKEN`, `CALENDAR_ICS_URL`, `EMAIL_IMAP_USER`, `EMAIL_IMAP_PASS`, `PUBLICO_RSS_URL`.

Novas:

```
EXPRESSO_RSS_URL
ZOHO_BOOKS_ORG_ID
ZOHO_BOOKS_REFRESH_TOKEN
ZOHO_BOOKS_CLIENT_ID
ZOHO_BOOKS_CLIENT_SECRET
OPENROUTER_API_KEY
```

Todas opcionais: sem elas, o plugin correspondente entra no estado "não configurado" e não quebra a playlist.

## 10. Critérios de aceitação

1. Cada rota devolve exatamente 1024 × 768 sem scroll horizontal nem vertical no iPad 1.
2. Nenhum `<script>` é necessário para o ecrã pintar. O `client.js` só acrescenta auto-avanço e o flash do toque.
3. Nenhum texto abaixo de 13 px. Nenhuma webfont pedida.
4. Todos os números em Georgia; todos os rótulos em Helvetica.
5. Cada ecrã funciona com a fonte de dados em baixo: usa cache, ou mostra o estado vazio definido, e nunca fica em branco.
6. Os dois temas passam num contraste de 4,5:1 para texto corrido.
7. As zonas de toque de 12 % respondem nas quatro margens verticais, e o centro não navega.
8. `/health` continua a responder sem token.
9. Render comparado lado a lado com o PNG correspondente em `specs/`: mesma hierarquia, mesmas cores, mesmos pesos. Diferenças de ±2 px em espaçamento são aceitáveis.

## 11. Ficheiros

| Ação | Ficheiro |
| --- | --- |
| alterar | `src/render.js` — shell full bleed, zonas absolutas, sem `hint` |
| alterar | `public/screen.css` — tokens novos, classes `.zone`, escala tipográfica |
| alterar | `src/lib/ui.js` — helpers da secção 4 |
| alterar | `src/plugins/weather.js`, `sun.js`, `daysleft.js`, `calendar.js` — layouts novos |
| alterar | `src/plugins/publico.js` — manchete + secundárias + duas fontes |
| alterar | `src/lib/rss.js` — `pubDate` e `source` |
| alterar | `src/playlist.js` — ordem da secção 5 |
| alterar | `src/server.js` — rota `/img/sunarc.png`, novos fetches no `refresh()` |
| alterar | `scripts/make-icons.js` — três ícones novos |
| criar | `src/plugins/ar.js`, `src/lib/zohobooks.js` |
| criar | `src/plugins/openrouter.js`, `src/lib/openrouter.js` |
| criar | `src/lib/sunarc.js` — gerador do PNG |
| criar | `src/lib/sunarc.test.js`, `src/lib/rss.test.js` — geometria e parsing |

Ordem sugerida: shell e tokens primeiro (1–3), depois os quatro ecrãs que já têm plugin (2a–2d), depois o PNG do sol, depois os dois plugins novos, e por fim as notícias com o segundo feed.
