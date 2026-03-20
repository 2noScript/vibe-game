export class InputManager {
  public keys: { left: boolean; right: boolean; up: boolean; down: boolean; z: boolean; x: boolean } = {
    left: false,
    right: false,
    up: false,
    down: false,
    z: false,
    x: false,
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') this.keys.left = true;
    if (e.key === 'ArrowRight') this.keys.right = true;
    if (e.key === 'ArrowUp') this.keys.up = true;
    if (e.key === 'ArrowDown') this.keys.down = true;
    if (e.key.toLowerCase() === 'z') this.keys.z = true;
    if (e.key.toLowerCase() === 'x') this.keys.x = true;
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') this.keys.left = false;
    if (e.key === 'ArrowRight') this.keys.right = false;
    if (e.key === 'ArrowUp') this.keys.up = false;
    if (e.key === 'ArrowDown') this.keys.down = false;
    if (e.key.toLowerCase() === 'z') this.keys.z = false;
    if (e.key.toLowerCase() === 'x') this.keys.x = false;
  };

  public init() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  public destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
}
