import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from './types';

const API_BASE = "https://spa-enterprises-production.up.railway.app/api";

interface ProductContextType {
    products: Product[];
    brandFilter: string;
    setBrandFilter: (brand: string) => void;
    cartItems: Product[];
    addToCart: (product: Product) => void;
    clearCart: () => void;
    addProduct: (product: Product) => void;
    removeProduct: (id: string) => void;
    updateProduct: (product: Product) => void;
    resetToDefault: () => void;
    refreshCatalog: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [brandFilter, setBrandFilter] = useState('All');
    const [cartItems, setCartItems] = useState<Product[]>([]);

    const addToCart = (product: Product) => {
        setCartItems(prev => [...prev, product]);
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const refreshCatalog = async () => {
        try {
            const response = await fetch(`${API_BASE}/products`);
            const data = await response.json();
            setProducts(data);
            console.log("[SPA ENTERPRISE] Inventory Hub Sync: OK");
        } catch (error) {
            console.error("[SPA ENTERPRISE] Sync Latency Detected:", error);
        }
    };

    useEffect(() => {
        refreshCatalog();
    }, []);

    const addProduct = async (product: Product) => {
        try {
            const response = await fetch(`${API_BASE}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product),
            });
            if (response.ok) refreshCatalog();
        } catch (error) {
            console.error("Failed to distribute asset:", error);
        }
    };

    const removeProduct = async (id: string) => {
        try {
            const response = await fetch(`${API_BASE}/products/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) refreshCatalog();
        } catch (error) {
            console.error("Failed to decommission asset:", error);
        }
    };

    const updateProduct = async (updatedProduct: Product) => {
        try {
            const response = await fetch(`${API_BASE}/products/${updatedProduct.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProduct),
            });
            if (response.ok) refreshCatalog();
        } catch (error) {
            console.error("Failed to update registry record:", error);
        }
    };

    const resetToDefault = () => {
        // This would require a backend reset endpoint in production
        refreshCatalog();
    };

    return (
        <ProductContext.Provider value={{
            products,
            brandFilter,
            setBrandFilter,
            cartItems,
            addToCart,
            clearCart,
            addProduct,
            removeProduct,
            updateProduct,
            resetToDefault,
            refreshCatalog
        }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
};
