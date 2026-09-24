// 游戏状态管理
let currentGame = null;
let canvas, ctx;
let gameState = {
    board: [],
    currentPlayer: 1,
    history: [],
    gameOver: false,
    selectedPiece: null
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('board');
    ctx = canvas.getContext('2d');
    canvas.addEventListener('click', handleClick);
});

// 开始游戏
function startGame(gameType) {
    currentGame = gameType;
    document.getElementById('menu').style.display = 'none';
    document.getElementById('game-container').classList.add('active');
    
    // 重置游戏状态
    gameState = {
        board: [],
        currentPlayer: 1,
        history: [],
        gameOver: false,
        selectedPiece: null
    };
    
    // 根据游戏类型初始化
    switch(gameType) {
        case 'chinese-chess':
            initChineseChess();
            break;
        case 'chess':
            initChess();
            break;
        case 'gomoku':
            initGomoku();
            break;
        case 'tictactoe':
            initTicTacToe();
            break;
        case 'go-19':
            initGo(19);
            break;
        case 'go-9':
            initGo(9);
            break;
    }
    
    updateInfo();
    drawBoard();
}

// 返回菜单
function backToMenu() {
    document.getElementById('menu').style.display = 'grid';
    document.getElementById('game-container').classList.remove('active');
    currentGame = null;
}

// 悔棋
function undo() {
    if (gameState.history.length === 0) {
        showMessage('没有可以悔棋的步骤');
        return;
    }
    
    const lastState = gameState.history.pop();
    gameState.board = JSON.parse(JSON.stringify(lastState.board));
    gameState.currentPlayer = lastState.player;
    gameState.gameOver = false;
    gameState.selectedPiece = null;
    
    updateInfo();
    drawBoard();
    showMessage('已悔棋');
}

// 重新开始
function resetGame() {
    if (currentGame) {
        startGame(currentGame);
        showMessage('游戏已重新开始');
    }
}

// 更新信息显示
function updateInfo() {
    const titles = {
        'chinese-chess': '中国象棋',
        'chess': '国际象棋',
        'gomoku': '五子棋',
        'tictactoe': '井字棋',
        'go-19': '19×19围棋',
        'go-9': '9×9围棋'
    };
    
    document.getElementById('game-title').textContent = titles[currentGame] || '';
    
    if (!gameState.gameOver) {
        const playerNames = {
            1: '红方',
            2: '黑方'
        };
        
        if (currentGame === 'chinese-chess') {
            document.getElementById('game-info').textContent = `当前回合: ${playerNames[gameState.currentPlayer]}`;
        } else if (currentGame === 'chess') {
            const chessPlayers = {1: '白方', 2: '黑方'};
            document.getElementById('game-info').textContent = `当前回合: ${chessPlayers[gameState.currentPlayer]}`;
        } else {
            document.getElementById('game-info').textContent = `当前回合: ${playerNames[gameState.currentPlayer]}`;
        }
    }
}

// 显示消息
function showMessage(msg, timeout = 2000) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = msg;
    setTimeout(() => {
        messageEl.textContent = '';
    }, timeout);
}

// 处理点击
function handleClick(e) {
    if (gameState.gameOver) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    switch(currentGame) {
        case 'chinese-chess':
            handleChineseChessClick(x, y);
            break;
        case 'chess':
            handleChessClick(x, y);
            break;
        case 'gomoku':
            handleGomokuClick(x, y);
            break;
        case 'tictactoe':
            handleTicTacToeClick(x, y);
            break;
        case 'go-19':
        case 'go-9':
            handleGoClick(x, y);
            break;
    }
}

