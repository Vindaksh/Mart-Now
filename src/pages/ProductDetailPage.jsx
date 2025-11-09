import React from 'react';
import { useParams } from 'react-router-dom';
import { FAKE_PRODUCTS } from '../fakeData';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

function ProductDetailPage() {
    // get the productId from the URL
    const { productId } = useParams();

    // find the correct product (!!from fake data for now)
    const product = FAKE_PRODUCTS.find(p => p.id === productId);

    const { addToCart } = useCart();

    // handle case where the product isn't found
    if (!product) {
        return <div>Product not found!</div>;
    }

    // render the product details
    const isInStock = product.stock_status === 'In Stock';
    return (
        <div className="product-detail-container">
            <img src={product.image_url} alt={product.name} className="product-detail-image" />
            <div className="product-detail-info">
                <h1 className="product-detail-title">{product.name}</h1>
                <p className="product-detail-price">${product.price.toFixed(2)}</p>

                <p className="product-detail-description">{product.description}</p>

                {isInStock ? (
                    <p className="product-detail-stock in-stock">In Stock</p>
                ) : (
                    <p className="product-detail-stock out-of-stock">
                        Out of Stock (Available: {product.availability_date})
                    </p>
                )}

                <button
                    className="add-to-cart-btn-large"
                    disabled={!isInStock}
                    onClick={() => addToCart(product)}
                >
                    {isInStock ? 'Add to Cart' : 'Notify Me'}
                </button>
            </div>
        </div>
    );
}

export default ProductDetailPage;