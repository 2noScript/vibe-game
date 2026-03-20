export abstract class BaseEntity {
  public abstract init(): void;
  public abstract load(): void;
  public abstract update(dt: number): void;
  public abstract draw(ctx: CanvasRenderingContext2D): void;
  public abstract destroy(): void;
}
