export function vector(start: Touch, end: Touch): Array<number> {
  return [end.screenX - start.screenX, end.screenY - start.screenY];
}