// ==================== 中国象棋 ====================
function initChineseChess() {
    canvas.width = 540;
    canvas.height = 600;
    
    // 初始化棋盘 (10行9列)
    gameState.board = Array(10).fill(0).map(() => Array(9).fill(0));
    
    // 放置棋子 (1=红方, 2=黑方, 类型: 车1,马2,象3,士4,将5,炮6,兵7)
    const initialSetup = [
        [{p:2,t:1},{p:2,t:2},{p:2,t:3},{p:2,t:4},{p:2,t:5},{p:2,t:4},{p:2,t:3},{p:2,t:2},{p:2,t:1}],
        [0,0,0,0,0,0,0,0,0],
        [0,{p:2,t:6},0,0,0,0,0,{p:2,t:6},0],
        [{p:2,t:7},0,{p:2,t:7},0,{p:2,t:7},0,{p:2,t:7},0,{p:2,t:7}],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [{p:1,t:7},0,{p:1,t:7},0,{p:1,t:7},0,{p:1,t:7},0,{p:1,t:7}],
        [0,{p:1,t:6},0,0,0,0,0,{p:1,t:6},0],
        [0,0,0,0,0,0,0,0,0],
        [{p:1,t:1},{p:1,t:2},{p:1,t:3},{p:1,t:4},{p:1,t:5},{p:1,t:4},{p:1,t:3},{p:1,t:2},{p:1,t:1}]
    ];
    
    gameState.board = JSON.parse(JSON.stringify(initialSetup));
    gameState.currentPlayer = 1;
}

