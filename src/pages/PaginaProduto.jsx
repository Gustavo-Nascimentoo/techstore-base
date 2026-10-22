import { useState } from 'react'
import { Link, useParams } from 'react-router'
import ProdutoCard from '../components/ProdutoCard'
import {
  produtoTemFreteGratis,
  produtoTemPrecoValido,
  valorRestanteParaFreteGratis,
} from '../utils/carrinho'
import { formatarPreco } from '../utils/formatarPreco'

export default function PaginaProduto({ produtos, onAdicionar, onRegistrarAviso, clienteAtual }) {
  const { id } = useParams()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [avisado, setAvisado] = useState(false)

  const produto = produtos.find((item) => item.id === id)

  if (!produto) {
    return (
      <div className="estado-vazio">
        <p>Produto não encontrado.</p>
        <Link to="/" className="botao botao-secundario">
          Voltar para a loja
        </Link>
      </div>
    )
  }

  const semPreco = !produtoTemPrecoValido(produto)
  const esgotado = produto.estoque === 0
  const freteGratis = !semPreco && produtoTemFreteGratis(produto)
  const valorFaltante = !semPreco ? valorRestanteParaFreteGratis(produto) : 0

  const relacionados = produtos
    .filter((item) => item.category === produto.category && item.id !== produto.id)
    .slice(0, 4)

  function enviarAviso(evento) {
    evento.preventDefault()

    if (!nome.trim() || !email.trim()) {
      return
    }

    onRegistrarAviso?.(produto, { nome, email })
    setAvisado(true)
  }

  return (
    <section>
      <nav className="trilha" aria-label="Você está em">
        <Link to="/">Loja</Link>
        <span aria-hidden="true">/</span>
        <span>{produto.title}</span>
      </nav>

      <div className="detalhe">
        <div className="detalhe-imagem-moldura">
          <img src={produto.image} alt={produto.title} className="detalhe-imagem" />
        </div>

        <div className="detalhe-info">
          <h1>{produto.title}</h1>
          <p className="card-avaliacao">
            ★ {produto.rating.rate} <span>({produto.rating.count} avaliações)</span>
          </p>
          <p className="detalhe-preco">{semPreco ? 'Preço indisponível' : formatarPreco(produto.price)}</p>
          {!semPreco && (
            <p className="detalhe-frete">
              {freteGratis
                ? 'Frete grátis ativado'
                : `Faltam ${formatarPreco(valorFaltante)} para ganhar frete grátis`}
            </p>
          )}
          <p className="detalhe-descricao">{produto.description}</p>
          <p className="detalhe-estoque">{produto.estoque} unidades disponíveis</p>

          {!esgotado && !semPreco ? (
            <button
              className="botao botao-grande"
              onClick={() => onAdicionar(produto)}
            >
              Adicionar ao carrinho
            </button>
          ) : (
            <button className="botao botao-grande" disabled>
              {semPreco ? 'Indisponível' : 'Esgotado'}
            </button>
          )}

          {esgotado && (
            <form onSubmit={enviarAviso} className="alerta-esgotado">
              <p>Este produto está esgotado. Deixe seu e-mail para receber aviso quando voltar.</p>
              <input
                type="text"
                value={nome}
                onChange={(evento) => setNome(evento.target.value)}
                placeholder="Seu nome"
              />
              <input
                type="email"
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
                placeholder="Seu e-mail"
              />
              <button type="submit" className="botao botao-secundario">
                {avisado ? 'Aviso registrado' : 'Avise-me'}
              </button>
            </form>
          )}

          <ul className="detalhe-garantias">
            <li>Troca grátis em até 30 dias</li>
            <li>Parcele em até 10x sem juros</li>
          </ul>
        </div>
      </div>

      <h2>Produtos relacionados</h2>
      <div className="grade">
        {relacionados.map((item) => (
          <ProdutoCard key={item.id} produto={item} onAdicionar={onAdicionar} />
        ))}
      </div>
    </section>
  )
}
