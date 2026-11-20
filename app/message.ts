export const MESSAGE = "哦！原来你也在这里 :)";

// Google Fonts can serve only the glyphs we use, so the font download is a
// few KB instead of several MB for a full Chinese font.
export const FONT_FAMILY = "ZCOOL KuaiLe";
export const FONT_URL = `https://fonts.googleapis.com/css2?family=${FONT_FAMILY.replace(
  / /g,
  "+"
)}&display=swap&text=${encodeURIComponent(MESSAGE)}`;
