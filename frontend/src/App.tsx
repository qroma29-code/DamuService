import { useState, useEffect } from 'react';

interface Client { id: number; name: string; phone: string; }
interface Order {
  id: number; device: string; description: string; status: string; price: number; clientId: number;
  client: Client;
}

export default function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  const [device, setDevice] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');

  const API_URL = 'http://localhost:5000/api';

  const fetchOrders = async () => {
    const resOrders = await fetch(`${API_URL}/orders`);
    const resClients = await fetch(`${API_URL}/clients`);
    setOrders(await resOrders.json());
    setClients(await resClients.json());
  };

  useEffect(() => { fetchOrders(); }, []);

  const createClient = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: clientName, phone: clientPhone }),
    });
    setClientName(''); setClientPhone('');
    fetchOrders();
  };

  const createOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device, description, price, clientId: selectedClientId }),
    });
    setDevice(''); setDescription(''); setPrice(''); setSelectedClientId('');
    fetchOrders();
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch(`${API_URL}/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans text-gray-800">
      <header className="mb-8 border-b border-gray-200 bg-white p-4 shadow-sm rounded-lg">
        <h1 className="text-2xl font-bold text-blue-600">Prizrak</h1>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Панель создания клиентов */}
        <div className="bg-white p-5 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Новый клиент</h2>
          <form onSubmit={createClient} className="space-y-3">
            <input type="text" placeholder="Имя" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full border p-2 rounded" required />
            <input type="text" placeholder="Телефон" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="w-full border p-2 rounded" required />
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">Создать</button>
          </form>
        </div>

        {/* Панель создания заказов */}
        <div className="bg-white p-5 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Принять в ремонт</h2>
          <form onSubmit={createOrder} className="space-y-3">
            <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className="w-full border p-2 rounded" required>
              <option value="">Выберите клиента</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
            </select>
            <input type="text" placeholder="Устройство" value={device} onChange={e => setDevice(e.target.value)} className="w-full border p-2 rounded" required />
            <input type="text" placeholder="Описание" value={description} onChange={e => setDescription(e.target.value)} className="w-full border p-2 rounded" required />
            <input type="number" placeholder="Цена" value={price} onChange={e => setPrice(e.target.value)} className="w-full border p-2 rounded" required />
            <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition">Создать</button>
          </form>
        </div>

        {/* Таблица заказов */}
        <div className="bg-white p-5 rounded-lg shadow col-span-1 md:col-span-3">
          <h2 className="text-lg font-semibold mb-4">Заказы</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">ID</th>
                <th className="border p-2">Устройство</th>
                <th className="border p-2">Описание</th>
                <th className="border p-2">Клиент</th>
                <th className="border p-2">Цена</th>
                <th className="border p-2">Статус</th>
                <th className="border p-2">Действия</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-100">
                  <td className="border p-2">{order.id}</td>
                  <td className="border p-2">{order.device}</td>
                  <td className="border p-2">{order.description}</td>
                  <td className="border p-2">
                    <div className="font-medium">{order.client?.name}</div>
                    <div className="text-xs text-gray-400">{order.client?.phone}</div>
                  </td>
                  <td className="border p-2">{order.price} тг</td>
                  <td className="border p-2">
                    <span className={`px-2 py-1 text-sm rounded font-bold ${
                      order.status === 'NEW' ? 'bg-yellow-200 text-yellow-800' :
                      order.status === 'IN_PROGRESS' ? 'bg-blue-200 text-blue-800' :
                      order.status === 'READY' ? 'bg-green-200 text-green-800' : ''
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="border p-3 space-x-1">
                    {order.status !== 'NEW' && <button onClick={() => updateStatus(order.id, 'IN_PROGRESS')} className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition">В работу</button>}
                    {order.status !== 'IN_PROGRESS' && <button onClick={() => updateStatus(order.id, 'READY')} className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition">Готов</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