function drawChineseChess() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const cellSize = 60;
    const offsetX = 30;
    const offsetY = 30;
    
    // 绘制棋盘线
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    
    // 横线
    for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY + i * cellSize);
        ctx.lineTo(offsetX + 8 * cellSize, offsetY + i * cellSize);
        ctx.stroke();
    }
    
    // 竖线
    for (let i = 0; i < 9; i++) {
        ctx.beginPath();
        ctx.moveTo(offsetX + i * cellSize, offsetY);
        if (i === 0 || i === 8) {
            ctx.lineTo(offsetX + i * cellSize, offsetY + 9 * cellSize);
        } else {
            ctx.lineTo(offsetX + i * cellSize, offsetY + 4 * cellSize);
            ctx.moveTo(offsetX + i * cellSize, offsetY + 5 * cellSize);
            ctx.lineTo(offsetX + i * cellSize, offsetY + 9 * cellSize);
        }
        ctx.stroke();
    }
    
    // 绘制九宫格
    const palaceLines = [
        [[3,0],[5,2]], [[5,0],[3,2]], // 黑方
        [[3,7],[5,9]], [[5,7],[3,9]]  // 红方
    ];
    
    palaceLines.forEach(([[x1,y1],[x2,y2]]) => {
        ctx.beginPath();
        ctx.moveTo(offsetX + x1 * cellSize, offsetY + y1 * cellSize);
        ctx.lineTo(offsetX + x2 * cellSize, offsetY + y2 * cellSize);
        ctx.stroke();
    });
    
    // 绘制"楚河汉界"
    ctx.font = 'bold 20px serif';
    ctx.fillStyle = '#000';
    ctx.fillText('楚 河', offsetX + 60, offsetY + 4.5 * cellSize + 7);
    ctx.fillText('汉 界', offsetX + 300, offsetY + 4.5 * cellSize + 7);
    
    // 绘制棋子
    const pieceNames = {
        1: {1:'車',2:'馬',3:'相',4:'仕',5:'帥',6:'炮',7:'兵'},
        2: {1:'车',2:'马',3:'象',4:'士',5:'将',6:'砲',7:'卒'}
    };
    
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 9; col++) {
            const piece = gameState.board[row][col];
            if (piece && piece.p) {
                const x = offsetX + col * cellSize;
                const y = offsetY + row * cellSize;
                
                // 高亮选中的棋子
                if (gameState.selectedPiece && 
                    gameState.selectedPiece.row === row && 
                    gameState.selectedPiece.col === col) {
                    ctx.fillStyle = '#ffff00';
                    ctx.beginPath();
                    ctx.arc(x, y, 26, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // 绘制棋子圆盘
                ctx.fillStyle = piece.p === 1 ? '#ff4444' : '#333';
                ctx.beginPath();
                ctx.arc(x, y, 24, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // 绘制棋子文字
                ctx.fillStyle = piece.p === 1 ? '#fff' : '#fff';
                ctx.font = 'bold 24px serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(pieceNames[piece.p][piece.t], x, y);
            }
        }
    }
}

function handleChineseChessClick(x, y) {
    const cellSize = 60;
    const offsetX = 30;
    const offsetY = 30;
    
    const col = Math.round((x - offsetX) / cellSize);
    const row = Math.round((y - offsetY) / cellSize);
    
    if (row < 0 || row > 9 || col < 0 || col > 8) return;
    
    const piece = gameState.board[row][col];
    
    if (gameState.selectedPiece) {
        // 尝试移动
        if (isValidChineseChessMove(gameState.selectedPiece.row, gameState.selectedPiece.col, row, col)) {
            // 保存历史
            gameState.history.push({
                board: JSON.parse(JSON.stringify(gameState.board)),
                player: gameState.currentPlayer
            });
            
            // 移动棋子
            gameState.board[row][col] = gameState.board[gameState.selectedPiece.row][gameState.selectedPiece.col];
            gameState.board[gameState.selectedPiece.row][gameState.selectedPiece.col] = 0;
            
            // 检查是否将军
            if (checkChineseChessWin()) {
                gameState.gameOver = true;
                showMessage(`${gameState.currentPlayer === 1 ? '红方' : '黑方'}获胜！`, 5000);
            } else {
                // 切换玩家
                gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
            }
            
            gameState.selectedPiece = null;
            updateInfo();
            drawBoard();
        } else {
            // 如果点击的是自己的棋子，则选中它
            if (piece && piece.p === gameState.currentPlayer) {
                gameState.selectedPiece = {row, col};
                drawBoard();
            } else {
                gameState.selectedPiece = null;
                drawBoard();
            }
        }
    } else {
        // 选择棋子
        if (piece && piece.p === gameState.currentPlayer) {
            gameState.selectedPiece = {row, col};
            drawBoard();
        }
    }
}

function isValidChineseChessMove(fromRow, fromCol, toRow, toCol) {
    const piece = gameState.board[fromRow][fromCol];
    const target = gameState.board[toRow][toCol];
    
    // 不能吃自己的棋子
    if (target && target.p === piece.p) return false;
    
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    
    switch(piece.t) {
        case 1: // 车
            return isValidRookMove(fromRow, fromCol, toRow, toCol);
        case 2: // 马
            return isValidHorseMove(fromRow, fromCol, toRow, toCol);
        case 3: // 象/相
            return isValidElephantMove(fromRow, fromCol, toRow, toCol, piece.p);
        case 4: // 士/仕
            return isValidAdvisorMove(fromRow, fromCol, toRow, toCol, piece.p);
        case 5: // 将/帅
            return isValidGeneralMove(fromRow, fromCol, toRow, toCol, piece.p);
        case 6: // 炮/砲
            return isValidCannonMove(fromRow, fromCol, toRow, toCol);
        case 7: // 兵/卒
            return isValidPawnMove(fromRow, fromCol, toRow, toCol, piece.p);
    }
    
    return false;
}

function isValidRookMove(fromRow, fromCol, toRow, toCol) {
    if (fromRow !== toRow && fromCol !== toCol) return false;
    
    if (fromRow === toRow) {
        const minCol = Math.min(fromCol, toCol);
        const maxCol = Math.max(fromCol, toCol);
        for (let c = minCol + 1; c < maxCol; c++) {
            if (gameState.board[fromRow][c]) return false;
        }
    } else {
        const minRow = Math.min(fromRow, toRow);
        const maxRow = Math.max(fromRow, toRow);
        for (let r = minRow + 1; r < maxRow; r++) {
            if (gameState.board[r][fromCol]) return false;
        }
    }
    
    return true;
}

function isValidHorseMove(fromRow, fromCol, toRow, toCol) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    
    if (!((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))) return false;
    
    // 检查马脚
    if (rowDiff === 2) {
        const blockRow = fromRow + (toRow - fromRow) / 2;
        if (gameState.board[blockRow][fromCol]) return false;
    } else {
        const blockCol = fromCol + (toCol - fromCol) / 2;
        if (gameState.board[fromRow][blockCol]) return false;
    }
    
    return true;
}

function isValidElephantMove(fromRow, fromCol, toRow, toCol, player) {
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    
    if (Math.abs(rowDiff) !== 2 || Math.abs(colDiff) !== 2) return false;
    
    // 不能过河
    if (player === 1 && toRow < 5) return false;
    if (player === 2 && toRow > 4) return false;
    
    // 检查象眼
    const blockRow = fromRow + rowDiff / 2;
    const blockCol = fromCol + colDiff / 2;
    if (gameState.board[blockRow][blockCol]) return false;
    
    return true;
}

