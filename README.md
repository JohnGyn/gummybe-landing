# Landing Page GummyBe Hair & Skin

Landing page oficial da **GummyBe Hair & Skin**, disponibilizada para afiliados autorizados divulgarem o produto com seus próprios links de venda.

> **Afiliado:** baixe o projeto, substitua os cinco links de checkout pelos seus links de afiliado e publique. A página já está pronta e não exige instalação, banco de dados ou processo de compilação.

[![Prévia da landing page GummyBe Hair & Skin](assets/img/og.jpg)](https://shop.gummybe.com.br/)

## Página publicada

**Landing page:** https://shop.gummybe.com.br/

## O que você precisa alterar

Todos os links de compra ficam no arquivo [`index.html`](index.html), dentro da seção de kits. Procure pelos cinco atributos chamados `data-url`:

```html
<input name="kit" value="1" data-url="COLE_AQUI_SEU_LINK_DE_AFILIADO">
<input name="kit" value="2" data-url="COLE_AQUI_SEU_LINK_DE_AFILIADO">
<input name="kit" value="3" data-url="COLE_AQUI_SEU_LINK_DE_AFILIADO">
<input name="kit" value="5" data-url="COLE_AQUI_SEU_LINK_DE_AFILIADO">
<input name="kit" value="7" data-url="COLE_AQUI_SEU_LINK_DE_AFILIADO">
```

Substitua somente o conteúdo entre aspas de cada `data-url`. Mantenha os demais atributos de cada linha.

Cada valor corresponde a uma oferta:

| Valor do kit | Oferta exibida na página |
|---|---|
| `1` | 1 pote · 1 mês de uso |
| `2` | 2 potes · 2 meses de uso |
| `3` | 3 potes · 3 meses de uso |
| `5` | 5 potes · 5 meses de uso |
| `7` | 7 potes · 7 meses de uso |

O botão **Comprar agora** recebe automaticamente o link do kit selecionado. Depois de editar, selecione cada uma das cinco opções e teste o botão antes de iniciar a divulgação.

## Como copiar o projeto

### Opção 1: criar seu próprio repositório

1. Clique em **Fork** no topo deste repositório.
2. Crie a cópia na sua conta do GitHub.
3. Abra `index.html` no seu repositório.
4. Clique no ícone de lápis para editar.
5. Procure por `data-url` e troque os cinco links.
6. Salve em **Commit changes**.

Essa é a opção mais simples para publicar pela Vercel sem instalar ferramentas no computador.

### Opção 2: baixar o arquivo ZIP

1. Clique em **Code** no topo deste repositório.
2. Clique em **Download ZIP**.
3. Extraia o arquivo no computador.
4. Abra `index.html` em um editor de texto ou de código.
5. Procure por `data-url` e troque os cinco links.

### Opção 3: clonar com Git

```bash
git clone https://github.com/JohnGyn/gummybe-landing.git
cd gummybe-landing
```

Depois, edite `index.html` e substitua os cinco atributos `data-url`.

## Como testar no computador

O projeto usa apenas HTML, CSS e JavaScript. Se você tiver Python instalado, execute na pasta do projeto:

```bash
python3 -m http.server 5173
```

Abra http://localhost:5173 no navegador.

Também é possível usar uma extensão de servidor local, como **Live Server**, no editor de código.

## Como publicar na Vercel

1. Faça um **fork** deste repositório.
2. Entre em https://vercel.com/ com sua conta do GitHub.
3. Clique em **Add New → Project**.
4. Importe o repositório criado na sua conta.
5. Em **Framework Preset**, escolha **Other**.
6. Não preencha comando de build e mantenha a raiz do projeto como diretório de saída.
7. Clique em **Deploy**.

Quando você enviar novas alterações para a branch `main`, a Vercel publicará uma nova versão automaticamente.

Como o projeto é estático, ele também pode ser publicado no Netlify, Cloudflare Pages, hospedagem compartilhada, cPanel ou VPS com Nginx ou Apache. Publique todo o conteúdo do repositório e preserve a estrutura das pastas.

## Páginas de retorno do checkout

O projeto inclui páginas para os diferentes estados de pagamento:

| Situação | Caminho no seu domínio | Exemplo oficial |
|---|---|---|
| Pagamento aprovado | `/obrigado/` | https://shop.gummybe.com.br/obrigado/ |
| Pix gerado | `/obrigado/pix/` | https://shop.gummybe.com.br/obrigado/pix/ |
| Boleto gerado | `/obrigado/boleto/` | https://shop.gummybe.com.br/obrigado/boleto/ |
| Pagamento em processamento | `/obrigado/processando/` | https://shop.gummybe.com.br/obrigado/processando/ |

Ao publicar em outro domínio, troque apenas o domínio dos exemplos. Se a sua página estiver em `https://meusite.com.br`, a URL de pagamento aprovado será `https://meusite.com.br/obrigado/`.

Cadastre essas URLs no checkout correspondente a cada situação para que o comprador seja direcionado à página correta.

## Rastreamento

O projeto contém o Meta Pixel usado na página oficial:

- `PageView` é disparado na landing page e nas páginas de retorno;
- `InitiateCheckout` é disparado quando o visitante clica para comprar, com valor e quantidade do kit selecionado;
- `Purchase` é disparado somente na página de pagamento aprovado;
- o evento `Purchase` usa `?value=` ou `?valor=` quando o checkout envia um desses parâmetros;
- a mesma compra não é contada novamente se a página for recarregada na mesma sessão.

O Pixel está configurado no [`index.html`](index.html) e nas páginas dentro de [`obrigado/`](obrigado/). Afiliados que precisarem usar um pixel próprio podem substituir essa configuração antes de publicar. Essa alteração é opcional para quem precisa apenas trocar os links de venda.

## Estrutura do projeto

```text
.
├── index.html              # landing page, ofertas e links de checkout
├── assets/
│   ├── css/                # estilos da landing page e dos retornos
│   ├── img/                # imagens otimizadas usadas no site
│   └── js/
│       ├── main.js         # comportamento da landing page
│       └── thank-you.js    # rastreamento das páginas de retorno
├── obrigado/               # páginas de retorno do checkout
└── tools/                  # utilitário de otimização de imagens
```

## Personalizações opcionais

| Alteração | Arquivo principal |
|---|---|
| Links de checkout, ofertas, preços, textos e Meta Pixel | `index.html` |
| Comportamento dos kits, menu, animações e evento de checkout | `assets/js/main.js` |
| Cores, fontes, espaçamentos e responsividade | `assets/css/style.css` |
| Conteúdo das páginas de aprovado, Pix, boleto e processamento | `obrigado/` |
| Estilo das páginas de retorno | `assets/css/thank-you.css` |
| Rastreamento das páginas de retorno | `assets/js/thank-you.js` |

Alterar preços, alegações sobre o produto, ingredientes, tabela nutricional ou instruções de consumo pode deixar a página diferente da comunicação oficial da marca. Para divulgação como afiliado, a recomendação é trocar apenas os links de checkout.

## Uso do material

Este projeto é disponibilizado para divulgação da GummyBe por afiliados autorizados. A marca, os textos, as imagens dos produtos e os demais materiais comerciais continuam pertencendo aos seus respectivos titulares.

Não remova informações obrigatórias do produto nem use a página para divulgar produtos de terceiros como se fossem da GummyBe.

## Suporte

Em caso de dúvida sobre cadastro, aprovação ou geração dos links de afiliado, fale com o responsável pelo programa de afiliados da GummyBe.
