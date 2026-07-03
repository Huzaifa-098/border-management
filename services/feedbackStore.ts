export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

type Listener = () => void;

let loadingCount = 0;
let loadingMessage = 'Please wait...';
const toasts: ToastItem[] = [];
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((fn) => fn());
}

export function subscribeFeedback(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getLoadingState() {
  return { active: loadingCount > 0, message: loadingMessage };
}

export function getToasts() {
  return [...toasts];
}

export function startLoading(message = 'Please wait...') {
  loadingMessage = message;
  loadingCount += 1;
  notify();
}

export function stopLoading() {
  loadingCount = Math.max(0, loadingCount - 1);
  notify();
}

export function pushToast(type: ToastType, message: string, duration = 4500) {
  const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  toasts.push({ id, type, message, duration });
  notify();
  setTimeout(() => {
    const idx = toasts.findIndex((t) => t.id === id);
    if (idx >= 0) {
      toasts.splice(idx, 1);
      notify();
    }
  }, duration);
}

export function dismissToast(id: string) {
  const idx = toasts.findIndex((t) => t.id === id);
  if (idx >= 0) {
    toasts.splice(idx, 1);
    notify();
  }
}

export function parseApiError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'string' && err.trim()) return err;
  if (err && typeof err === 'object' && 'error' in err) {
    const msg = (err as { error?: unknown }).error;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  return fallback;
}

export function parseApiSuccess(data: unknown, method = 'GET'): string | null {
  if (method === 'GET' || method === 'HEAD') return null;
  if (!data || typeof data !== 'object') {
    return method === 'DELETE' ? 'Deleted successfully.' : null;
  }

  const d = data as Record<string, unknown>;
  if (typeof d.message === 'string' && d.message.trim()) return d.message;

  const admin = d.admin as Record<string, unknown> | undefined;
  if (admin) {
    if (method === 'DELETE') return 'City administrator deleted.';
    if (method === 'POST') return 'City administrator created successfully.';
    if (admin.status === 'INACTIVE') return 'Administrator deactivated successfully.';
    if (admin.status === 'ACTIVE') return 'Administrator activated successfully.';
    return 'Administrator updated successfully.';
  }

  const user = d.user as Record<string, unknown> | undefined;
  if (user) {
    if (method === 'DELETE') return 'User deleted successfully.';
    if (method === 'POST') return 'User created successfully.';
    if (user.status === 'INACTIVE') return 'User deactivated successfully.';
    if (user.status === 'ACTIVE') return 'User activated successfully.';
    return 'User updated successfully.';
  }

  const entry = d.entry as Record<string, unknown> | undefined;
  if (entry) {
    if (entry.status === 'APPROVED') return 'Entry approved successfully.';
    if (entry.status === 'REJECTED') return 'Entry rejected.';
    if (entry.status === 'RETURNED') return 'Entry returned for revision.';
    if (entry.status === 'PENDING_SUPER') return 'Entry forwarded for super admin review.';
    return 'Entry updated successfully.';
  }

  if (d.blacklist) return 'Added to blacklist successfully.';
  if (d.incident) return 'Incident saved successfully.';
  if (d.trip) return 'Trip updated successfully.';
  if (d.broadcast || d.broadcasts) return 'Broadcast sent successfully.';
  if (d.alert || d.alerts) return 'Emergency alert sent.';
  if (d.token) return 'Signed in successfully.';
  if (d.success === true) {
    if (method === 'DELETE') return 'Deleted successfully.';
    return 'Operation completed successfully.';
  }

  if (method === 'POST') return 'Created successfully.';
  if (method === 'PATCH') return 'Updated successfully.';
  if (method === 'DELETE') return 'Deleted successfully.';
  return null;
}

export interface RunApiOptions {
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  silent?: boolean;
  showSuccess?: boolean;
  showError?: boolean;
  withLoading?: boolean;
}

export async function runApi<T>(
  fn: () => Promise<T>,
  options: RunApiOptions = {}
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  const {
    loadingMessage = 'Please wait...',
    successMessage,
    errorMessage,
    silent = false,
    showSuccess = true,
    showError = true,
    withLoading = true,
  } = options;

  if (withLoading) startLoading(loadingMessage);
  try {
    const data = await fn();
    if (!silent && showSuccess) {
      const msg = successMessage ?? parseApiSuccess(data, 'PATCH');
      if (msg) pushToast('success', msg);
    }
    return { success: true, data };
  } catch (err) {
    const msg = errorMessage ?? parseApiError(err);
    if (!silent && showError) pushToast('error', msg);
    return { success: false, error: msg };
  } finally {
    if (withLoading) stopLoading();
  }
}
