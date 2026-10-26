import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import {
  Users, UserPlus, Pencil, Trash2, Shield, X, Check,
  Eye, EyeOff, AlertTriangle, Mail, User, Lock, ChevronDown
} from 'lucide-react'

const ROLES = [
  'Senior Audit Partner',
  'Audit Manager',
  'Senior Auditor',
  'Staff Auditor',
  'Bookkeeper',
  'View Only',
]

const ROLE_BADGE = {
  'Senior Audit Partner': 'bg-indigo-100 text-indigo-700',
  'Audit Manager': 'bg-violet-100 text-violet-700',
  'Senior Auditor': 'bg-sky-100 text-sky-700',
  'Staff Auditor': 'bg-teal-100 text-teal-700',
  'Bookkeeper': 'bg-amber-100 text-amber-700',
  'View Only': 'bg-slate-100 text-slate-600',
}

const EMPTY_FORM = { name: '', email: '', password: '', role: 'Staff Auditor' }

function UserFormModal({ title, initial = EMPTY_FORM, onSave, onClose, isEdit = false }) {
  const [form, setForm] = useState(initial)
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) return setError('Full name is required.')
    if (!form.email.trim()) return setError('Email address is required.')
    if (!isEdit && !form.password.trim()) return setError('Password is required for new users.')
    if (form.password && form.password.length < 6) return setError('Password must be at least 6 characters.')
    const result = onSave(form)
    if (result && !result.ok) setError(result.error)
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <UserPlus size={17} className="text-indigo-600" />
            <span className="font-bold text-sm text-slate-800">{title}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. John Smith (CA/SA)"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="auditor@pfconsultants.co.za"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password {isEdit && <span className="font-normal text-slate-400">(leave blank to keep current)</span>}
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder={isEdit ? '(unchanged)' : 'min. 6 characters'}
                className="w-full pl-9 pr-9 py-2 border border-slate-300 rounded-md text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role</label>
            <div className="relative">
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={form.role}
                onChange={e => set('role', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs appearance-none focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white"
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-xs">
              <AlertTriangle size={13} />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check size={13} />
              {isEdit ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirmModal({ user, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
            <Trash2 size={16} className="text-rose-600" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Remove User Account</h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to remove <strong>{user.name}</strong> ({user.email})?
              This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-semibold transition-colors cursor-pointer"
          >
            Remove User
          </button>
        </div>
      </div>
    </div>
  )
}

export default function UserManagement() {
  const users = useAuthStore(s => s.users)
  const currentUser = useAuthStore(s => s.user)
  const addUser = useAuthStore(s => s.addUser)
  const updateUser = useAuthStore(s => s.updateUser)
  const deleteUser = useAuthStore(s => s.deleteUser)

  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState(null)   // user object
  const [deleteTarget, setDeleteTarget] = useState(null) // user object
  const [toast, setToast] = useState(null)

  const isAdmin = currentUser?.isAdmin || currentUser?.role === 'Senior Audit Partner'

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAdd = (form) => {
    const result = addUser(form)
    if (result.ok) {
      setShowAdd(false)
      showToast(`User "${form.name}" created successfully.`)
    }
    return result
  }

  const handleEdit = (form) => {
    // Only send password if it was changed
    const fields = { name: form.name, email: form.email, role: form.role }
    if (form.password) fields.password = form.password
    const result = updateUser(editTarget.id, fields)
    if (result.ok) {
      setEditTarget(null)
      showToast(`User "${form.name}" updated successfully.`)
    }
    return result
  }

  const handleDelete = () => {
    const result = deleteUser(deleteTarget.id)
    if (result.ok) {
      showToast(`User "${deleteTarget.name}" removed.`, 'info')
      setDeleteTarget(null)
    } else {
      showToast(result.error, 'error')
      setDeleteTarget(null)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Users size={18} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">User Management</h1>
            <p className="text-xs text-slate-500">
              Manage practitioner access, roles, and credentials
            </p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <UserPlus size={14} />
            Add User
          </button>
        )}
      </div>

      {/* Non-admin notice */}
      {!isAdmin && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs">
          <AlertTriangle size={14} />
          You have read-only access to this section. Only Senior Audit Partners can add, edit, or remove users.
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: users.length, color: 'text-indigo-600' },
          { label: 'Administrators', value: users.filter(u => u.isAdmin).length, color: 'text-violet-600' },
          { label: 'Active Roles', value: new Set(users.map(u => u.role)).size, color: 'text-teal-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-lg p-4 text-center shadow-xs">
            <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
          <Shield size={14} className="text-indigo-500" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Registered Practice Users
          </span>
          <span className="ml-auto text-[11px] text-slate-400">{users.length} user{users.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="divide-y divide-slate-100">
          {users.map(u => (
            <div
              key={u.id}
              className={`flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors ${u.id === currentUser?.id ? 'bg-indigo-50/40' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${u.isAdmin ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-slate-900 truncate">{u.name}</span>
                  {u.id === currentUser?.id && (
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-semibold">You</span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 font-mono">{u.email}</span>
              </div>

              {/* Role badge */}
              <span className={`hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded font-bold ${ROLE_BADGE[u.role] ?? 'bg-slate-100 text-slate-600'}`}>
                {u.role}
              </span>

              {/* Admin indicator */}
              {u.isAdmin && (
                <Shield size={13} className="text-indigo-500 shrink-0" title="Administrator" />
              )}

              {/* Created date */}
              <span className="hidden lg:block text-[11px] text-slate-400 shrink-0">
                {new Date(u.createdAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>

              {/* Actions */}
              {isAdmin && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setEditTarget(u)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                    title="Edit user"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(u)}
                    disabled={u.id === currentUser?.id}
                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title={u.id === currentUser?.id ? 'Cannot delete your own account' : 'Remove user'}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Role Legend */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">Role Permissions Guide</p>
        <div className="flex flex-wrap gap-2">
          {ROLES.map(r => (
            <span key={r} className={`text-[10px] font-semibold px-2.5 py-1 rounded ${ROLE_BADGE[r] ?? 'bg-slate-100 text-slate-600'}`}>
              {r}
            </span>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-2">
          Senior Audit Partners have full administrative access including user management. All other roles have standard read/write access to their assigned modules.
        </p>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────── */}
      {showAdd && (
        <UserFormModal
          title="Create New User"
          onSave={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}

      {editTarget && (
        <UserFormModal
          title="Edit User Account"
          initial={{ name: editTarget.name, email: editTarget.email, password: '', role: editTarget.role }}
          onSave={handleEdit}
          onClose={() => setEditTarget(null)}
          isEdit
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          user={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold text-white transition-all ${
          toast.type === 'error' ? 'bg-rose-600' : toast.type === 'info' ? 'bg-slate-700' : 'bg-emerald-600'
        }`}>
          <Check size={13} />
          {toast.msg}
        </div>
      )}
    </div>
  )
}
