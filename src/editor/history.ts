export class OpHistory<T> {
  private ops: T[] = [];
  private index = 0;

  get canUndo(): boolean {
    return this.index > 0;
  }

  get canRedo(): boolean {
    return this.index < this.ops.length;
  }

  get cursor(): number {
    return this.index;
  }

  applied(): T[] {
    return this.ops.slice(0, this.index);
  }

  push(op: T): void {
    this.ops = this.ops.slice(0, this.index);
    this.ops.push(op);
    this.index += 1;
  }

  undo(): void {
    if (this.index > 0) this.index -= 1;
  }

  redo(): void {
    if (this.index < this.ops.length) this.index += 1;
  }

  load(ops: T[]): void {
    this.ops = ops.slice();
    this.index = ops.length;
  }
}
