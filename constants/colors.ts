const palette = {
  near_black: "#141414",
  gray: "#1E1E1E",
  white: "#F5F0E8",
  light_gray: "#888888",
  dark_gray: "#3E3E3E",
  red: "#E05C5C",
  blue: "#3ea2d8",
  green: "#07c46c",
};

export const colors = {
  primary_background: palette.gray,
  secondary_backgorund: palette.dark_gray,
  bright_red_offset: palette.red,
  white_contrast: palette.white,
};

export type Colors = typeof colors;
