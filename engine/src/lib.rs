use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn hello_world(name: &str) -> String {
    format!("Hello, {}!", name)
}
