import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load orders");
      }
    };

    fetchOrders();
  }, [token]);

  const orderTotal = (items) =>
    items.reduce((acc, item) => acc + Number(item.price), 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/admin")}
          className="mr-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold">Orders</h1>
      </div>

      {orders.length === 0 && <p className="text-gray-500">No orders found</p>}

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white shadow rounded p-4">
            <div className="mb-3">
              <p className="font-semibold">
                Customer Email:{" "}
                <span className="text-blue-600">{order.email}</span>
              </p>
            </div>

            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 text-left">Book</th>
                  <th className="border p-2">Price</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border p-2">{item.title}</td>
                    <td className="border p-2 text-center">
                      ${Number(item.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-right mt-3 font-bold text-green-600">
              Total: ${orderTotal(order.items).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
