declare module "*.ttf" {
  const fontData: ArrayBuffer;
  export default fontData;
}

declare module "*.wasm" {
  const wasmModule: WebAssembly.Module;
  export default wasmModule;
}
