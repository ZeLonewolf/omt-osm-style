import { copyFile, mkdir } from "fs/promises";

import pkg from 'fs-extra';
const { copySync } = pkg;

import esbuild from "esbuild";



const isMain =
  import.meta.url === new URL(`file://${process.argv[1]}`).toString();

export async function build(updateHook, buildOptions = {}) {
  const watch = updateHook && {
    onRebuild(error, result) {
      if (error) {
        return;
      }
      updateHook();
    },
  };

  await mkdir("dist", { recursive: true });
  await mkdir("dist/sprite/", { recursive: true });

  return await Promise.all([
    esbuild.build({
      entryPoints: ["src/demo.js"],
      format: "esm",
      bundle: true,
      minify: true,
      sourcemap: true,
      outdir: "dist",
      watch,
      logLevel: "info",
      ...buildOptions,
    }),
    copyFile("src/index.html", "dist/index.html"),
    copyFile("src/style.json", "dist/style.json"),
    copyFile("src/sprites/sprite@2x.json", "dist/sprite/sprite@2x.json"),
    copyFile("src/sprites/sprite.json", "dist/sprite/sprite.json"),
    copyFile("src/sprites/sprite@2x.png", "dist/sprite/sprite@2x.png"),
    copyFile("src/sprites/sprite.png", "dist/sprite/sprite.png"),

    copySync("fonts", "dist/", { overwrite: true }),
    copySync("dist/Noto Sans Regular", "dist/Noto Sans Regular,Noto Sans Bold", { overwrite: true }),
    copySync("dist/Noto Sans Regular", "dist/Noto Sans Regular,Noto Sans Italic", { overwrite: true }),
    copySync("dist/Noto Sans Bold", "dist/Noto Sans Bold,Noto Sans Regular", { overwrite: true }),
    copySync("dist/Noto Sans Italic", "dist/Noto Sans Italic,Noto Sans Regular", { overwrite: true }),
  ]);
}

if (isMain) {
  await build().catch(() => process.exit(1));
}
