import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../utils/Database";
import { useCart } from "../context/CartContext";
import "./ProductDetail.css";

function ProductDetailPage() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const { addToCart } = useCart();
    const [selectedListing, setSelectedListing] = useState(null);

    useEffect(() => {
        const loadProduct = async () => {
            const data = await getProductById(productId);
            //console.log("FULL PRODUCT:", data);
            setProduct(data);

            if (data?.listings?.length > 0) {
                const sorted = [...data.listings].sort((a, b) => a.price - b.price);
                setSelectedListing(sorted[0]);
            }

            setLoading(false);
        };

        loadProduct();
    }, [productId]);

    if (loading) return <div>Loading...</div>;
    if (!product) return <div>Product not found.</div>;
    
    const isInStock = selectedListing?.stock > 0;
    const handleSellerChange = (e) => {
        const listingId = e.target.value;
        const selected = listings.find(l => l.product_listings_id === listingId);

    setSelectedListing(selected);
    };
    return (
    <div className="pd-grid">

        {/* LEFT — CAROUSEL */}
        <div className="pd-left">
            <div className="pd-carousel">
                <img src={product.image_url} alt={product.name} />
            </div>
        </div>

        {/* CENTER — MAIN PRODUCT DETAILS */}
        <div className="pd-center">
            <h1 className="pd-title">{product.name}</h1>

            <p className="pd-description">{product.description}</p>

            <p className={`pd-stock ${isInStock ? "in" : "out"}`}>
                {isInStock ? "In Stock" : "Out of Stock"}
            </p>
        </div>

        {/* RIGHT — ORDER BOX WITH RETAILER SELECTOR */}
        <div className="pd-right">
            <div className="pd-order-box">

                <p className="pd-price">₹{selectedListing?.price}</p>

                {/* SELLER SELECT */}
                <label className="pd-seller-label">Choose Retailer:</label>
                <select
                    className="pd-seller-select"
                    value={selectedListing?.product_listings_id}
                    onChange={(e) => {
                        const listingId = e.target.value;
                        const chosen = product.listings.find(
                            l => l.product_listings_id === listingId
                        );
                        setSelectedListing(chosen);
                    }}
                >
                    {product.listings.map((l) => (
                        <option
                            key={l.product_listings_id}
                            value={l.product_listings_id}
                        >
                            {l.seller.name} — ₹{l.price} — Stock: {l.stock}
                        </option>
                    ))}
                </select>

                {/* BUTTONS */}
                <button
                    className="pd-btn add"
                    disabled={!isInStock}
                    onClick={() =>
                        addToCart({
                            ...product,
                            listing: selectedListing
                        })
                    }
                >
                    Add to Cart
                </button>

                <button
                    className="pd-btn buy"
                    disabled={!isInStock}
                    onClick={() => alert("Buying...")}
                >
                    Buy Now
                </button>
            </div>
        </div>
    </div>
);


}

export default ProductDetailPage;