function isValidAdvisorMove(fromRow, fromCol, toRow, toCol, player) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    
    if (rowDiff !== 1 || colDiff !== 1) return false;
    
    // 不能出九宫
    if (toCol < 3 || toCol > 5) return false;
    if (player === 1 && (toRow < 7 || toRow > 9)) return false;
    if (player === 2 && (toRow < 0 || toRow > 2)) return false;
    
    return true;
}

function isValidGeneralMove(fromRow, fromCol, toRow, toCol, player) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    
    if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
        // 不能出九宫
        if (toCol < 3 || toCol > 5) return false;
        if (player === 1 && (toRow < 7 || toRow > 9)) return false;
        if (player === 2 && (toRow < 0 || toRow > 2)) return false;
        return true;
    }
    
    return false;
}

function isValidCannonMove(fromRow, fromCol, toRow, toCol) {
    if (fromRow !== toRow && fromCol !== toCol) return false;
    
    let count = 0;
    
    if (fromRow === toRow) {
        const minCol = Math.min(fromCol, toCol);
        const maxCol = Math.max(fromCol, toCol);
        for (let c = minCol + 1; c < maxCol; c++) {
            if (gameState.board[fromRow][c]) count++;
        }
    } else {
        const minRow = Math.min(fromRow, toRow);
        const maxRow = Math.max(fromRow, toRow);
        for (let r = minRow + 1; r < maxRow; r++) {
            if (gameState.board[r][fromCol]) count++;
        }
    }
    
    const target = gameState.board[toRow][toCol];
    
    // 不吃子时中间不能有棋子
    if (!target && count === 0) return true;
    
    // 吃子时中间必须有一个棋子
    if (target && count === 1) return true;
    
    return false;
}

function isValidPawnMove(fromRow, fromCol, toRow, toCol, player) {
    const rowDiff = toRow - fromRow;
    const colDiff = Math.abs(toCol - fromCol);
    
    if (player === 1) {
        // 红方兵只能向上走
        if (fromRow >= 5) {
            // 未过河，只能前进
            if (rowDiff === -1 && colDiff === 0) return true;
        } else {
            // 已过河，可以前进或左右
            if ((rowDiff === -1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) return true;
        }
    } else {
        // 黑方卒只能向下走
        if (fromRow <= 4) {
            // 未过河，只能前进
            if (rowDiff === 1 && colDiff === 0) return true;
        } else {
            // 已过河，可以前进或左右
            if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) return true;
        }
    }
    
    return false;
}

function checkChineseChessWin() {
    let redGeneral = false;
    let blackGeneral = false;
    
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 9; col++) {
            const piece = gameState.board[row][col];
            if (piece && piece.t === 5) {
                if (piece.p === 1) redGeneral = true;
                if (piece.p === 2) blackGeneral = true;
            }
        }
    }
    
    return !redGeneral || !blackGeneral;
}

// ==================== 国际象棋 ====================
function initChess() {
    canvas.width = 480;
    canvas.height = 480;
    
    // 初始化棋盘 (8x8)
    gameState.board = Array(8).fill(0).map(() => Array(8).fill(0));
    
    // 棋子类型: K=王,Q=后,R=车,B=象,N=马,P=兵
    const initialSetup = [
        [{p:2,t:'R'},{p:2,t:'N'},{p:2,t:'B'},{p:2,t:'Q'},{p:2,t:'K'},{p:2,t:'B'},{p:2,t:'N'},{p:2,t:'R'}],
        Array(8).fill(0).map(() => ({p:2,t:'P'})),
        Array(8).fill(0),
        Array(8).fill(0),
        Array(8).fill(0),
        Array(8).fill(0),
        Array(8).fill(0).map(() => ({p:1,t:'P'})),
        [{p:1,t:'R'},{p:1,t:'N'},{p:1,t:'B'},{p:1,t:'Q'},{p:1,t:'K'},{p:1,t:'B'},{p:1,t:'N'},{p:1,t:'R'}]
    ];
    
    gameState.board = JSON.parse(JSON.stringify(initialSetup));
    gameState.currentPlayer = 1;
}

