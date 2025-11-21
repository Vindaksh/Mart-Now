import React, { useState, useEffect } from "react";
import { getAllProducts, getAllRetailers } from "../utils/Database";
import ProductCard from "../components/ProductCard";
import { Search } from "lucide-react";
//import "./Dashboard.css";
import PriceSlider from "../components/priceslider";
import { useAuth } from "../context/AuthContext";


function DashboardPage() {
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [retailers, setRetailers] = useState([]);
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // -------- FILTER STATES --------
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(0);

    const [selectedRetailers, setSelectedRetailers] = useState([]);
    const [maxDistance, setMaxDistance] = useState("");
    const [sortType, setSortType] = useState("");
    const [priceBounds, setPriceBounds] = useState({ min: 0, max: 5000 });
    const filteredRetailers = retailers.filter(r => r.user_role === "retailer");


    function extractPrice(product) {
        if (!product.listings || product.listings.length === 0) return 0;
        return Math.min(...product.listings.map(l => l.price || 0));
    }
    function productMinListingDistance(product) {
        const dist = (product.listings || []).map(l => Number(l.distance_from_user ?? Infinity)).filter(d => !Number.isNaN(d));
        if (dist.length === 0) return Infinity;
        return Math.min(...dist);
    }

    useEffect(() => {
        const fetchData = async () => {
            const productData = await getAllProducts();
            const retailerData = await getAllRetailers();   // returns only retailers

            if (!user) return; // wait for AuthContext to load user info
            const role = user.role;

            // Allowed listing seller roles
            let allowedRoles = [];
            if (role === "customer") allowedRoles = ["retailer"];
            if (role === "retailer") allowedRoles = ["wholesaler"];

            // Extract seller roles from retailers table
            const retailerIds = new Set(
                retailerData.filter(r => r.user_role === "retailer").map(r => r.seller_id)
            );

            // Filter listings by allowed roles
            const productsFiltered = productData.map(p => {
                const filteredListings = p.listings.filter(l =>
                    (allowedRoles.includes("retailer") && retailerIds.has(l.seller_id)) // show retailer listings
                );
                return { ...p, listings: filteredListings };
            })
            .filter(p => p.listings.length > 0);  // remove unavailable products

            // Compute lowest price
            const withLowestPrice = productsFiltered.map(p => ({
                ...p,
                lowest_price: Math.min(...p.listings.map(l => l.price))
            }));

            // Compute price bounds for slider
            const allPrices = withLowestPrice.flatMap(p => p.listings.map(l => l.price));
            const minP = Math.min(...allPrices);
            const maxP = Math.max(...allPrices);

            setProducts(withLowestPrice);
            setFiltered(withLowestPrice);
            setPriceBounds({ min: minP, max: maxP });
            setMinPrice(minP);
            setMaxPrice(maxP);
            setRetailers(retailerData.filter(r => r.user_role === "retailer"));

            setLoading(false);
        };

        fetchData();
    }, [user]);


    // -------- HANDLE RETAILER CHECKBOX --------
    const toggleRetailer = (sellerId) => {
        setSelectedRetailers(prev =>
            prev.includes(sellerId)
                ? prev.filter(id => id !== sellerId)
                : [...prev, sellerId]
        );
    };



    // -------- APPLY FILTER FUNCTION --------
    const applyFilters = () => {
        const minP = Number(minPrice);
    const maxP = Number(maxPrice);
    const distanceLimit = maxDistance ? Number(maxDistance) : null;

    // product passes if ANY of its retailer listings match all filters
    const f = products.filter(product => {
        const validListings = (product.listings || []).filter(listing => {
            const price = Number(listing.price ?? 0);
            const seller = listing.seller_id;

            // ---- PRICE FILTER ----
            if (price < minP || price > maxP) return false;

            // ---- RETAILER FILTER ----
            if (selectedRetailers.length > 0 && !selectedRetailers.includes(seller)) {
                return false;
            }

            // ---- DISTANCE FILTER ----
            if (distanceLimit !== null) {
                const d = Number(listing.distance_from_user ?? Infinity);
                if (d > distanceLimit) return false;
            }

            return true;
        });

        // include product only if at least one listing is valid
        return validListings.length > 0;
    });

    // ---- SORTING ----
    if (sortType === "price_asc") {
        f.sort((a, b) => extractPrice(a) - extractPrice(b));
    } 
    else if (sortType === "price_desc") {
        f.sort((a, b) => extractPrice(b) - extractPrice(a));
    } 
    else if (sortType === "distance") {
        // sort by min listing distance
        const dist = p =>
            Math.min(
                ...(p.listings || []).map(l => Number(l.distance_from_user ?? Infinity))
            );
        f.sort((a, b) => dist(a) - dist(b));
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
        <div className="min-h-[calc(100vh-80px)] bg-rose-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
    
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Marketplace</h1>
                        <p className="text-slate-500 mt-1">Items available in your area.</p>
                    </div>
    
                    {/* Search Bar */}
                    <div className="relative max-w-md w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-rose-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for apples, bread..."
                            className="block w-full pl-10 pr-3 py-3 border border-rose-100 rounded-2xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 sm:text-sm shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* RETAILER FILTER */}
                    <div className="filter-block">
                        <h3>Retailers</h3>
                        {filteredRetailers.map((r) => (
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
                </div>
            </div>

            {/* ---------------------- PRODUCT GRID ---------------------- */}
            <div className="dashboard-container">
                <h1 className="dashboard-title">Our Products</h1>

                <div className="product-list">
                    {filtered.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
    
                {/* Content Area */}
                {loading ? (
                    <div className="flex justify-center items-center h-64 text-rose-400 font-medium animate-pulse">
                        Loading fresh products...
                    </div>
                ) : (
                    <>
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-rose-100">
                                <p className="text-slate-500 text-lg">No products found matching "{searchTerm}".</p>
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="mt-4 text-rose-600 font-bold hover:underline"
                                >
                                    Clear Search
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProducts.map((product) => (
                                    <div key={product.id || product.product_id} className="h-full">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default DashboardPage;