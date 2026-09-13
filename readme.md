# Luiz0067 PDF Flipbook

> **Plugin WordPress Gutenberg de Alto Desempenho para Visualização Interativa de PDFs e Revistas Digitais em Formato Flipbook 3D Responsivo com Bootstrap 5 e Font Awesome 6.**

[![WordPress](https://img.shields.io/badge/WordPress-6.0%2B-blue.svg)](https://wordpress.org)
[![PHP](https://img.shields.io/badge/PHP-7.4%2B-777bb4.svg)](https://www.php.net/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.3-purple.svg)](https://getbootstrap.com/)
[![Font Awesome](https://img.shields.io/badge/Font%20Awesome-6.5.2-orange.svg)](https://fontawesome.com/)
[![License](https://img.shields.io/badge/License-GPL--2.0--or--later-green.svg)](https://www.gnu.org/licenses/gpl-2.0.html)

---

## 👨‍💻 Metadados de Autoria

- **Autor**: Luiz Fernando Brogliatto Ferreira
- **Perfil WordPress.org**: [https://profiles.wordpress.org/luiz0067/](https://profiles.wordpress.org/luiz0067/)
- **GitHub**: [https://github.com/luiz0067yahoo](https://github.com/luiz0067yahoo)
- **Repositório do Plugin**: [https://github.com/luiz0067yahoo/luiz0067-pdf-flipbook](https://github.com/luiz0067yahoo/luiz0067-pdf-flipbook)
- **LinkedIn**: [https://www.linkedin.com/in/luiz-ferreira-260277379/](https://www.linkedin.com/in/luiz-ferreira-260277379/)

---

## 🌟 Visão Geral

O **luiz0067-pdf-flipbook** é um bloco Gutenberg avançado e intuitivo para o ecossistema WordPress que converte documentos PDF tradicionais, catálogos, apostilas, cardápios e revistas digitais em uma experiência de leitura interativa tridimensional realista.

Seguindo rigorosamente a arquitetura e os padrões de excelência de **luiz0067-accordion**, o plugin combina:
1. **Fidelidade Visual 100% WYSIWYG**: O que você configura no editor de blocos é visualizado com fidelidade milimétrica, simulando as dimensões, o palco, a capa, as páginas abertas e a barra de botões com as cores exatas escolhidas.
2. **Motor 3D Flipbook Otimizado**: Transições suaves e perspectivas tridimensionais ao folhear páginas com suporte a cliques, arraste e teclas direcionais (`ArrowLeft` e `ArrowRight`).
3. **Efeito Sonoro Acústico Realista**: Som de papel folheando sintetizado dinamicamente em tempo real via **Web Audio API** nativo do navegador, eliminando arquivos MP3 externos e erros de carregamento 404.
4. **Renderização de Alta Definição**: Integração nativa com a consagrada biblioteca **PDF.js** da Mozilla, garantindo renderização nítida em telas Retina/High-DPI.
5. **Responsividade Inteligente**: Alternância automática de modo página dupla para folha única em smartphones e telas estreitas (< 768px).
6. **Design System Moderno**: Estruturado com classes do **Bootstrap 5.3** e ícones vetoriais **Font Awesome 6**.

---

## 🎛️ Guia Completo das Abas de Configuração (InspectorControls)

O painel lateral de configurações do bloco foi projetado com uma interface limpa dividida em três abas especializadas:

```
┌─────────────────────────────────────────────────────────────┐
│                CONFIGURAÇÕES DO FLIPBOOK                    │
├───────────────────┬─────────────────────┬───────────────────┤
│ Arquivo e Origem  │ Dimensões e Layout  │ Barra e Controles │
└───────────────────┴─────────────────────┴───────────────────┘
```

---

### 📁 Aba 1: Arquivo e Origem (`tab-source`)

Esta aba é o ponto de partida para definir o conteúdo do flipbook.

| Campo / Controle | Tipo | Descrição e Funcionalidade |
| :--- | :--- | :--- |
| **Tipo de Origem** | `SelectControl` | Permite alternar entre **Arquivo PDF (Recomendado)** e **Galeria de Imagens de Páginas**. |
| **Carregador de PDF (`MediaUpload`)** | Botão / Modal WP | Aciona a biblioteca de mídia nativa do WordPress para envio ou seleção do PDF. |
| **Card de Prévia do Documento** | Visual | Exibe o título do arquivo, tamanho formatado (ex: `4.82 MB`), link absoluto e ícone oficial. |
| **Ação Substituir PDF** | Botão | Permite trocar o arquivo atual mantendo todas as configurações de layout e controles intactas. |
| **Ação Remover PDF** | Botão (`isDestructive`) | Remove a vinculação do PDF e restaura o bloco ao estado de convite/placeholder. |
| **Galeria de Imagens** | `MediaUpload` múltiplo | Disponível quando a origem é "Imagens", permitindo carregar folhas individuais sequenciais. |

---

### 📐 Aba 2: Dimensões e Layout (`tab-layout`)

Controle total das proporções espaciais e apresentação visual do palco de leitura.

| Campo / Controle | Tipo | Descrição e Funcionalidade |
| :--- | :--- | :--- |
| **Presets Rápidos de Altura** | `ButtonGroup` | Botões de acesso rápido com valores otimizados: `500px`, `650px (Padrão)`, `750px` e `850px`. |
| **Altura Personalizada (CSS)** | `TextControl` | Permite definir qualquer unidade de medida CSS válida (ex: `700px`, `80vh`, `600px`). |
| **Modo de Exibição Inicial** | `SelectControl` | **Página Dupla (`double-page`)**: Apresenta duas páginas lado a lado como em uma revista impressa aberta.<br>**Página Única (`single-page`)**: Exibe uma página por vez em destaque. |
| **Página Única Automática no Celular** | `ToggleControl` | Quando ativado (padrão), detecta larguras de tela inferiores a 768px e comuta suavemente para página única. |
| **Cor de Fundo do Palco** | `ColorPalette` | Seletor com paleta predefinida em tons escuros e elegantes (Ardósia Escura `#1e293b`, Preto Profundo `#0f172a`, Grafite `#18181b`, Marinho `#172554`, Cinza Neutro, Claro e Branco). |

---

### 🛠️ Aba 3: Barra de Ferramentas e Controles (`tab-controls`)

Configure os recursos disponíveis na barra de navegação inferior do leitor.

| Campo / Controle | Tipo | Descrição e Funcionalidade |
| :--- | :--- | :--- |
| **Página Inicial de Abertura** | `RangeControl` | Define o número da página na qual o documento iniciará a exibição (1 a 50). |
| **Botão de Download do PDF** | `ToggleControl` | Exibe o botão com ícone `fa-download` que permite ao visitante baixar o documento original. |
| **Modo Tela Cheia** | `ToggleControl` | Ativa o botão `fa-expand` conectado à Fullscreen API nativa do navegador para imersão total. |
| **Efeito Sonoro de Papel** | `ToggleControl` | Habilita o sintetizador acústico da Web Audio API e o botão de silenciar/ativar som na barra (`fa-volume-high` / `fa-volume-xmark`). |
| **Controles de Zoom** | `ToggleControl` | Ativa os botões de aumentar zoom (`fa-magnifying-glass-plus`), diminuir zoom (`fa-magnifying-glass-minus`) e reiniciar para 100%. |
| **Reprodução Automática (Autoplay)** | `ToggleControl` / `RangeControl` | Avança as páginas automaticamente em intervalos regulares (inspirado no catálogo de `luiz0067yahoo.github.io/luiz0067yahoo/`), com pausa imediata ao clicar no livro. |
| **Cor de Destaque / Botões** | `ColorPalette` | Personaliza a linha de topo da barra inferior e os botões de ação com a identidade visual do site (Azul Bootstrap, Roxo, Verde, Vermelho, etc.). |

---

## 📸 Guia para Inclusão de Screenshots Demonstrativos

Para que o plugin apresente uma documentação visual completa para o repositório do WordPress.org e GitHub, adicione os screenshots capturados na pasta [`assets/screenshots/`](file:///c:/Users/usuario/Documents/GitHub/luiz0067-pdf-flipbook/assets/screenshots/).

### Nomenclatura Recomendada:
1. **`assets/screenshots/tab-1-source.png`**: Captura da barra lateral com a aba "Arquivo e Origem" aberta e um PDF selecionado.
2. **`assets/screenshots/tab-2-layout.png`**: Captura da aba "Dimensões e Layout" exibindo as opções de altura e cor de fundo.
3. **`assets/screenshots/tab-3-controls.png`**: Captura da aba "Barra e Controles" com os seletores de download, tela cheia e paleta de cores.
4. **`assets/screenshots/wysiwyg-preview.png`**: Visão do editor Gutenberg mostrando a maquete 3D do livro aberto no canvas.
5. **`assets/screenshots/frontend-flipbook.png`**: Demonstração do flipbook em ação no frontend do site com o efeito 3D e a barra inferior ativa.

> [!TIP]
> **Dica de Formato**: Capture as imagens com resolução mínima de **1280x720 pixels** (proporção 16:9) em formato PNG ou WebP com compressão sem perdas para garantir nitidez máxima.

---

## 📂 Estrutura de Arquivos e Pastas

```
luiz0067-pdf-flipbook/
│
├── luiz0067-pdf-flipbook.php   # Arquivo principal do plugin e enfileiramento de assets
├── block.json                  # Manifesto oficial do bloco Gutenberg (API v3)
├── package.json                # Gerenciador de dependências e scripts do @wordpress/scripts
├── readme.md                   # Documentação detalhada e guia de uso
│
├── src/                        # Código-fonte React, SCSS e scripts modernos
│   ├── index.js                # Registro do bloco com metadados
│   ├── edit.js                 # Componente React do editor com abas e WYSIWYG
│   ├── save.js                 # Estrutura HTML semântica Bootstrap 5 e data-*
│   ├── view.js                 # Script Vanilla JS frontend (PDF.js, 3D flip, áudio, zoom)
│   ├── editor.scss             # Estilos exclusivos do editor Gutenberg
│   └── style.scss              # Estilos do componente, perspectiva 3D e responsividade
│
├── build/                      # Arquivos compilados gerados para produção
│   ├── index.js
│   ├── index.asset.php
│   ├── index.css
│   ├── style-index.css
│   ├── view.js
│   └── view.asset.php
│
├── languages/                  # Dicionários de internacionalização i18n
│   ├── pt-br.json              # Português do Brasil
│   ├── en-us.json              # Inglês (Estados Unidos)
│   ├── it.json                 # Italiano
│   └── es.json                 # Espanhol
│
└── assets/                     # Recursos gráficos do plugin
    └── screenshots/            # Diretório para telas demonstrativas
```

---

## 💻 Requisitos do Sistema

- **WordPress**: Versão 6.0 ou superior (totalmente compatível com WordPress 6.7 e 7.1).
- **PHP**: Versão 7.4 ou superior (compatível com PHP 8.0, 8.1, 8.2 e 8.3).
- **Navegadores Homologados**: Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge e navegadores mobile modernos.

---

## 🚀 Instalação e Ativação

1. Faça o download ou clone este repositório na pasta de plugins da sua instalação WordPress:
   ```bash
   cd wp-content/plugins/
   git clone https://github.com/luiz0067yahoo/luiz0067-pdf-flipbook.git
   ```
2. No painel administrativo do WordPress, navegue até **Plugins > Plugins Instalados**.
3. Localize **luiz0067 PDF Flipbook** e clique em **Ativar**.
4. Abra ou crie qualquer Post ou Página no editor de blocos (Gutenberg).
5. Clique no botão de adicionar bloco `(+)` e procure por **"Luiz0067 PDF Flipbook"**.
6. Selecione o seu arquivo PDF na biblioteca e publique sua página!

---

## ⌨️ Atalhos de Navegação do Usuário

- **Seta para Direita (`→`) ou `PageDown`**: Avança para a próxima página.
- **Seta para Esquerda (`←`) ou `PageUp`**: Volta para a página anterior.
- **Clique no lado direito do livro**: Folheia para a frente.
- **Clique no lado esquerdo do livro**: Folheia para trás.
- **Botões Zoom (+ / -)**: Amplia e reduz o documento para leitura de textos pequenos.
- **Botão Tela Cheia**: Maximiza o leitor para visualização imersiva.

---

## 🌐 Internacionalização (i18n)

O plugin foi arquitetado com suporte nativo a internacionalização através do textdomain `luiz0067-pdf-flipbook`. Todos os textos da interface de edição e do frontend estão traduzidos nos arquivos de formato JSON na pasta `languages/`:
- **Português (Brasil)**: `languages/pt-br.json`
- **Inglês (Estados Unidos)**: `languages/en-us.json`
- **Italiano**: `languages/it.json`
- **Espanhol**: `languages/es.json`

---

## 📄 Licença

Este plugin é distribuído sob a licença **GPL-2.0-or-later**. Consulte os termos da licença em [GNU General Public License v2.0 or later](https://www.gnu.org/licenses/gpl-2.0.html).
