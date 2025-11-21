import React, { useState, useEffect } from "react";
import { getAllProducts, getAllRetailers } from "../utils/Database";
import ProductCard from "../components/ProductCard";
import "./Dashboard.css";

function DashboardPage() {
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [retailers, setRetailers] = useState([]);

    const [loading, setLoading] = useState(true);

    // -------- FILTER STATES --------
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [selectedRetailers, setSelectedRetailers] = useState([]);
    const [maxDistance, setMaxDistance] = useState("");
    const [sortType, setSortType] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const productData = await getAllProducts();
            const retailerData = await getAllRetailers(); // Helper needed
            setProducts(productData);
            setFiltered(productData);
            setRetailers(retailerData);
            setLoading(false);
        };

        fetchData();
    }, []);

    // -------- HANDLE RETAILER CHECKBOX --------
    const toggleRetailer = (id) => {
        if (selectedRetailers.includes(id)) {
            setSelectedRetailers(selectedRetailers.filter((r) => r !== id));
        } else {
            setSelectedRetailers([...selectedRetailers, id]);
        }
    };

    // -------- APPLY FILTER FUNCTION --------
    const applyFilters = () => {
        let f = [...products];

        // PRICE FILTER
        f = f.filter((p) => {
            const price = p.min_price ?? p.price ?? 0;
            if (minPrice && price < minPrice) return false;
            if (maxPrice && price > maxPrice) return false;
            return true;
        });

        // RETAILER FILTER
        if (selectedRetailers.length > 0) {
            f = f.filter((p) => selectedRetailers.includes(p.seller_id));
        }

        // DISTANCE FILTER  
        // (Requires p.distance_from_user to exist — can be added later)
        if (maxDistance) {
            f = f.filter((p) => p.distance_from_user <= maxDistance);
        }

        // SORTING
        if (sortType === "price_asc") {
            f.sort((a, b) => a.price - b.price);
        } else if (sortType === "price_desc") {
            f.sort((a, b) => b.price - a.price);
        } else if (sortType === "distance") {
            f.sort((a, b) => a.distance_from_user - b.distance_from_user);
        }

        setFiltered(f);
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <h1 className="dashboard-title">Loading Products...</h1>
            </div>
        );
    }

    return (
        <div className="dashboard-wrapper">
            
            {/* ---------------------- FILTER SIDEBAR ---------------------- */}
            <aside className="filter-panel">
                <h2>Filters</h2>

                {/* PRICE FILTER */}
                <div className="filter-block">
                    <h3>Price Range</h3>
                    <input
                        type="number"
                        placeholder="Min Price"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Max Price"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                    />
                </div>

                {/* RETAILER FILTER */}
                <div className="filter-block">
                    <h3>Retailers</h3>
                    {retailers.map((r) => (
                        <label key={r.seller_id} className="checkbox">
                            <input
                                type="checkbox"
                                checked={selectedRetailers.includes(r.seller_id)}
                                onChange={() => toggleRetailer(r.seller_id)}
                            />
                            {r.name}
                        </label>
                    ))}
                </div>

                {/* DISTANCE FILTER */}
                <div className="filter-block">
                    <h3>Distance (km)</h3>
                    <input
                        type="number"
                        placeholder="Max distance"
                        value={maxDistance}
                        onChange={(e) => setMaxDistance(e.target.value)}
                    />
                </div>

                {/* SORTING */}
                <div className="filter-block">
                    <h3>Sort By</h3>
                    <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
                        <option value="">None</option>
                        <option value="price_asc">Price: Low → High</option>
                        <option value="price_desc">Price: High → Low</option>
                        <option value="distance">Distance: Near → Far</option>
                    </select>
                </div>

                <button className="apply-btn" onClick={applyFilters}>
                    Apply Filters
                </button>
            </aside>

            {/* ---------------------- PRODUCT GRID ---------------------- */}
            <div className="dashboard-container">
                <h1 className="dashboard-title">Our Products</h1>

                <div className="product-list">
                    {filtered.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;