function drawChess() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const cellSize = 60;
    
    // 绘制棋盘格子
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            ctx.fillStyle = (row + col) % 2 === 0 ? '#f0d9b5' : '#b58863';
            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
    }
    
    // 高亮选中的格子
    if (gameState.selectedPiece) {
        const row = gameState.selectedPiece.row;
        const col = gameState.selectedPiece.col;
        ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
    }
    
    // 绘制棋子
    const pieceSymbols = {
        'K': '♔♚', 'Q': '♕♛', 'R': '♖♜',
        'B': '♗♝', 'N': '♘♞', 'P': '♙♟'
    };
    
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = gameState.board[row][col];
            if (piece && piece.p) {
                const symbols = pieceSymbols[piece.t];
                ctx.fillStyle = piece.p === 1 ? '#fff' : '#000';
                ctx.strokeStyle = piece.p === 1 ? '#000' : '#fff';
                ctx.lineWidth = 1;
                
                const symbol = piece.p === 1 ? symbols[0] : symbols[1];
                const x = col * cellSize + cellSize / 2;
                const y = row * cellSize + cellSize / 2;
                
                ctx.strokeText(symbol, x, y);
                ctx.fillText(symbol, x, y);
            }
        }
    }
}

function handleChessClick(x, y) {
    const cellSize = 60;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    
    if (row < 0 || row > 7 || col < 0 || col > 7) return;
    
    const piece = gameState.board[row][col];
    
    if (gameState.selectedPiece) {
        if (isValidChessMove(gameState.selectedPiece.row, gameState.selectedPiece.col, row, col)) {
            // 保存历史
            gameState.history.push({
                board: JSON.parse(JSON.stringify(gameState.board)),
                player: gameState.currentPlayer
            });
            
            // 移动棋子
            gameState.board[row][col] = gameState.board[gameState.selectedPiece.row][gameState.selectedPiece.col];
            gameState.board[gameState.selectedPiece.row][gameState.selectedPiece.col] = 0;
            
            // 检查是否将死
            if (checkChessWin()) {
                gameState.gameOver = true;
                showMessage(`${gameState.currentPlayer === 1 ? '白方' : '黑方'}获胜！`, 5000);
            } else {
                gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
            }
            
            gameState.selectedPiece = null;
            updateInfo();
            drawBoard();
        } else {
            if (piece && piece.p === gameState.currentPlayer) {
                gameState.selectedPiece = {row, col};
                drawBoard();
            } else {
                gameState.selectedPiece = null;
                drawBoard();
            }
        }
    } else {
        if (piece && piece.p === gameState.currentPlayer) {
            gameState.selectedPiece = {row, col};
            drawBoard();
        }
    }
}

function isValidChessMove(fromRow, fromCol, toRow, toCol) {
    const piece = gameState.board[fromRow][fromCol];
    const target = gameState.board[toRow][toCol];
    
    if (target && target.p === piece.p) return false;
    
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    
    switch(piece.t) {
        case 'K': // 王
            return rowDiff <= 1 && colDiff <= 1;
        case 'Q': // 后
            return isValidQueenMove(fromRow, fromCol, toRow, toCol);
        case 'R': // 车
            return isValidChessRookMove(fromRow, fromCol, toRow, toCol);
        case 'B': // 象
            return isValidBishopMove(fromRow, fromCol, toRow, toCol);
        case 'N': // 马
            return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
        case 'P': // 兵
            return isValidChessPawnMove(fromRow, fromCol, toRow, toCol, piece.p, target);
    }
    
    return false;
}

function isValidQueenMove(fromRow, fromCol, toRow, toCol) {
    return isValidChessRookMove(fromRow, fromCol, toRow, toCol) || 
           isValidBishopMove(fromRow, fromCol, toRow, toCol);
}

function isValidChessRookMove(fromRow, fromCol, toRow, toCol) {
    if (fromRow !== toRow && fromCol !== toCol) return false;
    
    if (fromRow === toRow) {
        const minCol = Math.min(fromCol, toCol);
        const maxCol = Math.max(fromCol, toCol);
        for (let c = minCol + 1; c < maxCol; c++) {
            if (gameState.board[fromRow][c]) return false;
        }
    } else {
        const minRow = Math.min(fromRow, toRow);
        const maxRow = Math.max(fromRow, toRow);
        for (let r = minRow + 1; r < maxRow; r++) {
            if (gameState.board[r][fromCol]) return false;
        }
    }
    
    return true;
}

