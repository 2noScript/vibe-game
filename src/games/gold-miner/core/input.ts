export class InputManager {
  private keys: Set<string> = new Set();
  private isMouseDown: boolean = false;
  
  constructor() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('touchstart', this.handleTouchStart);
    window.addEventListener('touchend', this.handleTouchEnd);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys.add(e.code);
  }

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  }

  private handleMouseDown = () => {
    this.isMouseDown = true;
  }

  private handleMouseUp = () => {
    this.isMouseDown = false;
  }

  private handleTouchStart = () => {
    this.isMouseDown = true;
  }

  private handleTouchEnd = () => {
    this.isMouseDown = false;
  }

  public isPressed(code: string): boolean {
    return this.keys.has(code);
  }

  public isActionPressed(): boolean {
    return this.keys.has('Space') || this.keys.has('ArrowDown') || this.isMouseDown;
  }

  public destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('touchend', this.handleTouchEnd);
  }
}
