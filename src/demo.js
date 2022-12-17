"use strict";

import * as Label from "./label.js";

import * as languageLabel from "./js/language_label.js";

import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import * as search from "./search.js";

import SampleControl from "openmapsamples-maplibre/OpenMapSamplesControl.js";
import { default as OpenMapTilesSamples } from "openmapsamples/samples/OpenMapTiles/index.js";

function buildStyle() {
  var getUrl = window.location;
  var baseUrl = getUrl.protocol + "//" + getUrl.host + getUrl.pathname;

  return {
    id: "streets",
    name: "OpenMapTiles OpenStreetMap Style",
    glyphs:
      "https://openhistoricalmap.github.io/map-styles/fonts/{fontstack}/{range}.pbf",
    style: style.json,
    sources: {
      openmaptiles: {
        url: "https://6ug7hetxl9.execute-api.us-east-2.amazonaws.com/data/v3.json",
        type: "vector",
      },
    },
    sprite: new URL("sprites/sprite", baseUrl).href,
    light: {
      anchor: "viewport",
      color: "white",
      intensity: 0.12,
    },
    version: 8,
  };
}

function upgradeLegacyHash() {
  let hash = window.location.hash.substr(1);
  if (!hash.includes("=")) {
    hash = `#map=${hash}`;
  }
  window.location.hash = hash;
}
upgradeLegacyHash();

maplibregl.setRTLTextPlugin(
  "https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js",
  null,
  true
);

window.maplibregl = maplibregl;
export const map = (window.map = new maplibregl.Map({
  container: "map", // container id
  hash: "map",
  antialias: true,
  style: buildStyle(),
  center: [-94, 40.5], // starting position [lng, lat]
  zoom: 4, // starting zoom
  attributionControl: false,
}));

window.addEventListener("languagechange", (event) => {
  console.log(`Changed to ${navigator.languages}`);
  map.setStyle(buildStyle());
  languageLabel.displayLocales(Label.getLocales());
});

window.addEventListener("hashchange", (event) => {
  upgradeLegacyHash();
  let oldLanguage = Label.getLanguageFromURL(new URL(event.oldURL));
  let newLanguage = Label.getLanguageFromURL(new URL(event.newURL));
  if (oldLanguage !== newLanguage) {
    console.log(`Changed to ${newLanguage}`);
    map.setStyle(buildStyle());
    languageLabel.displayLocales(Label.getLocales());
  }
});

let attributionConfig = {
  customAttribution: "",
};

map.addControl(new maplibregl.AttributionControl(attributionConfig));
map.addControl(languageLabel.label, "bottom-right");

map.addControl(new search.PhotonSearchControl(), "top-left");
map.addControl(new maplibregl.NavigationControl(), "top-left");

// Add our sample data.
let sampleControl = new SampleControl({ permalinks: true });
OpenMapTilesSamples.forEach((sample, i) => {
  sampleControl.addSample(sample);
});
map.addControl(sampleControl, "bottom-left");

map.getCanvas().focus();

languageLabel.displayLocales(Label.getLocales());