function isValidBishopMove(fromRow, fromCol, toRow, toCol) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    
    if (rowDiff !== colDiff) return false;
    
    const rowDir = toRow > fromRow ? 1 : -1;
    const colDir = toCol > fromCol ? 1 : -1;
    
    let r = fromRow + rowDir;
    let c = fromCol + colDir;
    
    while (r !== toRow && c !== toCol) {
        if (gameState.board[r][c]) return false;
        r += rowDir;
        c += colDir;
    }
    
    return true;
}

function isValidChessPawnMove(fromRow, fromCol, toRow, toCol, player, target) {
    const direction = player === 1 ? -1 : 1;
    const startRow = player === 1 ? 6 : 1;
    
    // 向前移动
    if (fromCol === toCol && !target) {
        if (toRow === fromRow + direction) return true;
        if (fromRow === startRow && toRow === fromRow + 2 * direction) {
            const middleRow = fromRow + direction;
            return !gameState.board[middleRow][fromCol];
        }
    }
    
    // 斜向吃子
    if (Math.abs(toCol - fromCol) === 1 && toRow === fromRow + direction && target) {
        return true;
    }
    
    return false;
}

function checkChessWin() {
    let whiteKing = false;
    let blackKing = false;
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = gameState.board[row][col];
            if (piece && piece.t === 'K') {
                if (piece.p === 1) whiteKing = true;
                if (piece.p === 2) blackKing = true;
            }
        }
    }
    
    return !whiteKing || !blackKing;
}

// ==================== 五子棋 ====================
function initGomoku() {
    canvas.width = 600;
    canvas.height = 600;
    
    gameState.board = Array(15).fill(0).map(() => Array(15).fill(0));
    gameState.currentPlayer = 1;
}

function drawGomoku() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const cellSize = 40;
    const offset = 20;
    
    // 绘制棋盘
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        ctx.moveTo(offset, offset + i * cellSize);
        ctx.lineTo(offset + 14 * cellSize, offset + i * cellSize);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(offset + i * cellSize, offset);
        ctx.lineTo(offset + i * cellSize, offset + 14 * cellSize);
        ctx.stroke();
    }
    
    // 绘制星位
    const stars = [[3,3],[3,11],[11,3],[11,11],[7,7]];
    ctx.fillStyle = '#000';
    stars.forEach(([row, col]) => {
        ctx.beginPath();
        ctx.arc(offset + col * cellSize, offset + row * cellSize, 4, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 绘制棋子
    for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
            const piece = gameState.board[row][col];
            if (piece) {
                const x = offset + col * cellSize;
                const y = offset + row * cellSize;
                
                ctx.fillStyle = piece === 1 ? '#000' : '#fff';
                ctx.beginPath();
                ctx.arc(x, y, 16, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }
}

function handleGomokuClick(x, y) {
    const cellSize = 40;
    const offset = 20;
    
    const col = Math.round((x - offset) / cellSize);
    const row = Math.round((y - offset) / cellSize);
    
    if (row < 0 || row > 14 || col < 0 || col > 14) return;
    if (gameState.board[row][col]) return;
    
    // 保存历史
    gameState.history.push({
        board: JSON.parse(JSON.stringify(gameState.board)),
        player: gameState.currentPlayer
    });
    
    gameState.board[row][col] = gameState.currentPlayer;
    
    if (checkGomokuWin(row, col)) {
        gameState.gameOver = true;
        showMessage(`${gameState.currentPlayer === 1 ? '黑方' : '白方'}获胜！`, 5000);
    } else {
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    }
    
    updateInfo();
    drawBoard();
}

function checkGomokuWin(row, col) {
    const player = gameState.board[row][col];
    const directions = [[1,0],[0,1],[1,1],[1,-1]];
    
    for (const [dr, dc] of directions) {
        let count = 1;
        
        // 正方向
        let r = row + dr;
        let c = col + dc;
        while (r >= 0 && r < 15 && c >= 0 && c < 15 && gameState.board[r][c] === player) {
            count++;
            r += dr;
            c += dc;
        }
        
        // 反方向
        r = row - dr;
        c = col - dc;
        while (r >= 0 && r < 15 && c >= 0 && c < 15 && gameState.board[r][c] === player) {
            count++;
            r -= dr;
            c -= dc;
        }
        
        if (count >= 5) return true;
    }
    
    return false;
}

// ==================== 井字棋 ====================
function initTicTacToe() {
    canvas.width = 400;
    canvas.height = 400;
    
    gameState.board = Array(3).fill(0).map(() => Array(3).fill(0));
    gameState.currentPlayer = 1;
}

function drawTicTacToe() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const cellSize = 133.33;
    
    // 绘制网格
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    
    for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, 400);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(400, i * cellSize);
        ctx.stroke();
    }
    
    // 绘制X和O
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const piece = gameState.board[row][col];
            const x = col * cellSize + cellSize / 2;
            const y = row * cellSize + cellSize / 2;
            const size = 40;
            
            if (piece === 1) {
                // 绘制X
                ctx.strokeStyle = '#e74c3c';
                ctx.beginPath();
                ctx.moveTo(x - size, y - size);
                ctx.lineTo(x + size, y + size);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(x + size, y - size);
                ctx.lineTo(x - size, y + size);
                ctx.stroke();
            } else if (piece === 2) {
                // 绘制O
                ctx.strokeStyle = '#3498db';
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }
}

