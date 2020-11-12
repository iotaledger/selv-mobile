copy({
	targets: [{
		src: 'node_modules/iota-identity-wasm-test/web/iota_identity_wasm_bg.wasm',
		dest: 'public',
		rename: 'iota_identity_wasm_bg.wasm'
	}]
})