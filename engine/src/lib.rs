use std::vec;

use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

const INF: i32 = 1_000_000_000;
const BOARD_WIDTH: usize = 5;
const BOARD_SIZE: usize = BOARD_WIDTH * BOARD_WIDTH;
const MAX_PIECES_PER_PLAYER: usize = 5;
const DX: [isize; 8] = [-1, 0, 1, -1, 1, -1, 0, 1];
const DY: [isize; 8] = [-1, -1, -1, 0, 0, 1, 1, 1];

// 評価関数用の定数
const WIN_SCORE: i32 = 1_000_000;
const REACH_SCORE: i32 = 1_000;
const PIECE_SCORE: i32 = 800;

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
pub enum Piece {
    Empty = 0,
    Player1 = 1,
    Player2 = 2,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(tag = "type", content = "data")]
pub enum Action {
    Put { index: u8, value: Piece },
    Flick { index: u8, dx: i8, dy: i8 },
    // for Edit
    Pick { index: u8 },
}

#[wasm_bindgen]
#[derive(Clone)]
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

    pub fn get_hand_count(&self, player: Piece) -> u8 {
        let mut count = MAX_PIECES_PER_PLAYER as u8;
        for &p in &self.board {
            if p == player {
                count = count.saturating_sub(1);
            }
        }
        count
    }

    pub fn calc_best_action(&self, player: Piece, depth: usize) -> Result<JsValue, JsValue> {
        let (best_score, best_action) = self.alpha_beta(player, depth, -INF, INF);

        match best_action {
            Some(action) => Ok(serde_wasm_bindgen::to_value(&action)?),
            None => Err(JsValue::from_str("No valid actions available")),
        }
    }

    pub fn apply_action(&mut self, action: &JsValue) -> Result<(), JsValue> {
        let action: Action = serde_wasm_bindgen::from_value(action.clone())?;
        match self.apply_action_internal(&action) {
            Ok(_) => Ok(()),
            Err(e) => Err(JsValue::from_str(e)),
        }
    }
}

#[wasm_bindgen]
impl GameEngine {
    pub fn debug_legal_actions(&self, player: Piece) -> JsValue {
        let actions = self.generate_legal_actions(player);
        serde_wasm_bindgen::to_value(&actions).unwrap()
    }

    fn apply_action_internal(&mut self, action: &Action) -> Result<(), &'static str> {
        match action {
            Action::Put { index, value } => {
                if *index as usize >= BOARD_SIZE {
                    return Err("Index out of bounds");
                }
                self.board[*index as usize] = *value;
            }
            Action::Flick { index, dx, dy } => {
                if *index as usize >= BOARD_SIZE {
                    return Err("Index out of bounds");
                }
                if self.board[*index as usize] == Piece::Empty {
                    return Err("Cannot flick from an empty cell");
                }
                if *dx == 0 && *dy == 0 {
                    return Err("Flick direction cannot be zero");
                }

                let mut cx = ((*index as usize) % BOARD_WIDTH) as isize;
                let mut cy = ((*index as usize) / BOARD_WIDTH) as isize;
                loop {
                    let nx = cx + *dx as isize;
                    let ny = cy + *dy as isize;

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
            Action::Pick { index } => {
                if *index as usize >= BOARD_SIZE {
                    return Err("Index out of bounds");
                }
                self.board[*index as usize] = Piece::Empty;
            }
        }
        Ok(())
    }

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
        // 変化しないFlickは除外
        // 壁に当たるまでに空マスがあれば有効なFlickとする
        for (i, &p) in self.board.iter().enumerate() {
            if p != player {
                continue;
            }
            for dir in 0..8 {
                let dx = DX[dir];
                let dy = DY[dir];

                let mut cx = (i % BOARD_WIDTH) as isize;
                let mut cy = (i / BOARD_WIDTH) as isize;
                let mut can_flick = false;

                loop {
                    let nx = cx + dx;
                    let ny = cy + dy;

                    // 1. 壁判定: 盤外なら終了
                    if nx < 0 || nx >= BOARD_WIDTH as isize || ny < 0 || ny >= BOARD_WIDTH as isize
                    {
                        break;
                    }

                    let next_idx = (ny * BOARD_WIDTH as isize + nx) as usize;
                    // 2. 次のマスを確認
                    if self.board[next_idx] == Piece::Empty {
                        can_flick = true;
                        break;
                    }
                    cx = nx;
                    cy = ny;
                }
                if can_flick {
                    actions.push(Action::Flick {
                        index: i as u8,
                        dx: dx as i8,
                        dy: dy as i8,
                    });
                }
            }
        }
        // return
        actions
    }

