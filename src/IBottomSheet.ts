export interface IBottomSheetConfig {
  items: Record<string, IBottomSheetItemOptions>;
}

export interface IBottomSheetItemOptions {
  name: string;
  visibleHeightList: Array<number | string>;
  visibleHeight: number | string;
}

export interface IBottomSheetItemParams extends IBottomSheetItemOptions{
  visibleHeightList: Array<number>;
  visibleHeight: number;
  height: number;
  width: number;
}
