import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity?: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // setProducts([]);
    async function loadProducts(): Promise<void> {
      // await AsyncStorage.removeItem('@GoMarketpalce: itens');
      const productsJSON = await AsyncStorage.getItem('@GoMarketplace: itens');
      if (productsJSON) {
        setProducts(JSON.parse(productsJSON));
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function saveProducts(): Promise<void> {
      await AsyncStorage.setItem(
        '@GoMarketplace: itens',
        JSON.stringify(products),
      );
    }
    saveProducts();
  }, [products]);

  const addToCart = useCallback(
    async (product: Product) => {
      let cartProducts: Product[] = [...products];
      const productIndex = cartProducts.findIndex(
        prod => prod.id === product.id,
      );
      if (productIndex < 0) {
        cartProducts = [
          ...products,
          {
            id: product.id,
            image_url: product.image_url,
            price: product.price,
            title: product.title,
            quantity: 1,
          },
        ];
        setProducts(cartProducts);
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const updatedProducts: Product[] = [...products];
      const updatedProductIndex = updatedProducts.findIndex(
        prod => prod.id === id,
      );

      updatedProducts[updatedProductIndex].quantity += 1;
      setProducts(updatedProducts);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProducts: Product[] = [...products];
      const productIndex = newProducts.findIndex(product => product.id === id);

      newProducts[productIndex].quantity -= 1;

      if (newProducts[productIndex].quantity <= 0) {
        newProducts.splice(productIndex, 1);
      }
      setProducts(newProducts);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
