# 🍞 Rattan Pães — Sistema Integrado de PDV & KDS

> **Aplicação criada e prototipada integralmente com o [Google AI Studio](https://aistudio.google.com/)**, combinando inteligência artificial generativa de ponta com engenharia de software full-stack e design de produto refinado.

---

## ⚡ Criado com Google AI Studio

Este sistema foi desenvolvido, estilizado e iterado com o auxílio direto do **Google AI Studio**. A plataforma permitiu:
- **Transposição Fiel de Identidade Visual:** Leitura e vetorização dos cardápios impressos reais da *Rattan Pães de Levain* a partir de imagens originais, preservando tipografia elegante de padaria artesanal, paleta de cores (vermelho queimado, verde oliva e fundo papel kraft) e organização de categorias.
- **Engenharia Acelerada por IA:** Implementação de ponta a ponta em TypeScript e React com arquitetura modular, gerenciamento de estado reativo, Web Audio API para alertas sonoros e layouts responsivos para múltiplos dispositivos operacionais.
- **Refinamento Contínuo:** Evolução ágil guiada por linguagem natural — desde a remoção de atritos operacionais no caixa (como observações ágeis por item) até a sincronização multitelas entre balcão, cozinha e TV de senhas.

---

## 📋 Sobre a Aplicação

O **Rattan Pães** é um sistema completo de gestão operacional para padarias artesanais, confeitarias e operações de food truck especializadas em pães de fermentação natural (*levain*), fatias húngaras, *cinnamon rolls* e bebidas especiais.

A aplicação unifica em uma interface única e intuitiva todas as etapas do atendimento:
1. **Frente de Caixa (PDV / POS)**
2. **Sistema de Cozinha e Produção (KDS / Kitchen Display System)**
3. **Painel de Chamada de Senhas para Clientes (Monitor TV)**
4. **Administração de Cardápio e Disponibilidade de Itens**
5. **Relatórios Gerenciais e Fechamento de Caixa**

---

## 🚀 Principais Funcionalidades

### 1. 🛒 Frente de Caixa Ágil (PDV)
- **Modos de Visualização:**
  - **Menu Impresso Digitalizado:** Apresentação idêntica à prancheta física de balcão (*Esmagattos* na focaccia de levain, *Cinnamon Rolls*, Bebidas e Acompanhamentos).
  - **Grade Fotográfica:** Visual com fotos dos produtos para pedidos rápidos por toque.
- **Inserção Direta e Observações Ágeis:** Adição rápida ao carrinho com campo de observação por item (ex.: *"sem rúcula"*, *"bastante calda"*, *"sem açúcar"*).
- **Controle de Pagamentos:**
  - Suporte a Dinheiro (com calculadora de troco automática).
  - Cartões de Débito e Crédito.
  - PIX instantâneo com geração de QR Code e chave configurável.
- **Cupom Fiscal e Térmico (80mm):** Impressão de comprovante detalhado com numeração de senha de retirada, itens, observações e dados do operador.

### 2. 🍳 Sistema de Produção na Cozinha (KDS)
- **Quadro Kanban Operacional:**
  - `1. NA FILA`: Pedidos recém-abertos aguardando início do preparo.
  - `2. EM PREPARO`: Pedidos em produção ativa no forno ou na chapa.
  - `3. PRONTO PARA RETIRADA`: Itens finalizados prontos no balcão.
  - `4. ENTREGUES`: Histórico de pedidos despachados ao cliente.
- **Cronômetro e Alertas de Tempo:**
  - Contador regressivo/progressivo por pedido com alertas cromáticos conforme o tempo de espera.
- **Alertas Sonoros (Web Audio API):** Sinal sonoro sutil quando um novo pedido entra na fila ou quando a senha é chamada.
- **Destaque de Observações:** Tarjas visuais em amarelo alertando sobre restrições e preferências do cliente.

### 3. 📺 Painel TV do Cliente (Monitor de Senhas)
- Interface de alto contraste e legibilidade à distância para instalação em telas de balcão ou TV externa.
- Divisão em duas colunas:
  - **Em Preparo:** Acompanhamento em tempo real para os clientes.
  - **Pronto para Retirada!:** Senhas chamadas com destaque visual pulsante e alerta sonoro (*ding-dong*).

### 4. 📝 Gestão de Cardápio e Estoque
- Controle de disponibilidade em tempo real (ativar / desativar itens esgotados com um clique).
- Atualização dinâmica de preços de venda.
- Inspeção e consulta dos documentos originais do cardápio impresso Rattan.
- Categorização de produtos:
  - *Esmagatto (Sandubas de Focaccia de Fermentação Natural: Roast Beef, Paleta Prime, Chicken Coleslaw, Caprese, Veggie, Mortadela Italiana).*
  - *Cinnamon Rolls & Fatias Húngaras (Glacê Real, Maçã Caseira, Nutella com Amêndoas, Doce de Leite com Coco, Box Degustação).*
  - *Acompanhamentos Chips (Batata Chips Tradicional, Páprica ou Lemon Pepper).*
  - *Bebidas Frias (Sodas Italianas, Guaraná da Casa, Mate Gelado, Sucos Naturais, Águas).*
  - *Bebidas Quentes (Café Nespresso, Latte, Chás especiais).*

### 5. 📊 Relatórios & Fechamento de Caixa
- Indicadores-chave de desempenho (KPIs):
  - Faturamento bruto do período.
  - Ticket médio por cliente.
  - Quantidade total de pedidos e itens vendidos.
  - Tempo médio de preparo na chapa/forno.
- Distribuição de receita por método de pagamento com percentuais consolidados.
- Ranking dos produtos mais vendidos (Top Sellers).
- Tabela de conferência detalhada com filtros e busca de pedidos.

### 6. 📱 Responsividade e Menus Adaptativos
- Layout fluido para tablets de caixa (iPad / Android), computadores desktop e celulares.
- Menu de navegação responsivo em gaveta lateral (*Hamburger Menu*) que impede sobreposição de botões em telas pequenas ou visualizações verticais.

### 7. 🔒 Autenticação & Controle de Acesso de Operadores
- **Tela de Login Dedicada:** Acesso restrito ao PDV, KDS, estoque e relatórios financeiros, garantindo segurança na operação.
- **Operador Padrão:** Usuário `guilherme` pré-configurado para inicialização e operação do sistema.
- **Identificação em Comandas:** Nome e cargo do operador em serviço impressos automaticamente no cupom/comanda térmica de 80mm.
- **Inserção Direta via Firebase Firestore:** Para adicionar novos operadores pelo console do Firebase:
  - Coleção: `users`
  - Campos do documento:
    - `username` (ou `usuario`): string (ex.: `"guilherme"`, `"mariana"`)
    - `password` (ou `senha`): string (senha de acesso definida pelo administrador)
    - `name` (ou `nome`): string (ex.: `"Guilherme"`, `"Mariana Silva"`)
    - `role` (ou `cargo`): string (ex.: `"Gerente"`, `"Operador de Caixa"`)
    - `active` (ou `ativo`): boolean (`true`)

### 8. 🔄 Sincronização em Tempo Real
- Comunicação instantânea entre telas e abas no mesmo navegador via `BroadcastChannel`.
- Arquitetura desacoplada e compatível com persistência em nuvem (Firebase Firestore).

---

## 🛠️ Tecnologias Utilizadas

- **Google AI Studio** — Engenharia assistida por modelos Gemini para estruturação da base de código e UX.
- **React 18** — Biblioteca para interface reativa de usuário.
- **TypeScript** — Tipagem estática rigorosa para consistência e prevenção de bugs em tempo de compilação.
- **Vite** — Ferramenta de build de alta performance com inicialização instantânea.
- **Tailwind CSS** — Framework de estilos utilitários para fidelidade ao layout do cardápio original.
- **Lucide React** — Ícones modernos e consistentes para ações de PDV e KDS.
- **Web Audio API** — Síntese nativa no navegador para bipes e sinos de chamada de pedidos.

---

## 💻 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior.
- Gerenciador de pacotes `npm`.

### Passos de Instalação

1. Clone o repositório ou acesse a pasta do projeto:
   ```bash
   git clone <url-do-repositorio>
   cd rattan-paes
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse a aplicação no seu navegador:
   ```
   http://localhost:3000
   ```

### Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor local de desenvolvimento na porta 3000 |
| `npm run build` | Compila os ativos otimizados para produção na pasta `dist` |
| `npm run lint` | Valida tipagens TypeScript sem emissão de arquivos (`tsc --noEmit`) |
| `npm run preview` | Executa o servidor de pré-visualização do build de produção |

---

## 🥖 Identidade Visual & Inspiração

A paleta de cores e atmosfera do aplicativo remetem à panificação clássica artesanal:
- **Papel Kraft & Off-White:** `#FDFBF7`, `#F7F3E9`
- **Marrom Crosta / Levain:** `#2C221E`, `#4A3B32`
- **Vermelho Rattan (Destaques e Títulos):** `#A32323`, `#C53030`
- **Verde Oliva & Folha (Preços e Sucesso):** `#1E6B3C`, `#2E7D32`

---

*Desenvolvido com carinho e tecnologia no **Google AI Studio** para Rattan Pães de Levain.*
