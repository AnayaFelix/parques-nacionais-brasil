# 🚀 Guia da Equipe e Fluxo de Trabalho

Bem-vindas ao projeto! Este guia serve para orientar como vamos trabalhar juntas sem bagunçar o código umas das outras, além de detalhar as tarefas de cada uma.

## 🌐 Nosso Ambiente
*   **Código:** GitHub (Repositório Público)
*   **Site no ar (Hospedagem):** Netlify (Atualiza automaticamente quando a gente junta o código na branch `main`).
*   **Desenvolvimento:** Usaremos HTML, CSS (Tailwind via CDN) e JavaScript puro por enquanto. **O uso de IA (ChatGPT, Claude, Gemini) é obrigatório e super encorajado** para acelerar o trabalho.

---

## 🔄 O Fluxo de Trabalho (Como não apagar o código da amiga)

**REGRA DE OURO:** Ninguém mexe direto na branch `main`. A branch `main` é a versão que o público está vendo no Netlify.

1.  **Baixe o projeto:** `git clone [link-do-repositorio]`
2.  **Crie sua própria branch (galho):** Antes de codar, crie um galho para você. Exemplo:
    `git checkout -b feature/tarefa-da-leticia`
3.  **Codifique:** Faça suas alterações usando a IA.
4.  **Teste localmente:** Abra o arquivo `index.html` no navegador e veja se a sua parte funcionou e não quebrou o resto.
5.  **Salve (Commit):** `git add .` e depois `git commit -m "feat: adiciona minha parte"`
6.  **Envie para o GitHub:** `git push origin feature/tarefa-da-leticia`
7.  **Pull Request (PR):** Vá no site do GitHub e abra um PR pedindo para juntar sua branch à `main`.
8.  **Revisão:** A Anaya ou a Laura vão olhar seu código. Se estiver tudo certo, a gente faz o *Merge* e o Netlify atualiza o site sozinho!

---

## 📋 Divisão de Tarefas (Com Prompts de IA)

Para evitar que duas pessoas mexam no mesmo arquivo ao mesmo tempo, vamos separar as responsabilidades. 

### 👩🏽‍💻 Leticia (Dados)
*   **Tarefa:** Separar a lista de parques do arquivo HTML principal e criar o banco de dados inicial.
*   **Prompt para IA:** *"Tenho esse array de objetos em Javascript com 76 parques dentro do meu arquivo index.html. Por favor, crie um arquivo separado chamado `dados.js` que exporta essa constante. Depois, me diga como alterar meu `index.html` para puxar os dados desse novo arquivo"*.

### 👩🏽‍💻 Giovanna (Supabase)
*   **Tarefa:** Configurar o Supabase e fazer o site buscar os dados de lá, em vez do arquivo local.
*   **Prompt para IA:** *"Tenho um projeto em HTML/JS puro. Quero usar o Supabase via CDN. Gere o código para inicializar o Supabase e criar uma função assíncrona `fetchParques()` que busca os dados da tabela 'parques' e chama a função `renderMapMarkers(dados)` com o resultado"*.

### 👩🏽‍💻 Kamilly (Páginas e Fórum)
*   **Tarefa:** Criar a página `parque.html` que abre quando o usuário clica em um pino no mapa.
*   **Prompt para IA:** *"Tenho um código HTML/Tailwind. Preciso criar uma página `parque.html` que lê o ID do parque na URL (ex: ?id=3), busca as informações no arquivo dados.js e mostra o título, estado e hectares no topo da página, além de um espaço em branco para os comentários"*.

### 👩🏽‍💻 Clara (Design)
*   **Tarefa:** Padronizar o visual e criar peças de encaixe (ex: os cards de postagem para o fórum).
*   **Prompt para IA:** *"Estou usando Tailwind CSS. Crie um componente em HTML puro para um 'PostCard' (para uma rede social). Ele precisa ter um espaço para a foto de perfil, nome do usuário, texto do post, e botões de curtir e comentar abaixo"*.

### 👩🏽‍💻 Anaya (Auth e Integração)
*   **Tarefa:** Criar o modal de login usando o Supabase Auth e a lógica de amizades.
*   **Prompt para IA:** *"Crie um modal de login usando Tailwind CSS e a biblioteca do Supabase (via CDN). Ele deve ter botões para login com Google e E-mail. Ao clicar fora do modal, ele deve fechar"*.

### 👩🏽‍💻 Laura (Infra e Mapa)
*   **Tarefa:** Garantir que o deploy no Netlify está funcionando e adicionar recursos avançados ao mapa (ex: agrupar pins próximos).
*   **Prompt para IA:** *"Meu mapa em Leaflet tem muitos pins. Como eu instalo e configuro o plugin `Leaflet.markercluster` via CDN para que os pins se agrupem quando o zoom estiver longe?"*.

---

## 🚨 Regra de Ouro para a Integração
Como o projeto está começando, **todos os arquivos vão ficar na mesma pasta raiz**. 
*   O arquivo `index.html` principal (o mapa) **é de responsabilidade da Laura e da Anaya**.
*   A Kamilly não deve mexer no `index.html`; ela deve criar arquivos novos (ex: `forum.html`, `parque.html`).
*   A Clara deve criar arquivos de componentes (ex: `componentes.js` ou apenas passar o código HTML para a Kamilly).

Assim, evitamos conflitos no Git.