function handleTicTacToeClick(x, y) {
    const cellSize = 133.33;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    
    if (row < 0 || row > 2 || col < 0 || col > 2) return;
    if (gameState.board[row][col]) return;
    
    // 保存历史
    gameState.history.push({
        board: JSON.parse(JSON.stringify(gameState.board)),
        player: gameState.currentPlayer
    });
    
    gameState.board[row][col] = gameState.currentPlayer;
    
    if (checkTicTacToeWin()) {
        gameState.gameOver = true;
        showMessage(`${gameState.currentPlayer === 1 ? 'X' : 'O'}获胜！`, 5000);
    } else if (checkTicTacToeDraw()) {
        gameState.gameOver = true;
        showMessage('平局！', 5000);
    } else {
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    }
    
    updateInfo();
    drawBoard();
}

function checkTicTacToeWin() {
    const b = gameState.board;
    const player = gameState.currentPlayer;
    
    // 检查行
    for (let i = 0; i < 3; i++) {
        if (b[i][0] === player && b[i][1] === player && b[i][2] === player) return true;
    }
    
    // 检查列
    for (let i = 0; i < 3; i++) {
        if (b[0][i] === player && b[1][i] === player && b[2][i] === player) return true;
    }
    
    // 检查对角线
    if (b[0][0] === player && b[1][1] === player && b[2][2] === player) return true;
    if (b[0][2] === player && b[1][1] === player && b[2][0] === player) return true;
    
    return false;
}

function checkTicTacToeDraw() {
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            if (gameState.board[row][col] === 0) return false;
        }
    }
    return true;
}

// ==================== 围棋 ====================
function initGo(size) {
    const canvasSize = size === 19 ? 760 : 400;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    gameState.board = Array(size).fill(0).map(() => Array(size).fill(0));
    gameState.currentPlayer = 1;
    gameState.boardSize = size;
    gameState.capturedStones = {1: 0, 2: 0};
}

