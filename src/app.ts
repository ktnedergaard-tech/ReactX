export type ScreenName =
  | 'home'
  | 'solo-settings'
  | 'solo-run'
  | 'pair-home'
  | 'pair-lobby'
  | 'pair-run'
  | 'ideas';

export interface Nav {
  go: (screen: ScreenName) => void;
}

type Renderer = (root: HTMLElement, nav: Nav) => void | (() => void);

/** Minimal router: viser præcis én skærm ad gangen og rydder pænt op efter sig. */
export class App implements Nav {
  private cleanup: (() => void) | void = undefined;
  private renderers = new Map<ScreenName, Renderer>();

  constructor(private root: HTMLElement) {}

  register(name: ScreenName, renderer: Renderer): void {
    this.renderers.set(name, renderer);
  }

  go(screen: ScreenName): void {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = undefined;
    }
    const renderer = this.renderers.get(screen);
    if (!renderer) throw new Error(`Ukendt skærm: ${screen}`);
    this.cleanup = renderer(this.root, this) ?? undefined;
  }
}
