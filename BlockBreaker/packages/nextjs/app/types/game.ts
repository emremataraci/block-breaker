export interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  isVisible: boolean;
  hits: number;
  breaking?: boolean;
  breakingProgress?: number;
}