function drawGo() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const size = gameState.boardSize;
    const cellSize = (canvas.width - 40) / (size - 1);
    const offset = 20;
    
    // 绘制棋盘
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < size; i++) {
        ctx.beginPath();
        ctx.moveTo(offset, offset + i * cellSize);
        ctx.lineTo(offset + (size - 1) * cellSize, offset + i * cellSize);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(offset + i * cellSize, offset);
        ctx.lineTo(offset + i * cellSize, offset + (size - 1) * cellSize);
        ctx.stroke();
    }
    
    // 绘制星位
    const stars = size === 19 
        ? [[3,3],[3,9],[3,15],[9,3],[9,9],[9,15],[15,3],[15,9],[15,15]]
        : [[2,2],[2,6],[6,2],[6,6],[4,4]];
    
    ctx.fillStyle = '#000';
    stars.forEach(([row, col]) => {
        ctx.beginPath();
        ctx.arc(offset + col * cellSize, offset + row * cellSize, 4, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 绘制棋子
    const stoneSize = cellSize * 0.45;
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const piece = gameState.board[row][col];
            if (piece) {
                const x = offset + col * cellSize;
                const y = offset + row * cellSize;
                
                ctx.fillStyle = piece === 1 ? '#000' : '#fff';
                ctx.beginPath();
                ctx.arc(x, y, stoneSize, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }
    
    // 显示提子数
    ctx.fillStyle = '#000';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`黑方提子: ${gameState.capturedStones[1]}`, 10, canvas.height - 10);
    ctx.fillText(`白方提子: ${gameState.capturedStones[2]}`, canvas.width - 120, canvas.height - 10);
}

function handleGoClick(x, y) {
    const size = gameState.boardSize;
    const cellSize = (canvas.width - 40) / (size - 1);
    const offset = 20;
    
    const col = Math.round((x - offset) / cellSize);
    const row = Math.round((y - offset) / cellSize);
    
    if (row < 0 || row >= size || col < 0 || col >= size) return;
    if (gameState.board[row][col]) return;
    
    // 保存历史
    gameState.history.push({
        board: JSON.parse(JSON.stringify(gameState.board)),
        player: gameState.currentPlayer,
        capturedStones: {...gameState.capturedStones}
    });
    
    gameState.board[row][col] = gameState.currentPlayer;
    
    // 检查提子
    const opponent = gameState.currentPlayer === 1 ? 2 : 1;
    const directions = [[0,1],[1,0],[0,-1],[-1,0]];
    
    // 先检查对方的棋子是否被提
    for (const [dr, dc] of directions) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && gameState.board[nr][nc] === opponent) {
            if (!hasLiberty(nr, nc, size)) {
                const captured = removeGroup(nr, nc, size);
                gameState.capturedStones[gameState.currentPlayer] += captured;
            }
        }
    }
    
    // 检查自己是否自杀（没有气）
    if (!hasLiberty(row, col, size)) {
        // 自杀手，取消这步棋
        gameState.board[row][col] = 0;
        gameState.history.pop();
        showMessage('此位置无气，不能落子');
        return;
    }
    
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    updateInfo();
    drawBoard();
}

function hasLiberty(row, col, size) {
    const player = gameState.board[row][col];
    const visited = Array(size).fill(0).map(() => Array(size).fill(false));
    const stack = [[row, col]];
    visited[row][col] = true;
    
    const directions = [[0,1],[1,0],[0,-1],[-1,0]];
    
    while (stack.length > 0) {
        const [r, c] = stack.pop();
        
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            
            if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
            if (visited[nr][nc]) continue;
            
            if (gameState.board[nr][nc] === 0) return true; // 找到气
            if (gameState.board[nr][nc] === player) {
                visited[nr][nc] = true;
                stack.push([nr, nc]);
            }
        }
    }
    
    return false;
}

function removeGroup(row, col, size) {
    const player = gameState.board[row][col];
    const stack = [[row, col]];
    const toRemove = [];
    const visited = Array(size).fill(0).map(() => Array(size).fill(false));
    visited[row][col] = true;
    
    const directions = [[0,1],[1,0],[0,-1],[-1,0]];
    
    while (stack.length > 0) {
        const [r, c] = stack.pop();
        toRemove.push([r, c]);
        
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            
            if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
            if (visited[nr][nc]) continue;
            if (gameState.board[nr][nc] !== player) continue;
            
            visited[nr][nc] = true;
            stack.push([nr, nc]);
        }
    }
    
    toRemove.forEach(([r, c]) => {
        gameState.board[r][c] = 0;
    });
    
    return toRemove.length;
}

// ==================== 通用绘制函数 ====================
function drawBoard() {
    switch(currentGame) {
        case 'chinese-chess':
            drawChineseChess();
            break;
        case 'chess':
            drawChess();
            break;
        case 'gomoku':
            drawGomoku();
            break;
        case 'tictactoe':
            drawTicTacToe();
            break;
        case 'go-19':
        case 'go-9':
            drawGo();
            break;
    }
}
