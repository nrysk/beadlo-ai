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
    Empty,
    Player1,
    Player2,
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum Action {
    Put { index: u8, value: Piece },
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

    pub fn get_board(&self) -> Vec<u8> {
        self.board.iter().map(|&piece| piece as u8).collect()
    }

    pub fn get_hand_counts(&self) -> Vec<u8> {
        let mut counts = vec![MAX_PIECES_PER_PLAYER as u8; 2];
        for &cell in &self.board {
            match cell {
                Piece::Player1 => counts[0] -= 1,
                Piece::Player2 => counts[1] -= 1,
                Piece::Empty => {}
            }
        }
        counts
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
                self.board[index as usize] = value;
            }
            Action::Flick {
                index: _,
                dx: _,
                dy: _,
            } => {
                // Implement flick logic here
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
                    value: player,
                });
            }
        }

        // 可能なFlickアクションの生成フェーズ

        // return
        actions
    }
}
