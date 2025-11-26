import { useState, useEffect } from "react";
import { fetchProducts, fetchCart, addToCart, checkoutCart } from "./api/api";
import "./App.css";

interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
}

interface CartItem {
  id: number;
  producto_id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [token, setToken] = useState<string>(() => localStorage.getItem("token") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Cargar productos
  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  // Cargar carrito
  const loadCart = () => {
    if (!token) return;
    fetchCart(token).then(setCart);
  };

  useEffect(() => {
    loadCart();
  }, [token]);

  // Login
  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
        setEmail("");
        setPassword("");
      } else {
        alert(data.message || "Error en login");
      }
    } catch (err) {
      console.error(err);
      alert("Error conectando con el servidor");
    }
  };

  // Logout
  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
    setCart([]);
  };

  // Agregar producto al carrito
  const handleAddToCart = async (producto_id: number) => {
    if (!token) return alert("Debes iniciar sesión");
    await addToCart(producto_id, 1, token);
    loadCart();
  };

  // Checkout
  const handleCheckout = async () => {
    if (!token) return alert("Debes iniciar sesión");
    const res = await checkoutCart(token);
    alert(`Pedido realizado. Total: $${res.total}`);
    loadCart();
  };

  const total = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  return (
    <div className="container">
      <h1>RobStore</h1>

      {!token ? (
        <div className="login-form">
          <h2>Iniciar sesión</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Iniciar sesión</button>
        </div>
      ) : (
        <>
          <div className="logout-container">
            <button onClick={handleLogout}>Cerrar sesión</button>
          </div>

          <h2>Productos</h2>
          <div className="product-list">
            {products.map((p) => (
              <div key={p.id} className="card">
                <h3>{p.nombre}</h3>
                <p>{p.descripcion}</p>
                <p>Precio: ${p.precio}</p>
                <p>Stock: {p.stock}</p>
                <button onClick={() => handleAddToCart(p.id)} disabled={p.stock <= 0}>
                  Agregar al carrito
                </button>
              </div>
            ))}
          </div>

          <h2>Carrito</h2>
          <div className="cart">
            {cart.length === 0 ? (
              <p>El carrito está vacío</p>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    {item.nombre} - {item.cantidad} x ${item.precio}
                  </div>
                ))}
                <p className="cart-total">Total: ${total}</p>
                <button onClick={handleCheckout}>Pagar</button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
