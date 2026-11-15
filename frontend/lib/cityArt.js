// Per-city look used for cards and the hero strip. Drawn in SVG, no external images needed.
export const CITY_ART = {
  lucknow:   { sky: ["#606060", "#949494"], ground: "#4a4a4a", motif: "river" },
  jaisalmer: { sky: ["#626262", "#c1c1c1"], ground: "#4e4e4e", motif: "dunes" },
  kochi:     { sky: ["#3f3f3f", "#767676"], ground: "#3d3d3d", motif: "palms" },
  shimla:    { sky: ["#3a3a3a", "#9c9c9c"], ground: "#282828", motif: "peaks" },
  leh:       { sky: ["#3f3f3f", "#bebebe"], ground: "#d4d4d4", motif: "ranges" },
};

export const CITY_BLURB = {
  lucknow: "Humid subtropical plains on the Gangetic river. Strong monsoon rains each summer.",
  jaisalmer: "Hot Thar desert in Rajasthan. Very dry, with large temperature swings.",
  kochi: "Tropical coast in Kerala. Warm all year and very wet during the monsoon.",
  shimla: "Himalayan hill station at about 2,200 m. Cooler, with snow in winter.",
  leh: "Cold, high-altitude desert in Ladakh at about 3,500 m. Very little rain.",
};
