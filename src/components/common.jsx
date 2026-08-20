import React from 'react';

export const money = value => `₹${Number(value || 0).toFixed(2)}`;
export const dt = value => value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
export const statusLabel = value => String(value || '').replaceAll('_', ' ');

export function Status({ value }) {
  return <span className={`status ${String(value || '').toLowerCase()}`}>{statusLabel(value)}</span>;
}

export function Empty({ text }) {
  return <div className="empty"><b>{text}</b><span>Nothing to show here yet.</span></div>;
}

export function Head({ title, sub, action }) {
  return <div className="head"><div><h2>{title}</h2><p>{sub}</p></div>{action}</div>;
}

export function Stat({ label, value, note }) {
  return <div className="stat"><small>{label}</small><strong>{value}</strong><span>{note}</span></div>;
}

export function Modal({ title, onClose, children }) {
  return <div className="modal-bg" onMouseDown={onClose}><div className="modal" onMouseDown={event => event.stopPropagation()}><div className="modal-head"><h2>{title}</h2><button onClick={onClose}>×</button></div>{children}</div></div>;
}

export function Field({ label, children }) {
  return <label>{label}{children}</label>;
}

export function Form({ children, onSubmit }) {
  return <form className="form-grid" onSubmit={onSubmit}>{children}</form>;
}
