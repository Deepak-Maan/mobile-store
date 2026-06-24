import React from 'react';
import { useStore } from '../../context/StoreContext';

export const OrdersTab = () => {
  const { orders, changeOrderStatus } = useStore();

  // Show newest orders first
  const sortedOrders = [...orders].reverse();

  return (
    <div className="admin-panel active" id="admin-panel-orders">
      <div className="admin-panel-header">
        <div className="admin-panel-title">
          <h2>Customer Purchase Orders</h2>
          <p>Monitor customer purchases, delivery addresses, and change shipment states.</p>
        </div>
      </div>

      <div className="table-responsive">
        <table className="admin-table" id="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer Name</th>
              <th>Purchased Items</th>
              <th>Date Placed</th>
              <th>Total Amount</th>
              <th>Shipment Status</th>
            </tr>
          </thead>
          <tbody id="orders-table-body">
            {sortedOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center" style={{ color: 'var(--text-muted)', padding: '3rem' }}>
                  No orders have been placed yet. Go to storefront and make purchases to see them here!
                </td>
              </tr>
            ) : (
              sortedOrders.map((order) => {
                const itemsSummary = order.items.map((item) => 
                  `${item.name} (x${item.quantity})`
                ).join(', ');

                return (
                  <tr key={order.id} id={`order-row-${order.id}`}>
                    <td>
                      <strong style={{ color: '#fff', fontFamily: 'var(--font-display)' }}>{order.id}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{order.customerName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{order.email}</div>
                      <div style={{ marginTop: '0.25rem', fontSize: '0.78rem' }}>
                        {order.paymentMethod === 'upi' ? (
                          <span style={{ color: '#a5b4fc', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '0.15rem 0.4rem', borderRadius: '4px', display: 'inline-block' }}>
                            UPI UTR: <code style={{ color: '#fff', fontFamily: 'monospace', fontWeight: 600 }}>{order.utrNumber}</code>
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Card Payment</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="order-items-tooltip" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={itemsSummary}>
                        {itemsSummary}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem' }}>{order.date}</span>
                    </td>
                    <td>
                      <strong style={{ color: '#fff' }}>${order.total.toLocaleString()}</strong>
                    </td>
                    <td>
                      <div className="flex align-center gap-05">
                        <select
                          className="order-status-select"
                          value={order.status}
                          onChange={(e) => changeOrderStatus(order.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
