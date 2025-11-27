const API_URL = "https://ecommerce-fullstack-backend-5byr.onrender.com/api";

export const fetchProducts = async () => {
  const res = await fetch(`${API_URL}/products`);
  return res.json();
};

export const addToCart = async (producto_id: number, cantidad: number, token: string) => {
  const res = await fetch(`${API_URL}/cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ producto_id, cantidad }),
  });
  return res.json();
};

export const fetchCart = async (token: string) => {
  const res = await fetch(`${API_URL}/cart`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  return res.json();
};

export const checkoutCart = async (token: string) => {
  const res = await fetch(`${API_URL}/checkout`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
  });
  return res.json();
};

