use std::vec;

use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

const INF: i32 = 1_000_000_000;
const BOARD_WIDTH: usize = 5;
const BOARD_SIZE: usize = BOARD_WIDTH * BOARD_WIDTH;
const MAX_PIECES_PER_PLAYER: usize = 5;
const DX: [isize; 8] = [-1, 0, 1, -1, 1, -1, 0, 1];
const DY: [isize; 8] = [-1, -1, -1, 0, 0, 1, 1, 1];

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
pub enum Piece {
    Empty = 0,
    Player1 = 1,
    Player2 = 2,
}

// Pieceへの変換ヘルパー
impl From<u8> for Piece {
    fn from(value: u8) -> Self {
        match value {
            1 => Piece::Player1,
            2 => Piece::Player2,
            _ => Piece::Empty,
        }
    }
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum Action {
    Put { index: u8, value: u8 },
    Flick { index: u8, dx: i8, dy: i8 },
}

#[wasm_bindgen]
pub struct GameEngine {
    board: Vec<Piece>,
}

#[wasm_bindgen]
impl GameEngine {
    pub fn new() -> GameEngine {
        GameEngine {
            board: vec![Piece::Empty; BOARD_SIZE],
        }
    }

    pub fn reset(&mut self) {
        self.board = vec![Piece::Empty; BOARD_SIZE];
    }

    pub fn get_board(&self) -> JsValue {
        let board_u8: Vec<u8> = self.board.iter().map(|&piece| piece as u8).collect();
        serde_wasm_bindgen::to_value(&board_u8).unwrap()
    }

    pub fn get_hand_count(&self, player: Piece) -> u8 {
        let mut count = MAX_PIECES_PER_PLAYER as u8;
        for &p in &self.board {
            if p == player {
                count = count.saturating_sub(1);
            }
        }
        count
    }

    pub fn calc_best_action(&self, player: Piece) -> Result<JsValue, JsValue> {
        // return random legal action for now
        let legal_actions = self.generate_legal_actions(player);
        if legal_actions.is_empty() {
            return Err(JsValue::from_str("No legal actions available"));
        }
        let action = &legal_actions[0];
        Ok(serde_wasm_bindgen::to_value(action)?)
    }

    pub fn apply_action(&mut self, action: &JsValue) -> Result<(), JsValue> {
        let action: Action = serde_wasm_bindgen::from_value(action.clone())?;
        match action {
            Action::Put { index, value } => {
                if index as usize >= BOARD_SIZE {
                    return Err(JsValue::from_str("Index out of bounds"));
                }
                self.board[index as usize] = Piece::from(value);
            }
            Action::Flick { index, dx, dy } => {
                if self.board[index as usize] == Piece::Empty {
                    return Err(JsValue::from_str("Cannot flick from an empty cell"));
                }
                if dx == 0 && dy == 0 {
                    return Err(JsValue::from_str("Flick direction cannot be zero"));
                }

                let mut cx = ((index as usize) % BOARD_WIDTH) as isize;
                let mut cy = ((index as usize) / BOARD_WIDTH) as isize;
                loop {
                    let nx = cx + dx as isize;
                    let ny = cy + dy as isize;

                    // 1. 壁判定: 盤外なら終了
                    if nx < 0 || nx >= BOARD_WIDTH as isize || ny < 0 || ny >= BOARD_WIDTH as isize
                    {
                        break;
                    }

                    let current_idx = (cy * BOARD_WIDTH as isize + cx) as usize;
                    let next_idx = (ny * BOARD_WIDTH as isize + nx) as usize;

                    // 2. 次のマスを確認
                    if self.board[next_idx] == Piece::Empty {
                        // 【空マスの場合】
                        // 駒を移動させる (Swap)
                        self.board.swap(current_idx, next_idx);
                    }
                    cx = nx;
                    cy = ny;
                }
            }
        }
        Ok(())
    }
}

impl GameEngine {
    fn generate_legal_actions(&self, player: Piece) -> Vec<Action> {
        let mut actions = Vec::new();

        // 可能なPutアクションの生成フェーズ
        let piece_on_board = self.board.iter().filter(|&&p| p == player).count();
        if piece_on_board < MAX_PIECES_PER_PLAYER {
            for (i, &cell) in self.board.iter().enumerate() {
                let x = i % BOARD_WIDTH;
                let y = i / BOARD_WIDTH;

                // CellがEmptyでない場合はスキップ
                if cell != Piece::Empty {
                    continue;
                }

                // 周辺8マスに同じプレイヤーの駒がある場合はスキップ
                let mut has_adjacent = false;
                for dir in 0..8 {
                    let nx = x as isize + DX[dir];
                    let ny = y as isize + DY[dir];
                    if nx < 0 || nx >= BOARD_WIDTH as isize || ny < 0 || ny >= BOARD_WIDTH as isize
                    {
                        continue;
                    }
                    let nindex = (ny as usize) * BOARD_WIDTH + (nx as usize);
                    if self.board[nindex] == player {
                        has_adjacent = true;
                        break;
                    }
                }
                if has_adjacent {
                    continue;
                }

                // Putアクションを追加
                actions.push(Action::Put {
                    index: i as u8,
                    value: player as u8,
                });
            }
        }

        // 可能なFlickアクションの生成フェーズ

        // return
        actions
    }
}
