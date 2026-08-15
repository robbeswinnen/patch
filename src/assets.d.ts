declare module '*.ttf' {
	const fontData: ArrayBuffer;
	export default fontData;
}

declare module '*.wasm' {
	const wasmModule: WebAssembly.Module;
	export default wasmModule;
}

declare module '*.png' {
	const imageData: ArrayBuffer;
	export default imageData;
}

declare module '*.jpg' {
	const imageData: ArrayBuffer;
	export default imageData;
}

declare module '*.css' {
	const text: string;
	export default text;
}

declare module '*.client.js' {
	const text: string;
	export default text;
}
