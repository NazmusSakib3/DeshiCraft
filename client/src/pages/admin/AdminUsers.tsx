import { useState } from 'react';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Ban, ShieldCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '../../lib/api';
import { formatDate } from '../../lib/format';
import { DashboardNav } from '../../components/DashboardNav';
import { PageLoader } from '../../components/Spinner';
import { useAuthStore } from '../../store/authStore';
import { adminTabs } from './adminTabs';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isBlocked?: boolean;
  blockReason?: string;
  createdAt: string;
}

interface UsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}

const roleFilters = ['', 'customer', 'seller', 'admin'];
const statusFilters = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'blocked', label: 'Blocked' },
];

export default function AdminUsers() {
  const currentUser = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', role, status, page],
    queryFn: async () => {
      const { data } = await api.get<UsersResponse>('/admin/users', {
        params: { role, status, page },
      });
      return data;
    },
    placeholderData: keepPreviousData,
  });

  const blockUser = useMutation({
    mutationFn: async ({ id, blocked, reason }: { id: string; blocked: boolean; reason?: string }) =>
      api.patch(`/admin/users/${id}/block`, { blocked, reason }),
    onSuccess: (_res, vars) => {
      toast.success(vars.blocked ? 'User blocked' : 'User unblocked');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  const removeUser = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      toast.success('User removed');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  const handleBlock = (user: AdminUser) => {
    const reason = window.prompt(
      `Reason for blocking ${user.name}? (optional)`,
      'Violated community guidelines',
    );
    if (reason === null) return;
    blockUser.mutate({ id: user._id, blocked: true, reason: reason || undefined });
  };

  const handleDelete = (user: AdminUser) => {
    if (
      !window.confirm(
        `Permanently remove ${user.name} (${user.email})? This cannot be undone. Their products will be deleted.`,
      )
    ) {
      return;
    }
    removeUser.mutate(user._id);
  };

  const canModerate = (user: AdminUser) =>
    user.role !== 'admin' && user._id !== currentUser?.id;

  return (
    <div className="container-page py-10">
      <DashboardNav title="Admin dashboard" tabs={adminTabs} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-ink">Users {data && `(${data.total})`}</h2>
        <div className="flex flex-wrap gap-2">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="input max-w-[160px]"
          >
            {statusFilters.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="input max-w-[160px]"
          >
            {roleFilters.map((r) => (
              <option key={r} value={r}>
                {r ? r[0].toUpperCase() + r.slice(1) + 's' : 'All roles'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-ink/8 bg-white">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-paper text-left text-ink/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {(data?.users ?? []).map((u) => (
                  <tr key={u._id}>
                    <td className="px-4 py-3 font-medium text-ink">{u.name}</td>
                    <td className="px-4 py-3 text-ink/60">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="badge bg-forest-50 capitalize text-forest-600">{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      {u.isBlocked ? (
                        <span
                          className="badge bg-clay-100 text-clay-600"
                          title={u.blockReason ?? 'Blocked'}
                        >
                          Blocked
                        </span>
                      ) : (
                        <span className="badge bg-forest-100 text-forest-600">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink/50">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {canModerate(u) ? (
                          <>
                            {u.isBlocked ? (
                              <button
                                onClick={() => blockUser.mutate({ id: u._id, blocked: false })}
                                disabled={blockUser.isPending}
                                className="btn-ghost !px-2 text-forest-600"
                                title="Unblock user"
                              >
                                <ShieldCheck className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBlock(u)}
                                disabled={blockUser.isPending}
                                className="btn-ghost !px-2 text-brass-500"
                                title="Block user"
                              >
                                <Ban className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(u)}
                              disabled={removeUser.isPending}
                              className="btn-ghost !px-2 text-clay-600"
                              title="Remove user permanently"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-ink/40">Protected</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-outline">
                Previous
              </button>
              <span className="px-3 text-sm text-ink/60">
                Page {data.page} of {data.totalPages}
              </span>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-outline"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
