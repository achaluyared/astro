/**
 * GLightbox is CJS; Vite dev can emit broken default-import interop.
 * Use this factory in client scripts only.
 */
// @ts-expect-error glightbox ships CJS without reliable ESM default
import * as GLightboxModule from 'glightbox';

type GLightboxFactory = (options: Record<string, unknown>) => {
  openAt: (index: number) => void;
  on: (event: string, fn: () => void) => void;
  destroy: () => void;
};

const GLightbox = (
  (GLightboxModule as { default?: GLightboxFactory }).default ??
  (GLightboxModule as unknown as GLightboxFactory)
) as GLightboxFactory;

export default GLightbox;

export type GLightboxInstance = ReturnType<GLightboxFactory>;
