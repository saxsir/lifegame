window.onload = function() {

	function drawGrid(_ctx, _width, _height) {
		this.ctx = _ctx;
		this.width = _width;
		this.height = _height;

		for (var x = 0.5; x < width; x += 10) {
			ctx.moveTo(x, 0);
			ctx.lineTo(x, height);
		}

		for (var y = 0.5; y < height; y += 10) {
			ctx.moveTo(0, y);
			ctx.lineTo(width, y);
		}

		ctx.strokeStyle = "#bbb";
		ctx.stroke();
	}

	var canvas = document.getElementById('field');

	// 未サポートブラウザでの実行を防ぐよ
	if (canvas.getContext) {
		var ctx = canvas.getContext('2d');
		var width = canvas.width = 500;
		var height = canvas.height = 500;

		// 方眼紙っぽく描画してみる
		drawGrid(ctx, width, height);

		// マップ初期化(30 × 30の2次元配列)
		var map_x = width / 10;
		var map_y = height / 10;
		var map = new Array(map_x);
		for (var i = 0; i < map.length; i++) {
			map[i] = new Array(map_y);
			for (var j = 0; j < map[i].length; j++) {
				map[i][j] = 0;
			}
		}
	}

	var generation = document.getElementById("generation");
	var gen_count = 0;
	var live_num = document.getElementById("live_num");
	var live_count = 0;

	// 前回の保存データがあった場合
	var data = JSON.parse(window.localStorage.getItem('life_game'));
	if (data) {
		map = data.map;
		gen_count = data.gen_count;
		$("#rand").attr('disabled', true);
		$("#reset").attr('disabled', false);
	} else {
		// 最初からランダム配置する？
	}

	// 描画
	generation.innerHTML = gen_count;
	//ctx.clearRect(0, 0, width, height);
	drawGrid(ctx, width, height);
	for (var i = 0; i < map_x; i++) {
		for (var j = 0; j < map_y; j++) {
			if (map[i][j] == 1)
				ctx.fillRect(i * 10, j * 10, 10, 10);
		}
	}

	$('#start').click(function() {
		var speed = document.getElementById("speed").value;
		if (speed < 1 || speed == "")
			speed = 1;
		// 隠しコマンド的な...50と100のみスピード対応する
		if (speed != 50 && speed != 100)
			if (speed > 10)
				speed = 10;

		speed = 1000 / speed;
		console.log("1gen / " + speed + "ms");

		timerId = setInterval(function run() {
			// 世代カウントを +1
			gen_count += 1;
			generation.innerHTML = gen_count;

			// 生存判定
			var map_dummy = map;

			for (var i = 1; i < map_x - 1; i++) {
				for (var j = 1; j < map_y - 1; j++) {
					// 一番外側のマスはすべてスルー（だってそのほうが楽なんだも...ry）
					score = map[i-1][j - 1] + map[i-1][j] + map[i-1][j + 1] + map[i][j - 1] + map[i][j + 1] + map[i+1][j - 1] + map[i+1][j] + map[i+1][j + 1];
					if (score == 3)
						map_dummy[i][j] = 1;
					else if (score == 2)
						map_dummy[i][j] = map[i][j]
					else
						map_dummy[i][j] = 0;
				}
			}
			map = map_dummy;

			// 再描画
			ctx.clearRect(0, 0, width, height);
			drawGrid(ctx, width, height);
			live_count = 0;
			for (var i = 0; i < map_x; i++) {
				for (var j = 0; j < map_y; j++) {
					if (map[i][j] == 1) {
						ctx.fillRect(i * 10, j * 10, 10, 10);
						live_count += 1;
					}
				}
			}
			
			// 総生存個体数の表示
			live_num.innerHTML = live_count;

		}, speed);

		// スタートボタンの無効化
		this.disabled = true;
		$("#stop").attr('disabled', false);
		$("#reset").attr('disabled', false);
		$("#save").attr('disabled', false);
		$("#rand").attr('disabled', true);
	});

	$('#stop').click(function() {
		clearInterval(timerId);
		$("#start").attr('disabled', false);
		$("#stop").attr('disabled', true);
	});

	$('#rand').click(function() {		
		for (var i = 1; i < map_x - 1; i++) {
			for (var j = 1; j < map_y - 1; j++) {
				var v = Math.floor(Math.random() * 2); // 50%で0か1
				if(Math.floor(Math.random() * 10 + 1) % 5 != 0) // もし1がでたとしても、80%で0に.（ランダム配置の調整）
					v = 0;
				map[i][j] = v;
			}
		}

		// 再描画
		ctx.clearRect(0, 0, width, height);
		drawGrid(ctx, width, height);
		for (var i = 0; i < map_x; i++) {
			for (var j = 0; j < map_y; j++) {
				if (map[i][j] == 1)
					ctx.fillRect(i * 10, j * 10, 10, 10);
			}
		}

	});

	$('#reset').click(function() {
		// ゲームストップ
		clearInterval(timerId);
		$("#start").attr('disabled', false);
		$("#stop").attr('disabled', true);
		$("#rand").attr('disabled', false);

		// 世代カウントを0に
		gen_count = 0;
		generation.innerHTML = gen_count;

		// フィールドを初期化
		ctx.clearRect(0, 0, width, height);
		drawGrid(ctx, width, height);

		// mapを初期状態（=何もない状態）に戻す
		for (var i = 0; i < map_x; i++) {
			for (var j = 0; j < map_y; j++) {
				map[i][j] = 0;
			}
		}
	});

	$('#save').click(function() {
		var saveData = {
			map : map,
			gen_count : gen_count
		}
		window.localStorage.setItem('life_game', JSON.stringify(saveData));
		window.alert("データを保存しました。 次回起動時は自動でデータがロードされます。");
		$("#save").attr('disabled', true);
	});
}
