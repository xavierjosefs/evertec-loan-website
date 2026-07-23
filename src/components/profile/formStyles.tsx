export function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="mt-1.5 text-xs font-medium text-rose-600">{message}</p>;
}

export function RequiredMark() {
  return <span className="text-rose-500" aria-label="obligatorio"> *</span>;
}