    fn alpha_beta(
        &self,
        player: Piece,
        depth: usize,
        mut alpha: i32,
        mut beta: i32,
    ) -> (i32, Option<Action>) {
        let score = self.evaluate(player);

        if depth == 0 || score.abs() >= WIN_SCORE / 2 {
            return (score, None);
        }

        let legal_actions = self.generate_legal_actions(player);
        // 打つ手は絶対に存在するが，念のためのガード
        if legal_actions.is_empty() {
            return (score, None);
        }

        let mut best_score = -INF;
        let mut best_action = None;

        for action in legal_actions {
            let mut next_engine = self.clone();
            if next_engine.apply_action_internal(&action).is_err() {
                continue;
            }
            // actionを適用できたら次の手番へ
            let opponent = Self::get_opponent(player);
            let (opponent_score, _) = next_engine.alpha_beta(opponent, depth - 1, -beta, -alpha);

            let current_score = -opponent_score;
            if current_score > best_score {
                best_score = current_score;
                best_action = Some(action.clone());
            }

            if best_score > alpha {
                alpha = best_score;
            }
            if alpha >= beta {
                break; // Betaカット
            }
        }
        (best_score, best_action)
    }

    // player視点での評価値を返す
    // 勝利（三並び）: +WIN_SCORE
    // リーチ（二並び）: +REACH_SCORE per reach
    // 駒の数: +PIECE_SCORE per piece
    fn evaluate(&self, player: Piece) -> i32 {
        let opponent = Self::get_opponent(player);
        let directions: [(isize, isize); 4] = [
            (1, 0),  // 右
            (0, 1),  // 下
            (1, 1),  // 右下
            (1, -1), // 右上
        ];

        let mut score = 0;

        for y in 0..BOARD_WIDTH {
            for x in 0..BOARD_WIDTH {
                let index = Self::xy_to_index(x, y);
                let piece = self.board[index];
                if piece == Piece::Empty {
                    continue;
                }

                // 駒数の評価
                if piece == player {
                    score += PIECE_SCORE;
                } else if piece == opponent {
                    score -= PIECE_SCORE;
                }

                // 三並び・二並びの評価
                for &(dx, dy) in &directions {
                    let p1_x = x as isize;
                    let p1_y = y as isize;
                    let p2_x = p1_x + dx;
                    let p2_y = p1_y + dy;
                    let p3_x = p1_x + 2 * dx;
                    let p3_y = p1_y + 2 * dy;
                    // 盤外チェック
                    if p2_x < 0
                        || p2_x >= BOARD_WIDTH as isize
                        || p2_y < 0
                        || p2_y >= BOARD_WIDTH as isize
                        || p3_x < 0
                        || p3_x >= BOARD_WIDTH as isize
                        || p3_y < 0
                        || p3_y >= BOARD_WIDTH as isize
                    {
                        continue;
                    }

                    let p1 = self.board[Self::xy_to_index(x, y)];
                    let p2 = self.board[Self::xy_to_index(p2_x as usize, p2_y as usize)];
                    let p3 = self.board[Self::xy_to_index(p3_x as usize, p3_y as usize)];

                    let count = (p1 == player) as i8 + (p2 == player) as i8 + (p3 == player) as i8
                        - (p1 == opponent) as i8
                        - (p2 == opponent) as i8
                        - (p3 == opponent) as i8;

                    score += match count {
                        3 => WIN_SCORE,
                        2 => REACH_SCORE,
                        -2 => -REACH_SCORE,
                        -3 => -WIN_SCORE,
                        _ => 0,
                    }
                }
            }
        }
        score
    }

    // --- Helper関数 ---
    fn index_to_xy(index: usize) -> (usize, usize) {
        (index % BOARD_WIDTH, index / BOARD_WIDTH)
    }

    fn xy_to_index(x: usize, y: usize) -> usize {
        y * BOARD_WIDTH + x
    }

    fn get_opponent(player: Piece) -> Piece {
        match player {
            Piece::Player1 => Piece::Player2,
            Piece::Player2 => Piece::Player1,
            _ => Piece::Empty,
        }
    }
}
