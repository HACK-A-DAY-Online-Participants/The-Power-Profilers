// lsp-server/src/lspTypes.ts
export interface CompileResult {
  stdout?: string;
  stderr?: string;
  return_code?: number;
  duration_s?: number;
  energy_j?: number;
  error?: string;
}
