import { useEffect, useState } from 'react'
import ProdutoCard from '../components/ProdutoCard'
import { produtoDisponivel } from '../utils/carrinho'

const CATEGORIAS = [
  { id: 'todas', nome: 'Todas' },
  { id: 'roupas', nome: 'Roupas' },
  { id: 'eletronicos', nome: 'Eletrônicos' },
  { id: 'acessorios', nome: 'Acessórios' },
  { id: 'casa', nome: 'Casa' },
]

export default function Loja({ produtos, onAdicionar }) {
  const [categoria, setCategoria] = useState('todas')
  const [produtosVisiveis, setProdutosVisiveis] = useState([])

  useEffect(() => {
    const disponiveis = produtos.filter((produto) => produtoDisponivel(produto))

    if (categoria === 'todas') {
      setProdutosVisiveis(disponiveis)
    } else {
      setProdutosVisiveis(disponiveis.filter((produto) => produto.category === categoria))
    }
  }, [categoria, produtos])

  return (
    <section>
      <div className="vitrine-topo">
        <p className="sobretitulo">Coleção de outubro</p>
        <h1>Produtos</h1>
      </div>

      <div className="filtros" role="group" aria-label="Filtrar por categoria">
        {CATEGORIAS.map((item) => (
          <button
            key={item.id}
            className={item.id === categoria ? 'filtro filtro-ativo' : 'filtro'}
            aria-pressed={item.id === categoria}
            onClick={() => setCategoria(item.id)}
          >
            {item.nome}
          </button>
        ))}
      </div>

      <div className="grade">
        {produtosVisiveis.length > 0 ? (
          produtosVisiveis.map((produto) => (
            <ProdutoCard key={produto.id} produto={produto} onAdicionar={onAdicionar} />
          ))
        ) : (
          <p className="estado-vazio">Nenhum produto disponível nesta categoria.</p>
        )}
      </div>
    </section>
  )
}
