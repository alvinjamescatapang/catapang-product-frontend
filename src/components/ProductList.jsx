import { useCallback, useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowUpRight, Boxes, CircleUserRound, LayoutDashboard, LogOut, PackageCheck, Pencil, Plus, Search, ShieldCheck, Trash2, Warehouse } from 'lucide-react';
import { getProducts, deleteProduct, errorMessage } from '../api.js';
import ProductForm from './ProductForm.jsx';

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
const dateFormat = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

export default function ProductList({ user, onLogout }) {
  const canManageProducts = user.role === 'admin';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [formFor, setFormFor] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await getProducts());
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.product_name}"?`)) return;
    try {
      await deleteProduct(product.id);
      setNotice('Product removed from your inventory.');
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleSaved = (message) => {
    setFormFor(null);
    setNotice(message);
    load();
  };

  const filteredProducts = products.filter((product) => {
    const searchText = `${product.product_name} ${product.description ?? ''}`.toLowerCase();
    return searchText.includes(query.trim().toLowerCase());
  });
  const totalUnits = products.reduce((total, product) => total + Number(product.quantity || 0), 0);
  const stockValue = products.reduce((total, product) => total + Number(product.price || 0) * Number(product.quantity || 0), 0);
  const lowStock = products.filter((product) => Number(product.quantity || 0) <= 5).length;

  return (
    <div className="workspace">
      <aside className="sidebar" aria-label="Main navigation">
        <a className="brand" href="#inventory" aria-label="Form and Field home">
          <span className="brand-mark"><Warehouse size={20} strokeWidth={2.2} /></span>
          <span className="brand-name">form<span>&</span>field</span>
        </a>
        <div className="sidebar-caption">Workspace</div>
        <nav className="side-nav">
          <a className="nav-item active" href="#inventory"><LayoutDashboard size={17} /><span>Overview</span></a>
          <a className="nav-item" href="#inventory-table"><Boxes size={17} /><span>Inventory</span><span className="nav-count">{products.length}</span></a>
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-note"><span className="note-icon"><PackageCheck size={17} /></span><span><strong>Stockroom</strong><small>Product catalog</small></span><ArrowUpRight className="note-arrow" size={15} /></div>
        <div className="sidebar-user">
          <span className="avatar">{user.username?.slice(0, 1).toUpperCase() || 'U'}</span>
          <span className="user-copy"><strong>{user.username}</strong><small>{canManageProducts ? 'Administrator' : 'Viewer'}</small></span>
          <button className="icon-button sidebar-logout" onClick={onLogout} title="Sign out" aria-label="Sign out"><LogOut size={17} /></button>
        </div>
      </aside>

      <main className="main-panel" id="inventory">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>Overview</strong></div>
          <div className="topbar-actions"><span className="sync-status"><span className="live-dot" /> Live inventory</span><span className="topbar-divider" /><span className="topbar-date">{dateFormat.format(new Date())}</span><span className="topbar-avatar"><CircleUserRound size={19} /></span></div>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div><div className="eyebrow"><span className="eyebrow-line" /> STOCKROOM / 01</div><h1>Inventory <span>overview</span></h1><p>A clear view of what’s on your shelves.</p></div>
            {canManageProducts && <button className="button-primary" onClick={() => setFormFor({})}><Plus size={17} /> Add product</button>}
          </section>

          {error && <div className="alert error" role="alert">{error}</div>}
          {notice && <div className="alert success" role="status" onClick={() => setNotice('')}>{notice}<button aria-label="Dismiss notification">×</button></div>}

          <section className="stats-grid" aria-label="Inventory summary">
            <article className="stat-panel"><div className="stat-top"><span>Catalog items</span><span className="stat-icon coral"><Boxes size={17} /></span></div><div className="stat-number">{loading ? '—' : products.length.toString().padStart(2, '0')}</div><div className="stat-foot"><span className="stat-marker" /> Tracked products</div></article>
            <article className="stat-panel"><div className="stat-top"><span>Units in stock</span><span className="stat-icon green"><PackageCheck size={17} /></span></div><div className="stat-number">{loading ? '—' : totalUnits.toLocaleString('en-PH')}</div><div className="stat-foot"><span className="stat-marker green-marker" /> Across all products</div></article>
            <article className="stat-panel"><div className="stat-top"><span>Stock value</span><span className="stat-icon yellow"><ArrowUpRight size={17} /></span></div><div className="stat-number stat-currency">{loading ? '—' : peso.format(stockValue)}</div><div className="stat-foot"><span className="stat-marker yellow-marker" /> Retail value on hand</div></article>
            <article className="stat-panel"><div className="stat-top"><span>Low stock</span><span className="stat-icon red"><ArrowDownToLine size={17} /></span></div><div className="stat-number">{loading ? '—' : lowStock.toString().padStart(2, '0')}</div><div className="stat-foot"><span className="stat-marker red-marker" /> Five units or fewer</div></article>
          </section>

          <section className="inventory-section" id="inventory-table">
            <div className="section-heading">
              <div><div className="section-kicker">YOUR CATALOG</div><h2>Product list <span className="result-count">{products.length}</span></h2></div>
              <label className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" aria-label="Search products" /><kbd>/</kbd></label>
            </div>
            <div className="table-shell">
              <div className="table-scroll">
                <table className="inventory-table">
                  <thead><tr><th className="product-col">Product</th><th>Description</th><th className="align-right">Unit price</th><th className="align-right">In stock</th><th>Stock status</th>{canManageProducts && <th className="actions-heading">Actions</th>}</tr></thead>
                  <tbody>
                    {loading ? <tr><td colSpan={canManageProducts ? 6 : 5} className="table-message">Loading inventory…</td></tr> : filteredProducts.length === 0 ? <tr><td colSpan={canManageProducts ? 6 : 5} className="table-message">{query ? 'No products match that search.' : 'Your inventory is empty.'}</td></tr> : filteredProducts.map((product, index) => {
                      const quantity = Number(product.quantity || 0);
                      const stockStatus = quantity <= 5 ? 'low' : quantity <= 15 ? 'watch' : 'healthy';
                      return <tr key={product.id}>
                        <td><div className="product-cell"><span className={`product-swatch swatch-${index % 4}`}><PackageCheck size={16} /></span><span><strong>{product.product_name}</strong><small>SKU-{String(product.id).padStart(4, '0')}</small></span></div></td>
                        <td className="description-cell">{product.description || <span className="no-description">No description</span>}</td>
                        <td className="align-right price-cell">{peso.format(product.price)}</td>
                        <td className="align-right quantity-cell">{quantity}<span> units</span></td>
                        <td><span className={`stock-pill ${stockStatus}`}><span />{stockStatus === 'low' ? 'Low stock' : stockStatus === 'watch' ? 'Restock soon' : 'In stock'}</span></td>
                        {canManageProducts && <td className="row-actions"><button className="icon-button" onClick={() => setFormFor(product)} title={`Edit ${product.product_name}`} aria-label={`Edit ${product.product_name}`}><Pencil size={16} /></button><button className="icon-button delete-button" onClick={() => handleDelete(product)} title={`Delete ${product.product_name}`} aria-label={`Delete ${product.product_name}`}><Trash2 size={16} /></button></td>}
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mobile-product-list">
                {loading ? <p className="table-message">Loading inventory…</p> : filteredProducts.length === 0 ? <p className="table-message">{query ? 'No products match that search.' : 'Your inventory is empty.'}</p> : filteredProducts.map((product, index) => {
                  const quantity = Number(product.quantity || 0);
                  const stockStatus = quantity <= 5 ? 'low' : quantity <= 15 ? 'watch' : 'healthy';
                  return <article className="mobile-product" key={`mobile-${product.id}`}>
                    <div className="mobile-product-heading">
                      <div className="product-cell"><span className={`product-swatch swatch-${index % 4}`}><PackageCheck size={16} /></span><span><strong>{product.product_name}</strong><small>SKU-{String(product.id).padStart(4, '0')}</small></span></div>
                      <span className={`stock-pill ${stockStatus}`}><span />{stockStatus === 'low' ? 'Low stock' : stockStatus === 'watch' ? 'Restock soon' : 'In stock'}</span>
                    </div>
                    <p className="mobile-description">{product.description || 'No description'}</p>
                    <div className="mobile-product-details"><span><small>UNIT PRICE</small><strong>{peso.format(product.price)}</strong></span><span><small>ON HAND</small><strong>{quantity} units</strong></span></div>
                    {canManageProducts && <div className="mobile-product-actions"><button className="button-quiet" onClick={() => setFormFor(product)}><Pencil size={14} /> Edit</button><button className="button-quiet mobile-delete" onClick={() => handleDelete(product)}><Trash2 size={14} /> Delete</button></div>}
                  </article>;
                })}
              </div>
              <footer className="table-footer"><span>Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products</span><span className="table-footer-role"><ShieldCheck size={14} /> {canManageProducts ? 'Full access' : 'View-only access'}</span></footer>
            </div>
          </section>
          <footer className="page-footer"><span>FORM & FIELD <i>•</i> STOCKROOM</span><span>INVENTORY DESK / 2026</span></footer>
        </div>
      </main>

      {canManageProducts && formFor && <ProductForm product={formFor.id ? formFor : null} onSaved={handleSaved} onCancel={() => setFormFor(null)} />}
    </div>
  );
}