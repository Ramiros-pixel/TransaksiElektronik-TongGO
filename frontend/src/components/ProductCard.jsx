import { useCart } from '../context/CartContext';
import { toast } from './Toast';
import './ProductCard.css';

const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const FOOD_EMOJIS = ['🍜', '🍛', '🍱', '🍣', '🥗', '🍔', '🌮', '🍝', '🥘', '🍲'];

export default function ProductCard({ product, onEdit, onDelete, isAdmin }) {
  const { addToCart } = useCart();
  const emoji = FOOD_EMOJIS[product.idProduct % FOOD_EMOJIS.length];

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} ditambahkan ke keranjang!`);
  };

  return (
    <div className="product-card">
      <div className="product-image">
        {product.imageUrl ? (
          <img className="product-photo" src={product.imageUrl} alt={product.name} />
        ) : (
          <span className="product-emoji">{emoji}</span>
        )}
        <div className="product-glow" />
      </div>


      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">{formatRupiah(product.price)}</span>
          {isAdmin ? (
            <div className="admin-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => onEdit(product)}>✏️ Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(product.idProduct)}>🗑️</button>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={handleAddToCart}>
              + Keranjang
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
