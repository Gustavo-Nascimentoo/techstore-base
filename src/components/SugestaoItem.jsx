import { produtoTemPrecoValido } from '../utils/carrinho'
import { formatarPreco } from '../utils/formatarPreco'

export default function SugestaoItem({ produto, onAdicionar }) {
  const indisponivel = !produtoTemPrecoValido(produto) || produto.estoque === 0

  return (
    <div className="sugestao">
      <div className="sugestao-imagem-moldura">
        <img src={produto.image} alt={produto.title} className="sugestao-imagem" />
      </div>
      <div className="sugestao-info">
        <p className="sugestao-titulo">{produto.title}</p>
        <p className="preco preco-pequeno">{produtoTemPrecoValido(produto) ? formatarPreco(produto.price) : 'Preço indisponível'}</p>
      </div>
      <button className="botao botao-pequeno" onClick={() => onAdicionar(produto)} disabled={indisponivel}>
        {indisponivel ? 'Indisponível' : 'Comprar'}
      </button>
    </div>
  )
}
