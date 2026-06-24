import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { ProductFormModal } from './ProductFormModal';
import { ProductImage } from '../ProductImage';

export const InventoryTab = () => {
  const { products, deleteProduct } = useStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  const handleOpenAdd = () => {
    setEditingProductId(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (id) => {
    setEditingProductId(id);
    setIsFormOpen(true);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the store database?`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="admin-panel active" id="admin-panel-inventory">
      <div className="admin-panel-header">
        <div className="admin-panel-title">
          <h2>Inventory Stock Manager</h2>
          <p>Oversee, search, edit and restock mobile inventory items.</p>
        </div>
        <button 
          className="hero-btn" 
          id="add-product-modal-btn" 
          style={{ padding: '0.7rem 1.4rem', fontSize: '0.95rem', borderRadius: 'var(--radius-sm)' }}
          onClick={handleOpenAdd}
        >
          <Plus width="16" height="16" strokeWidth={2.5} style={{ marginRight: '0.2rem' }} />
          Add New Device
        </button>
      </div>

      <div className="table-responsive">
        <table className="admin-table" id="inventory-table">
          <thead>
            <tr>
              <th>Device Product</th>
              <th>Base Price</th>
              <th>Current Stock</th>
              <th>Action Commands</th>
            </tr>
          </thead>
          <tbody id="inventory-table-body">
            {products.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center" style={{ color: 'var(--text-muted)', padding: '3rem' }}>
                  No items in inventory. Click "Add New Device" to add smartphones.
                </td>
              </tr>
            ) : (
              products.map((phone) => {
                let stockClass = 'in';
                let statusText = 'In Stock';
                if (phone.stock === 0) {
                  stockClass = 'out';
                  statusText = 'Out of Stock';
                } else if (phone.stock < 5) {
                  stockClass = 'low';
                  statusText = 'Low Stock';
                }

                return (
                  <tr key={phone.id} id={`inventory-row-${phone.id}`}>
                    <td>
                      <div className="table-product-cell">
                        <div className="table-product-img">
                          <ProductImage src={phone.images[0]} alt={phone.name} />
                        </div>
                        <div className="table-product-info">
                          <span className="table-product-name">{phone.name}</span>
                          <span className="table-product-brand">{phone.brand}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>${phone.price.toLocaleString()}</strong>
                    </td>
                    <td>
                      <div className={`stock-indicator ${stockClass}`}>
                        <span className="stock-dot"></span>
                        <span><strong>{phone.stock}</strong> ({statusText})</span>
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="table-btn edit-btn" 
                          title="Edit phone details"
                          onClick={() => handleOpenEdit(phone.id)}
                        >
                          <Edit width="15" height="15" />
                        </button>
                        <button 
                          className="table-btn delete-btn" 
                          title="Delete product"
                          onClick={() => handleDelete(phone.id, phone.name)}
                        >
                          <Trash2 width="15" height="15" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* CRUD Form Modal */}
      <ProductFormModal 
        isOpen={isFormOpen} 
        productId={editingProductId} 
        onClose={() => setIsFormOpen(false)} 
      />
    </div>
  );
};
