import { Link } from 'react-router'
import {
  produtoTemFreteGratis,
  produtoTemPrecoValido,
  valorRestanteParaFreteGratis,
} from '../utils/carrinho'
import { formatarPreco } from '../utils/formatarPreco'

export default function ProdutoCard({ produto, onAdicionar }) {
  const semPreco = !produtoTemPrecoValido(produto)
  const esgotado = produto.estoque === 0
  const indisponivel = semPreco || esgotado
  const freteGratis = !semPreco && produtoTemFreteGratis(produto)
  const valorFaltante = !semPreco ? valorRestanteParaFreteGratis(produto) : 0

  return (
    <article className="card">
      <Link to={`/produto/${produto.id}`} className="card-link">
        <div className="card-imagem-moldura">
          <img src={produto.image} alt={produto.title} className="card-imagem" />
        </div>
        <h3 className="card-titulo">{produto.title}</h3>
      </Link>

      <p className="card-avaliacao">
        ★ {produto.rating.rate} <span>({produto.rating.count} avaliações)</span>
      </p>

      <div className="card-precos">
        {produto.precoOriginal && (
          <span className="preco-original">{formatarPreco(produto.precoOriginal)}</span>
        )}
        <span className="preco">{semPreco ? 'Preço indisponível' : formatarPreco(produto.price)}</span>
      </div>

      <div className="card-selos">
        {!semPreco && freteGratis && <span className="selo selo-frete">Frete grátis</span>}
        {!semPreco && !freteGratis && valorFaltante > 0 && (
          <span className="selo selo-alerta">Faltam {formatarPreco(valorFaltante)} para frete grátis</span>
        )}
        {esgotado && <span className="selo selo-esgotado">Esgotado</span>}
        {semPreco && <span className="selo selo-alerta">Sem preço</span>}
      </div>

      <button className="botao" onClick={() => onAdicionar(produto)} disabled={indisponivel}>
        {semPreco ? 'Indisponível' : 'Adicionar ao carrinho'}
      </button>
    </article>
  )
}
