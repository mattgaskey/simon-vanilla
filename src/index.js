var model = {
	//used to translate computer choice from random number to 
	//color association
	grid: ['red', 'blue', 'yellow', 'green'],
	//round counter for display and game status check
	round: 0,
	//computer-built sequence
	matchSequence: [],
	//player-built sequence
	playerSequence: [],
	//power toggle
	power: false,
	//turn status handler, keeps user clicks in check
	playerTurn: false
};

var control = {
	//setState function
	setState: function(key, value) {
		model[key] = value;
	},

	getState: function(key) {
		return model[key];
	},

	//add player's game square click to playerSequence array list
	updatePlayerSequence: function(move) {
		if (model.playerTurn) {
			var arrayvar = model.playerSequence;
			arrayvar.push(move);

			control.setState('playerSequence', arrayvar);

			//check game status after every click
			setTimeout(function() {
				return control.checkPlayerMove();
			}, 500);
		}
	},

	//choose random number between 0 and 3 and add the item from 
	//grid array to the matchSequence array
	computerMove: function() {
		view.allowFlash(false);
		var x = Math.floor(Math.random() * 4);
		var move = model.grid[x];
		var arrayvar = model.matchSequence;
		arrayvar.push(move);

		//loop through computerMoveSequence and flash each move with delay
		control.loopThroughMoves(arrayvar);

		control.setState('matchSequence', arrayvar);
		control.setState('playerTurn', true);
		view.allowFlash(true);
	},

	loopThroughMoves: function(arr) {
		var x;
		arr.forEach(function(move, i) {
			var power = control.getState('power');
			if (power === true) {
				x = setTimeout(function() {
					return view.flashGrid(move)
				}, (i+1) * 600);
			} 
			if (power === false) {
				clearTimeout(x);
			} 
		});
	},

	//logic selector to check player moves against the matchSequence
	checkPlayerMove: function() {
		var n = model.playerSequence.length;
		var lastMove = model.playerSequence[n - 1];
		var matchSoFar = model.matchSequence[n - 1];

		//player makes a move which does not match the matchSequence
		if (matchSoFar !== lastMove) {
			control.playerMistake();
			view.updateCounter();
		} 

		//check for end game
		else if (model.matchSequence.length === 4 && model.matchSequence.length === n && matchSoFar === lastMove) {
			control.endgame();
		} 

		//player has successfully matched the entire matchSequence
		else if (model.matchSequence.length === n && matchSoFar === lastMove) {
			control.playerSuccess();
			setTimeout(function() {
				return control.computerMove();
			}, 1000);
		}	

		//becuase player moves are checked after each addition, 
		//no need to check for positive moves that do not complete
		//the round
	},

	endgame: function() {
		view.showModal('end');
		control.setState('round', 1);
		control.setState('playerTurn', false);
		control.setState('matchSequence', []);
		control.setState('playerSequence', []);
		view.updateCounter();
		view.allowFlash(false);
		setTimeout(function() {
				view.allowFlash(true);
				view.showModal();
				control.init();
		}, 2000);
	},

	//reset to initial state
	playerMistake: function() {
		view.showModal('oops!');
		control.setState('round', 1);
		control.setState('playerTurn', false);
		control.setState('matchSequence', []);
		control.setState('playerSequence', []);
		setTimeout(function() {
			return control.init();
		}, 1000);
		setTimeout(function() {
			return view.showModal();
		}, 1000);
	},

	//increment the round, reset playerSequence and add computer move
	//to matchSequence 
	playerSuccess: function() {
		var x = model.round + 1;
		control.setState('round', x);
		control.setState('playerTurn', false);
		control.setState('playerSequence', []);
		view.updateCounter();
	},

	//first round is automatic after init flash
	init: function() {
		view.updateCounter();
		control.computerMove();
	},

	//power off, reset all states
	powerDown: function() {
		control.setState('round', 0);
		control.setState('matchSequence', []);
		control.setState('playerSequence', []);
		control.setState('power', false);
		view.allowFlash(false);
		view.updateCounter();
	},

	//power on and begin init
	powerUp: function() {
		control.setState('matchSequence', []);
		control.setState('round', 1);
		control.setState('power', true);
		view.allowFlash(true);
		setTimeout(function() {
			return control.init();
		}, 1000);

	},

	handleGridClick: function(e) {
		e.preventDefault();
		var color = this.id;
		control.updatePlayerSequence(color);
		view.flashGrid(color);
	},

	handlePowerButton: function() {
		var x = control.getState('power');
		if (x === true) {
			control.powerDown();
			view.powerDownCounter();
		} else if (x === false) {
			control.powerUp();
			view.powerUpCounter();
		}
	},

	start: function() {
		view.render();
	}
};

var red = document.getElementById('red');
var blue = document.getElementById('blue');
var green = document.getElementById('green');
var yellow = document.getElementById('yellow');

var view = {

	render: function() {
		
		var power = document.getElementById('power');
		power.addEventListener('mousedown', function(e) {
			e.preventDefault();
			control.handlePowerButton();
			red.classList.add('flash');
			setTimeout(function(){red.classList.remove('flash')},800);
			blue.classList.add('flash');
			setTimeout(function(){blue.classList.remove('flash')},800);
			green.classList.add('flash');
			setTimeout(function(){green.classList.remove('flash')},800);
			yellow.classList.add('flash');
			setTimeout(function(){yellow.classList.remove('flash')},800);
		});

		view.updateCounter();
	},

	allowFlash: function(x) {
		if (x === true) {
			red.addEventListener('click', control.handleGridClick, true);
			blue.addEventListener('click', control.handleGridClick, true);
			green.addEventListener('click', control.handleGridClick, true);
			yellow.addEventListener('click', control.handleGridClick, true);
		} else if (x === false) {
			red.removeEventListener('click', control.handleGridClick, true);
			blue.removeEventListener('click', control.handleGridClick, true);
			green.removeEventListener('click', control.handleGridClick, true);
			yellow.removeEventListener('click', control.handleGridClick, true);
		}
	},

	powerUpCounter: function() {
		var counter = document.getElementById('counter');
		counter.classList.remove('counter-faded');
	},

	powerDownCounter: function() {
		var counter = document.getElementById('counter');
		counter.classList.add('counter-faded');
	},

	updateCounter: function() {
		var n = control.getState('round');
		var counter = document.getElementById('counter');
		counter.innerHTML = n;
	},

	flashGrid: function(color) {
		var grid = document.getElementById(color);
		grid.classList.add('flash');
		setTimeout(function(){grid.classList.remove('flash')},500);
	},

	showModal: function(msg) {
		var modal = document.getElementById('modal');
		modal.classList.toggle('hidden');
		modal.innerHTML = msg;
	}

};

control.start();